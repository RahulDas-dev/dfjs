import Papa from 'papaparse';
import { ICsvInputOptionsBrowser, ICsvOutputOptionsBrowser } from '../types/base';
import DataFrame from '../core/frame';
import Series from '../core/series';

/**
 * Reads a CSV file from local or remote location into a DataFrame.
 * @param filePath URL or local file path to CSV file. `readCSV` uses PapaParse to parse the CSV file,
 * hence all PapaParse options are supported.
 * @param options Configuration object. Supports all Papaparse parse config options.
 * @returns DataFrame containing the parsed CSV file.
 * @example
 * ```
 * import { readCSV } from "dfjs-node"
 * const df = await readCSV("https://raw.githubusercontent.com/test.csv")
 * ```
 * @example
 * ```
 * import { readCSV } from "dfjs-node"
 * const df = await readCSV("https://raw.githubusercontent.com/test.csv", {
 *    delimiter: ",",
 *    headers: {
 *      Accept: "text/csv",
 *      Authorization: "Bearer YWRtaW46YWRtaW4="
 *    }
 * })
 * ```
 * @example
 * ```
 * import { readCSV } from "dfjs-node"
 * const df = await readCSV("./data/sample.csv")
 * ```
 */
export const readCSV = async (file: string, options?: ICsvInputOptionsBrowser): Promise<DataFrame> => {
  // const frameConfig = options?.frameConfig ?? {}
  // console.log(frameConfig)
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: 'greedy',
      ...options,
      download: true,
      complete: results => {
        const df = new DataFrame(results.data);
        resolve(df);
      },
      error: err => {
        reject(err)
      }
    })
  });
};


export const toCSV = (df: DataFrame | Series, options?: ICsvOutputOptionsBrowser): string | void => {
  const { fileName, download, sep, header } = { fileName: "output.csv", sep: ",", header: true, download: false, ...options }
  const csv = df.tocsv(sep, header);
  if (download) {
    const fileName_ = fileName.endsWith(".csv") ? fileName : fileName + ".csv"
    downloadFileInBrowser(csv, fileName_);
  } else {
    return csv;
  }
};

/**
 * Internal function to download a CSV file in the browser.
 * @param content A string of CSV file contents
 * @param fileName  The name of the file to be downloaded
 */
const downloadFileInBrowser = (content: string, fileName: string) => {
  const hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
  document.body.removeChild(hiddenElement);
}



