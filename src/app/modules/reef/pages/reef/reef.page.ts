import { Component, OnInit } from '@angular/core';
import { ContractService } from '../../../../core/services/contract.service';
import { ConnectorService } from '../../../../core/services/connector.service';
import { UniswapService } from '../../../../core/services/uniswap.service';
import { PoolService } from '../../../../core/services/pool.service';
import { ChartsService } from '../../../../core/services/charts.service';
import { ApiService } from '../../../../core/services/api.service';
import { format, subMonths } from 'date-fns';
import { TokenSymbol, TransactionType } from '../../../../core/models/types';
import { TransactionsService } from '../../../../core/services/transactions.service';
import { BehaviorSubject, EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenBalanceService } from '../../../../shared/service/token-balance.service';

@Component({
  selector: 'app-reef',
  templateUrl: './reef.page.html',
  styleUrls: ['./reef.page.scss'],
})
export class ReefPage implements OnInit {
  TransactionType = TransactionType;
  readonly pendingTransactions = this.transactionService.getPendingTransactions(
    [TransactionType.BUY_REEF]
  );
  supportedTokens = TokenBalanceService.SUPPORTED_BUY_REEF_TOKENS;

  buyLoading = false;
  reefPriceChartData = null;
  readonly TokenSymbol = TokenSymbol;
  readonly priceError$ = new BehaviorSubject<boolean>(false);
  readonly TransactionsService = TransactionsService;

  constructor(
    private contractService: ContractService,
    public readonly connectorService: ConnectorService,
    private readonly uniswapService: UniswapService,
    private readonly poolService: PoolService,
    private readonly chartService: ChartsService,
    private readonly apiService: ApiService,
    private readonly transactionService: TransactionsService
  ) {}

  ngOnInit(): void {
    this.getReefHistoricalPrice();
  }

  async buyReef(
    tokenSymbol: TokenSymbol,
    tokenAmount: number,
    amountOutMin: number
  ): Promise<any> {
    this.buyLoading = true;
    await this.uniswapService.buyReef(
      tokenSymbol,
      tokenAmount,
      amountOutMin,
      10
    );
    this.buyLoading = false;
  }

  public onDateChange(val: number): void {
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subMonths(new Date(), val), 'yyyy-MM-dd');
    this.getReefHistoricalPrice(endDate, startDate);
  }

  private getReefHistoricalPrice(to?: string, from?: string): void {
    if (!from) {
      from = '2020-12-29'; // Date Of Reef TGE
    }
    if (!to) {
      to = format(new Date(), 'yyyy-MM-dd');
    }
    this.apiService.getReefPricing(from, to).subscribe(({ data }) => {
      if (data) {
        this.reefPriceChartData = this.chartService.composeHighChart(
          data.prices.map((obj) => [new Date(obj.date).getTime(), obj.price]),
          true
        );
      } else {
        this.priceError$.next(true);
      }
    });
  }
}
