import * as csv from 'csv-writer';
import { CsvWriterType } from './types';

export async function writeToCsvFile(vars: CsvWriterType): Promise<void> {
   const { path, header, records } = vars;
   const csvWriter = csv.createArrayCsvWriter({
      header,
      path,
   });

   await csvWriter.writeRecords(records);
}
