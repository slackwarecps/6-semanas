import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const errorSuppressorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 404 && req.url.includes('/progresso')) {
        return of(null as any);
      }
      throw error;
    }),
  );
};
