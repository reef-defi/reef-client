import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

const apk = 'ckey_02c001945c67428eaff497033d2';

@Injectable()
export class CovalentAuthInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.includes('covalent')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${apk}`,
        }
      })
    }
    return next.handle(request);
  }
}
