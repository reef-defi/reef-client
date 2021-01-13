import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-provider-loading',
  templateUrl: './provider-loading.component.html',
  styleUrls: ['./provider-loading.component.scss']
})
export class ProviderLoadingComponent implements OnInit {

  ngOnInit() {
    const span = document.querySelector('.dots');
    setInterval(() => {
      if (span.innerHTML.length > 2) {
        span.innerHTML = '';
      } else {
        span.innerHTML += '.';
      }
    }, 500)
  }
}
