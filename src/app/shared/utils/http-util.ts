import { filter, map } from 'rxjs/operators';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
