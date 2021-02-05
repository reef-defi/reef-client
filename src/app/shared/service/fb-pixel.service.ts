import { Injectable } from '@angular/core';

declare let fbq: Function;

@Injectable({ providedIn: 'root' })
export class FbPixelService {
  static readonly LEAD_TYPE = 'Lead';

  track(type: string): void {
    fbq('track', type);
  }
}
