import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const reqresApiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.reqresApiUrl)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { 'x-api-key': environment.reqresApiKey } }));
};
