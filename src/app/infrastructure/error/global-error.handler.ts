import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | any): void {
    const errorStr = error?.stack?.toString?.() || error?.toString?.() || '';

    if (errorStr.includes('404') && errorStr.includes('progresso')) {
      return;
    }

    console.error(error);
  }
}
