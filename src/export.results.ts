import * as csv from 'csv-writer';
import * as fs from 'fs';

import { IExportResults } from './interfaces';
import { ExportResultsType, CsvProffOnType } from './types';

export class ProffNoExportResults implements IExportResults {
   csvRecordData: CsvProffOnType[] = [] as CsvProffOnType[];
   itemScrapedData = {} as CsvProffOnType;

   constructor(private csvHeader: { id: string; title: string }[]) {}

   async writeToFile(vars: ExportResultsType): Promise<void> {
      const { dirName, records } = vars;
      const path = `./output/${dirName}`;

      fs.existsSync(path) && fs.rmdirSync(path, { recursive: true });
      fs.mkdirSync(path, { recursive: true });

      const csvWriter = csv.createObjectCsvWriter({
         header: this.csvHeader,
         path: `${path}/${dirName}_results.csv`,
      });

      await csvWriter.writeRecords(records);
   }
}
