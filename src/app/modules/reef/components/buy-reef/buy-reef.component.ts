import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {IProviderUserInfo, IReefPricePerToken, TokenBalance, TokenSymbol} from '../../../../core/models/types';
import {ApiService} from '../../../../core/services/api.service';
import {ConnectorService} from '../../../../core/services/connector.service';
import {filter, switchMap} from 'rxjs/operators';
import {combineLatest, Observable, ReplaySubject} from 'rxjs';

@Component({
  selector: 'app-buy-reef',
  templateUrl: './buy-reef.component.html',
  styleUrls: ['./buy-reef.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuyReefComponent {
  @Input() tokenAmount = 1;

  @Input() set selectedToken(val: string | undefined) {
    this.selTokenSub.next(TokenSymbol[val]);
  }

  @Input() tokenPrices: IReefPricePerToken | undefined;
  @Input() supportedTokens: any | undefined;
  @Input() ethPrice: number | undefined;
  @Input() loading: boolean | undefined;
  @Output() buy = new EventEmitter();
  @Output() tokenChange = new EventEmitter();
  @Output() amountChange = new EventEmitter();

  TokenSymbol = TokenSymbol;
  selectedTokenBalances$: Observable<TokenBalance[]>;
  selTokenSub = new ReplaySubject<TokenSymbol>();

  constructor(
    public connectorService: ConnectorService,
    public apiService: ApiService,
  ) {
    this.selectedTokenBalances$ = combineLatest([
      this.selTokenSub.asObservable(),
      this.connectorService.providerUserInfo$.pipe(filter(v => !!v))
    ]).pipe(
      switchMap(([tokenSymbol, uInfo]: [TokenSymbol, IProviderUserInfo]) => this.apiService.getTokenBalance$(uInfo.address, tokenSymbol))
    )
  }

  onBuy(tokenAmount: number): void {
    this.buy.emit(tokenAmount);
  }

  onTokenChange(tokenSymbol: string): void {
    this.tokenChange.emit(tokenSymbol);
    this.selTokenSub.next(TokenSymbol[tokenSymbol]);
  }

  onAmountChange(amount: number): void {
    this.amountChange.emit(amount);
  }

}
