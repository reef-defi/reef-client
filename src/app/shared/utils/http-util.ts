import {catchError, filter, map, mapTo, shareReplay} from 'rxjs/operators';
import {HttpEventType, HttpResponse} from '@angular/common/http';
import {merge, Observable} from 'rxjs';
import {startWith} from 'rxjs/internal/operators/startWith';
import {of} from 'rxjs/internal/observable/of';

export class HttpUtil {
  static REQ_LOADING_EVENT_OPTIONS = {
    reportProgress: true,
    observe: 'events',
  };

  static withInitLoadingRequestValue(
    httpRequestObservable: Observable<any>,
    initLoadingValue: any = null
  ): Observable<any> {
    return httpRequestObservable.pipe(
      filter((v) => {
        return !(
          v.type === HttpEventType.ResponseHeader ||
          v.type === HttpEventType.DownloadProgress ||
          v.type === HttpEventType.UploadProgress ||
          v.type === HttpEventType.User
        );
      }),
      map((v: HttpResponse<any>) => {
        // @ts-ignore
        if (v.type === HttpEventType.Sent) {
          return initLoadingValue;
        }
        if (v.type === HttpEventType.Response) {
          if (v.status >= 200 && v.status < 300) {
            return v.body;
          } else {
            throw new Error('Request error ' + v.status);
          }
        }
        return null;
      })
    );
  }

  static getRequestObservables(
    httpRequestObservable: Observable<any>
  ): {
    response$: Observable<any>;
    loading$: Observable<boolean>;
    error$: Observable<string>;
  } {
    const data$ = httpRequestObservable.pipe(shareReplay(1));

    const response$ = data$.pipe(
      filter((res) => !res._status),
      shareReplay(1)
    );

    const error$ = data$.pipe(
      filter((res) => !!res._status),
      map((res) => res._status.error ? res._status.error.message : res._status.message),
      catchError((err) => {
        return of(err.message);
      }),
      shareReplay(1)
    );

    const reqComplete$ = merge(response$, error$);
    const loading$ = reqComplete$.pipe(
      mapTo(false),
      startWith(true),
      shareReplay(1)
    );

    return {response$, loading$, error$};
  }
}
