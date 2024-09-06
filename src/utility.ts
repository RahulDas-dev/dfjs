import {
    TArrayOfRecord,
    TRecordOfArray,
    TArray1D,
    TArray2D,
    TDtypes,
    TItem,
    TRecordOfSeries,
    TinternalDtypes
} from "./types/base";
import { tableconfig } from "./config/tableconfig";
import Series from "./core/series";

/**
 * Check if value is a string.
 * @param value The value to check.
 * @returns 
 */
export function isString<T>(value: T): boolean {
    return value != null && typeof value === "string";
}

/**
 * Checks if value is an object.
 * @param value The value to check.
 * @returns 
 */
export function isObject<T>(value: T): boolean {
    return value && typeof value === "object" && value.constructor && value.constructor.name === "Object";
}


/**
* Checks if a value is a date object
* @param value A date object
* @returns boolean
*/
export function isDate<T>(value: T): boolean {
    return value instanceof Date;
}

/**
 * Type guard function to check if a value is of type TItem.
 * @param value - The value to check.
 * @returns True if the value is of type TItem, otherwise false.
 */
function isTItem(value: unknown): value is TItem {
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value instanceof Date;
}

/**
 * Checks if array is 1D
 * @param data The array 
 */
export function isOneDArray(data: unknown): data is TArray1D {
    if (!Array.isArray(data)) {
        return false;
    }
    if (data.length === 0) {
        return true;
    }
        const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
    return data.slice(0, checklimit).every(element =>
        typeof element === 'number' ||
        typeof element === 'string' ||
        typeof element === 'boolean' ||
        element instanceof Date
    );
}

/**
 * Checks if array is 2D
 * @param data The array 
 */
export function isTwoDArray(data: unknown): data is TArray2D {
    if (!Array.isArray(data)) {
        return false;
    }
    if (data.length === 0) {
        return false;
    }
    const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
    const is_2d = data.slice(0, checklimit).every(item => isOneDArray(item))
    if (!is_2d) {
        return false;
    }
    const firstColLen: number = (data[0] as Array<unknown>).length;
    const hasSameColLen = (data as Array<Array<unknown>>).map((item) => item.length).every((ln) => ln === firstColLen);
    if (!hasSameColLen) {
        throw Error("Length Error: Length of columns must be the same!");
    }
    return true;
}

/**
 * Type guard function to check if an item is of type Array<Record<string | number, TItem>>.
 * @param data - The data to check.
 * @returns True if the data is of type Array<Record<string | number, TItem>>, otherwise false.
 */
export function isArrayOfRecord(data: unknown): data is TArrayOfRecord {
    if (!Array.isArray(data)) {
        return false;
    }
    if (data.length === 0) {
        return false;
    }
    const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
    return data.slice(0, checklimit).every((obj: Record<string | number, unknown>) =>
        obj && typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date) &&
        Object.keys(obj).every(key =>
            (typeof key === 'string' || typeof key === 'number') &&
            isTItem(obj[key])
        )
    );
}

/**
 * Type guard function to check if an item is of type TRecordOfArray.
 * @param data - The data to check.
 * @returns True if the data is of type TRecordOfArray, otherwise false.
 */
export function isRecordOfArray(data: unknown): data is TRecordOfArray {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    if (typeof data === 'object' && Object.keys(data).length === 0) {
        return false;
    }
    const is_true = Object.values(data).every(value => isOneDArray(value));
    if (!is_true)
        return false;

    const colData = Object.values(data);

    const firstColLen = (colData[0] as Array<unknown>).length
    const hasSameColLen = (colData as Array<unknown[]>).map((item) => item.length).every((ln) => ln === firstColLen)
    if (!hasSameColLen) {
        throw Error("Length Error: Length of Rows must be the same!");
    }
    return true;
}   

/**
 * Type guard function to check if an item is of type Record<string | number, TItem>.
 * @param item - The item to check.
 * @returns True if the item is of type Record<string | number, TItem>, otherwise false.
 */
export function isSeries(obj: unknown): obj is Series {
    return (
        obj &&
        (typeof (obj as Series).values !== 'undefined') &&
        Array.isArray((obj as Series).shape) &&
        (typeof (obj as Series).dtype === 'string') &&
        Array.isArray((obj as Series).index) &&
        Array.isArray((obj as Series).columns) &&
        Array.isArray((obj as Series).values)
    ) as boolean;
}


/**
 * Type guard function to check if an item is of type Record<string | number, TItem>.
 * @param data - The data to check.
 * @returns True if the data is of type Record<string | number, TItem>, otherwise false.
 */
export function isRecordOfSeries(data: unknown): data is TRecordOfSeries {
    if (typeof data !== 'object' || data === null) {
        return false;
    }
    if (typeof data === 'object' && Object.keys(data).length === 0) {
        return false;
    }
    const is_true = Object.values(data).every(value => isSeries(value));
    if (!is_true)
        return false;
    const colData = Object.values(data);
    const firstColLen = (colData[0] as Series).shape[0]
    const hasSameColLen = (colData as Array<Series>).map((item) => item.shape[0]).every((ln) => ln === firstColLen)
    if (!hasSameColLen) {
        throw Error("Length Error: Length of Rows must be the same!");
    }
    return true;
}

