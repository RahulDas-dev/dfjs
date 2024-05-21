import Papa from 'papaparse';
import { ArrayType2D, CsvInputOptionsBrowser, CsvOutputOptionsBrowser } from '../types/base';
import DataFrame from '../core/frame';

/**
 * Reads a CSV file from local or remote location into a DataFrame.
 * @param filePath URL or local file path to CSV file. `readCSV` uses PapaParse to parse the CSV file,
 * hence all PapaParse options are supported.
 * @param options Configuration object. Supports all Papaparse parse config options.
 * @returns DataFrame containing the parsed CSV file.
 * @example
 * ```
 * import { readCSV } from "danfojs-node"
 * const df = await readCSV("https://raw.githubusercontent.com/test.csv")
 * ```
 * @example
 * ```
 * import { readCSV } from "danfojs-node"
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
 * import { readCSV } from "danfojs-node"
 * const df = await readCSV("./data/sample.csv")
 * ```
 */
export const readCSV = async (file: any, options?: CsvInputOptionsBrowser): Promise<DataFrame> => {
    const frameConfig = options?.frameConfig || {}
    console.log(frameConfig)
    return new Promise( (resolve, reject) => {
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


export const $toCSV = (df: DataFrame , options?: CsvOutputOptionsBrowser): string | void => {
  let { fileName, download, sep, header } = { fileName: "output.csv", sep: ",", header: true, download: false, ...options }

  if (df.isSeries) {
    const csv = df.values.join(sep);

    if (download) {
      if (!(fileName.endsWith(".csv"))) {
        fileName = fileName + ".csv"
      }
      downloadFileInBrowser(csv, fileName);
    } else {
      return csv;
    }
  } else {
    const rows = df.values as ArrayType2D
    let csvStr = header === true ? `${df.columns.join(sep)}\n` : ""

    for (let i = 0; i < rows.length; i++) {
      const row = `${rows[i].join(sep)}\n`;
      csvStr += row;
    }

    if (download) {
      if (!(fileName.endsWith(".csv"))) {
        fileName = fileName + ".csv"
      }
      downloadFileInBrowser(csvStr, fileName);
    } else {
      return csvStr;
    }
  }
};

/**
 * Internal function to download a CSV file in the browser.
 * @param content A string of CSV file contents
 * @param fileName  The name of the file to be downloaded
 */
const downloadFileInBrowser = (content: any, fileName: string) => {
  var hiddenElement = document.createElement('a');
  hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  hiddenElement.target = '_blank';
  hiddenElement.download = fileName;
  hiddenElement.click();
}



