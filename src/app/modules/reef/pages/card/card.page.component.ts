import {Component} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-card-page',
  templateUrl: './card.page.component.html',
  styleUrls: ['./card.page.component.scss']
})
export class CardPage {
  interested: boolean;

  constructor(private http: HttpClient) {
  }

  /*sendInterestEmail(emailInput: string) {
    this.http.post(environment.reefNodeApiUrl, {email: emailInput}).subscribe()
  }*/
  confirmInterest() {

  }
}
