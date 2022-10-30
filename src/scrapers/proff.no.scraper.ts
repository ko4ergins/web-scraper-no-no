import * as dotenv from 'dotenv';

import { ProffNoExportResults } from '../export.results';
import { ProffNoBrowserInit } from '../tool.init';
import { IScraper } from '../interfaces';

dotenv.config();

class ProffNoScraper implements IScraper {
   private readonly proffNoUrl: string = process.env.PROFF_NO || '';
   scrapElementsSelectors = {
      company: 'h3 > a',
      orgNumber: '.org-number',
      revenue: '.additional-info li.sorted',
      nrOfEmployees: '//div[@class="additional-info"]//li[contains(., "Ansatte: ")]',
      fullName: '.additional-info li:last-child',
   };
   private readonly csvHeader = [
      { id: 'company', title: 'Company' },
      { id: 'orgNumber', title: 'Org-nr' },
      { id: 'revenue', title: 'Revenue' },
      { id: 'nrOfEmployees', title: 'Nr_of_employees' },
      { id: 'firstName', title: 'First_name' },
      { id: 'middleName', title: 'Middle_name' },
      { id: 'lastName', title: 'Last_name' },
   ];
   toolInit = new ProffNoBrowserInit();
   exportResults = new ProffNoExportResults(this.csvHeader);

   async scrapingData(): Promise<void> {
      const { browser, page } = await this.toolInit.newInstance();

      await page.goto(this.proffNoUrl, { waitUntil: 'networkidle' });

      let nextBtnIsDisabled = (await page.$('li.next.arrow > a')) !== null ? false : true;
      const items = await page.locator('.listing');
      const itemsCount = await items.count();
      let count = 0;

      while (!nextBtnIsDisabled) {
         count++;
         console.log(`Started scraping data - #${count} page`);

         for (let i = 0; i < itemsCount; ++i) {
            for (const [field, selector] of Object.entries(this.scrapElementsSelectors)) {
               const isVisibleEl: boolean = await items
                  .nth(i)
                  .locator(selector)
                  .isVisible({ timeout: 1000 });
               if (isVisibleEl) {
                  const itemText = await items.nth(i).locator(selector).innerText();
                  this.exportResults.itemScrapedData = {
                     ...this.exportResults.itemScrapedData,
                     ...this.textClearing({ [field]: itemText }),
                  };
               } else {
                  this.exportResults.itemScrapedData = {
                     ...this.exportResults.itemScrapedData,
                     ...{ [field]: 'NO DATA' },
                  };
               }
            }

            this.exportResults.csvRecordData.push(this.exportResults.itemScrapedData);
         }
         this.exportResults.writeToFile({
            dirName: 'proff-no',
            records: this.exportResults.csvRecordData,
         });
         console.log(`Written to CSV file - #${count} page`);

         const nextArrowBtn = await page.$('li.next.arrow > a');
         if (nextArrowBtn !== null) {
            await page.click('li.next.arrow > a', { timeout: 500 });
            await page.waitForLoadState('domcontentloaded');
            nextBtnIsDisabled = false;
         } else {
            nextBtnIsDisabled = true;
         }
      }

      await browser.close();
      console.log(`Data scraping is done - #${count} pages processed`);
   }

   textClearing(webElWithText: { [key: string]: string }) {
      const [key, value] = Object.entries(webElWithText)[0];
      switch (key) {
         case 'orgNumber':
            return { [key]: value!.replace('Org nr', '')!.trim() };
         case 'revenue':
         case 'nrOfEmployees':
            return { [key]: value!.split(':')!.slice(1)[0]!.trim() };
         case 'fullName':
            const fullName: string[] = value!
               .split(':')!
               .slice(1)[0]!
               .split('(')!
               .slice(0)[0]!
               .trim()!
               .split(' ')!
               .slice();
            return {
               firstName: fullName[0],
               middleName: fullName.length === 3 ? fullName[1] : '',
               lastName: fullName[fullName.length - 1],
            };
         default:
            return { [key]: value!.trim() };
      }
   }
}

export default new ProffNoScraper().scrapingData();