/**
 * Checks if a value is empty. Empty means it's either null, undefined or NaN
 * @param value The value to check.
 * @returns 
 */
export function isEmpty<T>(value: T): boolean {
    return value === undefined ||
        value === null ||
        (isNaN(value as number) && typeof value !== "string") ||
        (typeof value === 'string' && value.trim() === '');
}

/**
 * Flattens an array of objects into a list of lists, filling missing values with an empty string.
 * Also returns the keys used for flattening as a tuple.
 * @param input - An array of objects to be flattened.
 * @returns A tuple containing the keys and the flattened array.
 *
 * @example
 * const input = [{ a: 1, b: 2 }, { a: 30, b: 20 }, { a: 8 }, { b: 5 }, {}];
 * const [keys, flattenedArray] = flattenObjectArray(input);
 * console.log(keys); // Output: ['a', 'b']
 * console.log(flattenedArray); // Output: [[1, 2], [30, 20], [8, ''], ['', 5], ['', '']]
 */
export function perseArrayOfRecord(data: TArrayOfRecord): [TArray2D, string[]] {
    const colNames = Array.from(new Set(data.flatMap(Object.keys)));
    const colData = data.map(obj => colNames.map(key => obj[key] ?? ''));
    const columns = colNames.map(key => key.toString());
    return [colData, columns];
}

/**
* Retrieve row array and column names from an object of the form {a: [1,2,3,4], b: [30,20, 30, 20]}
* @param obj The object to retrieve rows and column names from.
*/
export function perseRecoredsOfArray(data: TRecordOfArray): [TArray2D, string[]] {
    const colNames = Object.keys(data);
    const colData = Object.values(data);
    // const firstColLen = colData[0].length
    // const hasSameColLen = colData.map((item) => item.length).every((ln) => ln === firstColLen)
    // if (!hasSameColLen) {
    //    throw Error("Length Error: Length of columns must be the same!");
    // }
    const rowsArr = transposeArray(colData)
    return [rowsArr, colNames];
}

/*
* Retrieve row array and column names from an object of the form {a: [1,2,3,4], b: [30,20, 30, 20]}
* @param obj The object to retrieve rows and column names from.
*/
export function perseRecoredsOfSeries(data: TRecordOfSeries): [TArray2D, string[]] {
    const colNames = Object.keys(data);
    const colData: Series[] = Object.values(data) as Series[];
    // const firstColLen: number = colData[0].shape[0];
    // const hasSameColLen = colData.map((item) => item.shape[0]).every((ln) => ln === firstColLen);
    // if (!hasSameColLen) {
    //    throw Error("Length Error: Length of columns must be the same!");
    // }
    const colData_: TArray1D[] = [];
    for (const col of colData) {
        colData_.push(col.values);
    }
    const rowsArr = transposeArray(colData_);
    return [rowsArr, colNames];
}

/**
 * Sorts a Map object by the order of keys specified in an array.
 *
 * @param map - The Map object to sort.
 * @param keys - An array of keys to sort the Map by. The order of keys in this array determines the order of entries in the sorted Map.
 * @returns A new Map object with the same entries as the input Map, sorted by the order of keys specified in the input keys array.
 *
 * @example
 * const map = new Map([
 *   ['name', 'Alice'],
 *   ['age', 30],
 *   ['city', 'New York'],
 * ]);
 *
 * const keys = ['age', 'name', 'city'];
 *
 * const sortedMap = sortMapByKeys(map, keys);
 *
 * // sortedMap is now a new Map object with the same entries as map,
 * // but sorted by the order of keys specified in the keys array:
 * // Map(3) { 'age' => 30, 'name' => 'Alice', 'city' => 'New York' }
 */
export function sortMapByKeys<T, P>(map: Map<T, P>, keys: T[]): Map<T, P> {
    return new Map([...map.entries()].sort((a, b) => {
        const keyA = a[0];
        const keyB = b[0];
        const indexA = keys.indexOf(keyA);
        const indexB = keys.indexOf(keyB);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    }));
}


/**
 * Infer data type from an array or array of arrays
 * @param data An array or array of arrays
 */
export function inferDtype(data: TArray1D | TArray2D, internalDtype: TinternalDtypes): TDtypes[] {
    if (internalDtype === 'Array1D') {
        return [typeChecker(data as TArray1D)];
    } else if (internalDtype === 'Array2D') {
        const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
        const arrSlice = transposeArray((data.slice(0, checklimit)) as TArray2D) 
        const dtypes = arrSlice.map((innerArr) => {
            return typeChecker(innerArr);
        });
        return dtypes;
    } else {
        throw Error("Data Error: Data must be a 1D or 2D array")     
    }
}

