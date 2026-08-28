import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNzI18n, vi_VN } from 'ng-zorro-antd/i18n';

import { routes } from './app.routes';
import { reqresApiKeyInterceptor } from './core/interceptors/reqres-api-key-interceptor';

registerLocaleData(vi);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([reqresApiKeyInterceptor])),
    provideNzI18n(vi_VN),
  ],
};
