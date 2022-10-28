export type CsvWriterType = {
   folderName: string;
   header: { id: string; title: string }[];
   records: { [key: string]: string }[];
};

export type CsvProffOnType = {
   Company: string;
   'Org-nr': string;
   Revenue: string;
   Nr_of_employees: string;
   First_name: string;
   Middle_name: string;
   Last_name: string;
};