/**
 * Infers the data type of an array based on its contents.
 * 
 * The function iterates over a limited number of elements in the array (defined by `config.dtypeTestLim`)
 * and counts the occurrences of each data type (boolean, empty, datetime, float32, int32, string).
 * It then returns the most common data type found, or 'undefined' if all elements are empty.
 * 
 * @param {TArray1D} array - The input array to infer the data type from.
 * @returns {string} The inferred data type of the array.
 * 
 * @example
 * const array = [1, 2, 3, 4, 5];
 * const dtype = typeChecker(array);
 * console.log(dtype); // Output: 'int32'
 */

function typeChecker(array: TArray1D): TDtypes {
    const typeCountr = new Map<TDtypes | 'empty', number>()
    for (const ele of array) {
        if (typeof ele == "boolean") {
            typeCountr.set('boolean', (typeCountr.get('boolean') ?? 0) + 1)
        } else if (isEmpty(ele)) {
            // typeCountr.set('empty', (typeCountr.get('empty') ?? 0) + 1)
            continue
        } else if (isDate(ele)) {
            typeCountr.set('datetime', (typeCountr.get('datetime') ?? 0) + 1)
        } else if (!isNaN(Number(ele))) {
            if ((ele as unknown as string).toString().includes(".")) {
                typeCountr.set('float', (typeCountr.get('float') ?? 0) + 1)
            } else {
                typeCountr.set('int', (typeCountr.get('int') ?? 0) + 1)
            }
        } else {
            typeCountr.set('string', (typeCountr.get('string') ?? 0) + 1)
        }
    }
    if ((typeCountr.get('empty') ?? 0) == array.length)
        return 'string'
    if (typeChecker.length == 0)
        typeCountr.delete('empty')
    if ((typeCountr.get('string') ?? 0) > 0)
        return 'string'
    if ((typeCountr.get('float') ?? 0) > 0)
        return 'float'
    if ((typeCountr.get('int') ?? 0) > 0)
        return 'int'
    if ((typeCountr.get('boolean') ?? 0) > 0)
        return 'boolean'
    if ((typeCountr.get('datetime') ?? 0) > 0)
        return 'datetime'
    const maxType = [...typeCountr].reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return maxType as TDtypes;
}


/**
 * Transposes an array of array
 * @param obj The object to check.
 * @param key The key to find.
 */
export function transposeArray(arr: TArray2D): TArray2D {
    if (arr.length === 0 || arr[0].length === 0) {
        return arr.map(() => []);
    }
        const rowLen: number = arr.length;
        const colLen: number = arr[0].length;
        const transposed = [];
        for (let i = 0; i < colLen; i++) {
            const temp = [];
            for (let j = 0; j < rowLen; j++) {
            // const _elem = arr[j][i]
            temp.push(arr[j][i]);
            }
            transposed.push(temp);
        }
        return transposed;
}

export function castDtypes(data: TArray1D | TArray2D, dtypes: Array<TDtypes>, internalDtype: TinternalDtypes): TArray1D | TArray2D {
    if (internalDtype === 'Array1D') {
        let data_: TArray1D = []
        for (const dtype of dtypes) {
            if (dtype === 'string') {
                data_ = data.map(num => isEmpty(num) ? '' : num.toString());
            } else if (dtype === 'int') {
                data_ = data.map(num => Math.floor(num as number));
            } else if (dtype === 'float') {
                data_ = data.map(num => Number(num));
            } else if (dtype === 'boolean') {
                data_ = data.map(num => Boolean(num));
            } else if (dtype === 'datetime') {
                data_ = data.map(num => new Date(Date.parse(num as string)));
            }
        }
        return data_
    } else if (internalDtype === 'Array2D') {
        const data_: TArray2D = []
        for (const row of data as TArray2D) {
            const new_row = []
            let item
            for (let i = 0; i < dtypes.length; i++) {
                if (dtypes[i] === 'string')
                    item = String(row[i])
                else if (dtypes[i] === 'int')
                    item = Math.floor(row[i] as number)
                else if (dtypes[i] === 'float')
                    item = Number(row[i])
                else if (dtypes[i] === 'boolean')
                    item = Boolean(row[i])
                else if (dtypes[i] === 'datetime')
                    item = new Date(Date.parse(row[i] as string))
                else
                    continue
                new_row.push(item)
            }
            data_.push(new_row)
        }
        return data_
    }
    else {
        throw Error("Data Error: Data must be a 1D or 2D array")
    }
}

/**
 * Converts a 2D array of array to 1D array for Series Class
 * @param data The array to convert.
 */
export function convert2DArrayTo1DArray(data: TArray2D): TArray1D {
    const newArr = data.map((val) => val.toString());
    return newArr;
}

/**
* Generates an array of integers between specified range
* @param start The starting number.
* @param end The ending number.
*/
export function range(start: number, end: number): Array<number> {
    if (end < start) {
        throw new Error("ParamError: end must be greater than start")
    }
    if (start === end) {
        return [start]
    }
    const arr = [];
    for (let i = start; i <= end; i++) {
        arr.push(i);
    }
    return arr;
}

/**
* Remove NaN values from 1D array
* @param arr
*/
export function removeMissingValuesFromArray(arr: Array<number> | TArray1D) {
    const values = arr.filter((val) => {
        return !(isEmpty(val))
    })
    return values;
}