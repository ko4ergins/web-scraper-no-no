import * as dotenv from 'dotenv';
import { MainScraper, IScraper } from './main.scraper';

dotenv.config();
const proffNoUrl: string = process.env.PROFF_NO || '';

class ProffNoScraper extends MainScraper implements IScraper {
   readonly scrapElementsSelectors = {
      company: 'h3 > a',
      orgNumber: '.org-number',
      revenue: '.additional-info li.sorted',
      nrOfEmployees: '//div[@class="additional-info"]//li[contains(., "Ansatte: ")]',
      fullName: '.additional-info li:last-child',
   };
   readonly csvHeader = [
      { id: 'company', title: 'Company' },
      { id: 'orgNumber', title: 'Org-nr' },
      { id: 'revenue', title: 'Revenue' },
      { id: 'nrOfEmployees', title: 'Nr_of_employees' },
      { id: 'firstName', title: 'First_name' },
      { id: 'middleName', title: 'Middle_name' },
      { id: 'lastName', title: 'Last_name' },
   ];

   async scrapingData(): Promise<void> {
      await this.init();
      await this.page.goto(proffNoUrl, { waitUntil: 'networkidle' });

      let nextBtnIsDisabled = (await this.page.$('li.next.arrow > a')) !== null ? false : true;
      const items = await this.page.locator('.listing');
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
                  this.itemScrapedData = {
                     ...this.itemScrapedData,
                     ...this.textClearing({ [field]: itemText }),
                  };
               } else {
                  this.itemScrapedData = {
                     ...this.itemScrapedData,
                     ...{ [field]: 'NO DATA' },
                  };
               }
            }

            this.csvRecordData.push(this.itemScrapedData);
         }
         this.writeToCsvFile({
            folderName: 'proff-no',
            header: this.csvHeader,
            records: this.csvRecordData,
         });
         console.log(`Written to CSV file - #${count} page`);

         const nextArrowBtn = await this.page.$('li.next.arrow > a');
         if (nextArrowBtn !== null) {
            await this.page.click('li.next.arrow > a', { timeout: 500 });
            await this.page.waitForLoadState('domcontentloaded');
            nextBtnIsDisabled = false;
         } else {
            nextBtnIsDisabled = true;
         }
      }

      await this.browser.close();
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
