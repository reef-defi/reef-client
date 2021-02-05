import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({ providedIn: 'root' })
export class GoogleAnalyticsService {
  pageView(uri: string) {
    gtag('config', 'G-G1W8EPNCTC', {
      page_path: uri,
    });
  }

  eventEmitter(
    eventName: string,
    eventCategory: string,
    eventAction: string,
    eventLabel: string = null,
    eventValue: number = null
  ) {
    console.log('analytics event=', eventLabel);
    gtag('event', eventName, {
      eventCategory: eventCategory,
      eventLabel: eventLabel,
      eventAction: eventAction,
      eventValue: eventValue,
    });
  }
}
