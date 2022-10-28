export const browserLaunchOptions = {
   headless: true,
   devtools: false,
   chromiumSandbox: false,
   args: ['--disable-dev-shm-usage'],
};

export const contextOptions = { ignoreHTTPSErrors: true, bypassCSP: true, locale: 'no-no' };
