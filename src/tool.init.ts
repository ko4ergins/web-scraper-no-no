import * as playwright from 'playwright-chromium';

import { IToolInit } from './interfaces';

export class ProffNoBrowserInit implements IToolInit {
   private browser: playwright.Browser;
   private page: playwright.Page;
   private readonly browserLaunchOptions = {
      headless: true,
      devtools: false,
      chromiumSandbox: false,
      args: ['--disable-dev-shm-usage'],
   };
   private readonly contextOptions = {
      ignoreHTTPSErrors: true,
      bypassCSP: true,
      locale: 'no-no',
   };

   async newInstance() {
      this.browser = await playwright['chromium'].launch(this.browserLaunchOptions);
      const context = await this.browser.newContext(this.contextOptions);
      this.page = await context.newPage();

      await this.page.route('**/*', (route) => {
         const inputRequestType = route.request().resourceType();
         const blockedTypes = [
            'xhr',
            //'stylesheet',
            'image',
            'font',
            //'fetch',
            'other',
            'ping',
         ];

         return blockedTypes.includes(inputRequestType) ? route.abort() : route.continue();
      });
      return { browser: this.browser, page: this.page };
   }
}
