import * as playwright from 'playwright-chromium';
import * as csv from 'csv-writer';
import * as fs from 'fs';

import * as consts from '../consts';
import { CsvProffOnType, CsvWriterType } from '../types';

export abstract class MainScraper {
   protected page: playwright.Page;
   protected browser: playwright.Browser;
   protected csvRecordData: CsvProffOnType[] = [] as CsvProffOnType[];
   protected scrapElementsSelectors: { [key: string]: string } = {} as { [key: string]: string };
   protected itemScrapedData = {} as CsvProffOnType;

   protected async init() {
      this.browser = await playwright['chromium'].launch(consts.browserLaunchOptions);
      const context = await this.browser.newContext(consts.contextOptions);
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
   }
   protected async writeToCsvFile(vars: CsvWriterType): Promise<void> {
      const { folderName, header, records } = vars;
      const path = `./output/${folderName}`;

      fs.existsSync(path) && fs.rmdirSync(path, { recursive: true });
      fs.mkdirSync(path, { recursive: true });

      const csvWriter = csv.createObjectCsvWriter({
         header,
         path: `${path}/${folderName}_results.csv`,
      });

      await csvWriter.writeRecords(records);
   }
}

export interface IScraper {
   readonly scrapElementsSelectors: { [key: string]: string };
   readonly csvHeader: { id: string; title: string }[];
   scrapingData(): Promise<void>;
   textClearing(webElWithText: { [key: string]: string }): {
      [key: string]: string | undefined;
   };
}
