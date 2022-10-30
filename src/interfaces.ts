import { ExportResultsType } from './types';

export interface IToolInit {
   newInstance: () => any;
}
export interface IExportResults {
   writeToFile: (vars: ExportResultsType) => Promise<void>;
}
export interface IScraper {
   scrapingData: () => Promise<void>;
   toolInit: IToolInit;
   exportResults: IExportResults;
   textClearing: (webElWithText: { [key: string]: string }) => {
      [key: string]: string | undefined;
   };
   scrapElementsSelectors: { [key: string]: string };
}
