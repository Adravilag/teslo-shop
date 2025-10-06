import { HttpEventType, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export function loggingInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  return next(req).pipe(
    tap((event: HttpEvent<unknown>) => {
      if (event.type === HttpEventType.Response) {
        console.log('Response status:', event.status);
        console.log('Response received:', event);
      }
    })
  );
}
