import {
  ChainId,
  ErrorDisplay,
  ExchangeId,
  IProviderUserInfo,
  SupportedPortfolio,
  Token,
  TokenSymbol,
} from '../../core/models/types';
import { merge, Observable, Subject } from 'rxjs';
import {
  catchError,
  filter,
  map,
  mergeMap,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { combineLatest } from 'rxjs/internal/observable/combineLatest';
import BigNumber from 'bignumber.js';
import { of } from 'rxjs/internal/observable/of';
import { AddressUtils } from '../utils/address.utils';
import Web3 from 'web3';
import { TokenUtil } from '../utils/token.util';
import { ConnectorService } from '../../core/services/connector.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DevUtil } from '../utils/dev-util';
import { LogLevel } from '../utils/dev-util-log-level';

@Injectable({ providedIn: 'root' })
export class TokenBalanceService {
  public static SUPPORTED_BUY_REEF_TOKENS = [
    { tokenSymbol: TokenSymbol.ETH, src: 'eth.png' },
    { tokenSymbol: TokenSymbol.USDT, src: 'usdt.png' },
  ];

  public static REEF_PROTOCOL_TOKENS = [
    ...TokenBalanceService.SUPPORTED_BUY_REEF_TOKENS,
    { tokenSymbol: TokenSymbol.REEF, src: 'reef.png' },
    { tokenSymbol: TokenSymbol.REEF_WETH_POOL, src: 'reef_weth.png' },
    { tokenSymbol: TokenSymbol.REEF_USDT_POOL, src: 'reef_usdt.png' },
  ];
  private static COVALENT_SUPPORTED_NETWORK_IDS = [
    ChainId.MAINNET,
    ChainId.MATIC,
  ];
  private static PORTFOLIO_SUPPORTED_EXCHANGE_IDS = [
    ExchangeId.UNISWAP_V2,
    ExchangeId.COMPOUND,
  ];
  public refreshBalancesForAddress = new Subject<string>();
  public updateTokensInBalances = new Subject<TokenSymbol[]>();
  private balancesByAddr = new Map<string, Observable<any>>();
  private reefNodeApi = environment.reefNodeApiUrl;
  public chainSupportedPortfolio(chainId: ChainId): boolean{
    // atm we only support Covalent portfolio data
    let indexOf = TokenBalanceService.COVALENT_SUPPORTED_NETWORK_IDS.indexOf(chainId);
    DevUtil.devLog('chainSupportedPortfolio VAL=', indexOf);

    return indexOf > -1;
  }

  constructor(
    private connectorService: ConnectorService,
    private http: HttpClient
  ) {}

  getPortfolio(address: string): Observable<SupportedPortfolio> {
    const tokenPortfolio$ = this.getTokenBalances$(address).pipe(
      map((tokens) => ({ tokens })),
      shareReplay(1)
    ) as Observable<SupportedPortfolio>;

    const uniPositionsPortfolio$ = tokenPortfolio$.pipe(
      switchMap((tokens: SupportedPortfolio) =>
        this.getUniswapPositions(address, tokens)
      ),
      shareReplay(1)
    );

    const compPositionsPortfolio$ = uniPositionsPortfolio$.pipe(
      switchMap((uniPortfolio) =>
        this.getCompoundPositions(address, uniPortfolio)
      )
    );
    return merge(
      tokenPortfolio$,
      uniPositionsPortfolio$,
      compPositionsPortfolio$
    );
  }

  private getCompoundPositions(
    address: string,
    portfolio: SupportedPortfolio
  ): Observable<SupportedPortfolio> {
    return this.getExchangePositions$(ExchangeId.COMPOUND, address).pipe(
      map((cPos) => {
        const compoundPositions = cPos.compound.balances.map(
          (x) => x.supply_tokens
        );
        return { ...portfolio, compoundPositions };
      }),
      shareReplay(1),
      catchError((e) => {
        return of({
          ...portfolio,
          compoundPositions: new ErrorDisplay('Error getting data'),
        });
      })
    );
  }

  private getUniswapPositions(
    address: string,
    portfolio: SupportedPortfolio
  ): Observable<SupportedPortfolio> {
    return this.getExchangePositions$(ExchangeId.UNISWAP_V2, address).pipe(
      map((uPos) => {
        const uniswapPositions = uPos.uniswap_v2.balances
          .map((x) => {
            ['pool_token', 'token_0', 'token_1'].forEach((t) => {
              // TODO use method for display decimals
              x[t].balance = x[t].balance / +`1e${x[t].contract_decimals}`;
            });
            return x;
          })
          .filter(
            (x) => x.pool_token.quote_rate !== 0 && x.pool_token.quote >= 2
          );
        return { ...portfolio, uniswapPositions };
      }),
      shareReplay(1),
      catchError((e) => {
        return of({
          ...portfolio,
          uniswapPositions: new ErrorDisplay('Error getting uniswap positions'),
        });
      })
    );
  }

  getExchangePositions$(
    exchangeId: ExchangeId,
    address: string
  ): Observable<any> {
    return this.http
      .get(`${this.reefNodeApi}/dashboard/${address}/${exchangeId}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return of([]);
        })
      );
  }

  getTokenBalances$(address: string): Observable<Token[]> {
    if (!address) {
      console.warn('getTokenBalances NO PARAMS');
      return null;
    }
    if (!this.balancesByAddr.has(address)) {
      const refreshForAddr$ = this.refreshBalancesForAddress.pipe(
        startWith(address),
        filter((addr) => addr === address)
      );
      const requestedAddressBalances$ = combineLatest([
        refreshForAddr$,
        this.connectorService.providerUserInfo$,
      ]).pipe(
        switchMap(([addr, info]: [string, IProviderUserInfo]) =>
          this.getAddressTokenBalances$(addr, info)
        ),
        catchError((err) => {
          throw new Error(err);
        }),
        shareReplay(1)
      );
      const updateBalanceForTokens$: Observable<{
        tokenSymbols: TokenSymbol[];
        isIncludedInBalances: boolean;
      }> = this.updateTokensInBalances.pipe(
        map((t: TokenSymbol[]) => {
          return {
            tokenSymbols: Array.from(new Set(t)),
            isIncludedInBalances: false,
          };
        }),
        startWith(null),
        shareReplay(1)
      );

      const finalBalances$ = combineLatest([
        requestedAddressBalances$,
        updateBalanceForTokens$,
      ]).pipe(
        mergeMap(
          ([cachedBalances, localUpdate]: [
            Token[],
            {
              tokenSymbols: TokenSymbol[];
              isIncludedInBalances: boolean;
            }
          ]) => {
            if (
              !!localUpdate &&
              !!localUpdate.tokenSymbols.length &&
              !localUpdate.isIncludedInBalances
            ) {
              localUpdate.isIncludedInBalances = true;
              const tokenBalances$ = localUpdate.tokenSymbols.map((ts) =>
                this.getBalanceOnChain$(address, ts)
              );
              return combineLatest(tokenBalances$).pipe(
                map((balancesResult: string[]) => {
                  return localUpdate.tokenSymbols.map(
                    (tSymbol: TokenSymbol, sIndex: number) => {
                      return {
                        tokenSymbol: tSymbol,
                        balance: balancesResult[sIndex],
                      };
                    }
                  );
                }),
                map(
                  (
                    updatedTokenResult: {
                      tokenSymbol: TokenSymbol;
                      balance: string;
                    }[]
                  ) => {
                    return cachedBalances.map((tb: Token) => {
                      const updated = updatedTokenResult.find(
                        (upd) => upd.tokenSymbol === tb.contract_ticker_symbol
                      );
                      if (updated) {
                        tb.balance = new BigNumber(
                          updated.balance,
                          10
                        ).toNumber();
                      }
                      return tb;
                    });
                  }
                ),
                tap((v) => DevUtil.devLog('UPDATED BALANCE=', v))
              );
            }
            return of(cachedBalances);
          }
        ),
        shareReplay(1)
      );
      this.balancesByAddr.set(address, finalBalances$);
    }
    return this.balancesByAddr.get(address);
  }

  getTokenBalance$(
    addr: string,
    tokenSymbol?: TokenSymbol,
    tokenAddress?: string
  ): Observable<Token> {
    if (!tokenSymbol && !tokenAddress) {
      throw new Error('Token symbol or address is required.');
    }
    return this.getTokenBalances$(addr).pipe(
      switchMap((balances: Token[]) => {
        const tokenBalance = tokenSymbol
          ? this.findTokenBalance(balances, tokenSymbol)
          : null;
        if (tokenBalance) {
          return of(tokenBalance);
        }
        return this.getBalanceOnChain$(addr, tokenSymbol, tokenAddress).pipe(
          map(
            (v) =>
              ({
                balance: parseFloat(v),
                contract_ticker_symbol: tokenSymbol,
                address: addr,
              } as Token)
          )
        );
      }),
      shareReplay(1)
    );
  }

  private getAddressTokenBalances$(
    address: string,
    info: IProviderUserInfo
  ): Observable<Token[]> {
    const chainId: ChainId = info.chainInfo.chain_id;
    let balances$: Observable<Token[]>;
    if (
      TokenBalanceService.COVALENT_SUPPORTED_NETWORK_IDS.indexOf(chainId) > -1
    ) {
      balances$ = this.http
        .get<any>(`${this.reefNodeApi}/${address}/balances`)
        .pipe(tap((v: any[]) => v.forEach((itm) => (itm.address = address))));
    } else {
      balances$ = this.getReefProtocolBalancesFromChain$(info, address).pipe(
        map((val) => this.toCovalentDataStructure(val))
      );
    }

    return balances$.pipe(
      map((tokens) =>
        tokens.map((token) => this.removeTokenPlaceholders(info, token))
      ),
      tap((v) => DevUtil.devLog('BALANCE=', v))
    );
  }

  private removeTokenPlaceholders(info: IProviderUserInfo, token: any): Token {
    if (token.contract_ticker_symbol === 'UNI-V2') {
      const addressLabel = AddressUtils.getAddressLabel(
        info,
        token.contract_address
      );
      token.contract_ticker_symbol = addressLabel || 'Uniswap LP Token';
      token.logo_url =
        'https://logos.covalenthq.com/tokens/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.png';
    }
    return token;
  }

  private getBalanceOnChain$(
    address: string,
    tokenSymbol?: TokenSymbol,
    tokenAddress?: string
  ): Observable<string> {
    if (!tokenSymbol && !tokenAddress) {
      throw new Error('Token symbol or address is required.');
    }
    return combineLatest([
      this.connectorService.providerUserInfo$,
      this.connectorService.web3$,
    ]).pipe(
      take(1),
      switchMap(([info, web3]: [IProviderUserInfo, Web3]) => {
        if (tokenSymbol === TokenSymbol.ETH) {
          return web3.eth
            .getBalance(address)
            .then((b) => web3.utils.fromWei(b));
        }
        return this.getContractBalance$(
          info,
          address,
          tokenSymbol,
          tokenAddress
        );
      }),
      tap((v) => DevUtil.devLog(`NEW BALANCE for ${tokenSymbol}=`, v)),
      catchError((e) => {
        DevUtil.devLog('ERROR GETTING BALANCE', e, LogLevel.WARNING);
        return of('0');
      })
    );
  }

  private getContractBalance$(
    info: IProviderUserInfo,
    address: string,
    tokenSymbol?: TokenSymbol,
    tokenAddress?: string
  ): Promise<string> {
    if (!tokenSymbol && !tokenAddress) {
      throw new Error('Token symbol or address is required.');
    }
    let contract;
    if (tokenSymbol) {
      contract = this.connectorService.createErc20TokenContract(
        tokenSymbol,
        info.availableSmartContractAddresses
      );
    }
    if (!contract && tokenAddress) {
      this.connectorService.createErc20TokenContractFromAddress(tokenAddress);
    }

    if (!contract) {
      throw new Error(
        'No ERC20 contract for' + tokenSymbol + ' cAddr=' + tokenAddress
      );
    }
    return contract.methods
      .balanceOf(address)
      .call()
      .then((balance) => {
        return TokenUtil.toDisplayDecimalValue(balance, tokenSymbol);
      }) as Promise<string>;
  }

  private getReefProtocolBalancesFromChain$(
    info: IProviderUserInfo,
    address: string
  ): Observable<Token[]> {
    const missingBalanceTokens = TokenBalanceService.REEF_PROTOCOL_TOKENS;

    return combineLatest(
      missingBalanceTokens.map((supportedConfig) => {
        let balance$: Observable<any>;
        const tokenAddress =
          info.availableSmartContractAddresses[supportedConfig.tokenSymbol];
        balance$ = this.getBalanceOnChain$(
          address,
          supportedConfig.tokenSymbol
        );

        return balance$.pipe(
          map(
            (balance) =>
              ({
                contract_ticker_symbol: supportedConfig.tokenSymbol,
                balance: +balance,
                address,
                contract_address: tokenAddress,
              } as Token)
          )
        );
      })
    );
  }

  private toCovalentDataStructure(balancesFromChain: Token[]): any {
    return balancesFromChain.map((token) => {
      token.quote = 1;
      return token;
    });
  }

  private findTokenBalance(balances: Token[], tokenSymbol: TokenSymbol): Token {
    return balances.find((tkn) => {
      if (TokenSymbol[tkn.contract_ticker_symbol] === tokenSymbol) {
        return true;
      }
      return false;
    });
  }
}
