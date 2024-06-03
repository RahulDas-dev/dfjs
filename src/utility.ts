
import { ArrayType1D, ArrayType2D, Dtypes } from "./types/base";
import { tableconfig } from "./config/tableconfig";


/**
 * Checks if array is 1D
 * @param data The array 
 */
export function isOneDArray<T>(data: T): boolean {
    if (Array.isArray(data)) {
        const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
        const arraySlice = data.slice(0, checklimit)
        return arraySlice.every(item => Array.isArray(item) === false)
    } else
        return false
}

/**
 * Checks if array is 2D
 * @param data The array 
 */
export function istwoDArray<T>(data: T): boolean {
    if (Array.isArray(data)) {
        const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
        const arraySlice = data.slice(0, checklimit)
        return arraySlice.every(item => Array.isArray(item) === true)
    } else
        return false
}

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
 * Checks if value is an object Array.
 * @param data The value to check.
 * @returns 
 */
export function isObjectArray<T>(data: T): boolean {
    if (Array.isArray(data)) {
        if (data.length == 0)
            return false
        const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
        return data.slice(0, checklimit).every((row) => isObject(row) === true)
    }
    return false
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
* Checks if a value is a date object
* @param value A date object
* @returns boolean
*/
export function isDate<T>(value: T): boolean {
    return value instanceof Date;
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
export function inferDtype(data: ArrayType1D | ArrayType2D): Dtypes[] {
    if (isOneDArray(data)) {
        return [typeChecker(data as ArrayType1D)];
    } else {
        const checklimit = (data.length < tableconfig.dtypeTestLim) ? data.length : tableconfig.dtypeTestLim;
        const arrSlice = transposeArray(data.slice(0, checklimit)) as ArrayType2D
        const dtypes = arrSlice.map((innerArr) => {
            return typeChecker(innerArr);
        });
        return dtypes;
    }
}

/**
 * Infers the data type of an array based on its contents.
 * 
 * The function iterates over a limited number of elements in the array (defined by `config.dtypeTestLim`)
 * and counts the occurrences of each data type (boolean, empty, datetime, float32, int32, string).
 * It then returns the most common data type found, or 'undefined' if all elements are empty.
 * 
 * @param {ArrayType1D} array - The input array to infer the data type from.
 * @returns {string} The inferred data type of the array.
 * 
 * @example
 * const array = [1, 2, 3, 4, 5];
 * const dtype = typeChecker(array);
 * console.log(dtype); // Output: 'int32'
 */

function typeChecker(array: ArrayType1D): Dtypes {
    const typeCountr = new Map<Dtypes | 'empty', number>()

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
    return maxType as Dtypes;
}


/**
 * Transposes an array of array
 * @param obj The object to check.
 * @param key The key to find.
 */
export function transposeArray(arr: ArrayType1D | ArrayType2D): ArrayType1D | ArrayType2D { //old name: __get_col_values
    if (arr.length === 0) return arr

    if (Array.isArray(arr[0])) {
        const rowLen: number = arr.length;
        const colLen: number = arr[0].length;
        const transposed = [];
        for (let i = 0; i < colLen; i++) {
            const temp = [];
            for (let j = 0; j < rowLen; j++) {
                const _elem = (arr as ArrayType2D)[j][i]
                temp.push(_elem);
            }
            transposed.push(temp);
        }
        return transposed;
    } else
        return arr;
}

/**
 * Retrieve row array and column names from an object of the form {a: [1,2,3,4], b: [30,20, 30, 20]}
 * @param obj The object to retrieve rows and column names from.
 */
export function getRowAndColValues(obj: object): [ArrayType1D | ArrayType2D, string[]] {
    const colNames = Object.keys(obj);
    const colData = Object.values(obj);
    const firstColLen = Array.isArray(colData[0]) ? colData[0].length : 1

    const hasSameColLen = colData.map((item) => Array.isArray(item) ? item.length : 1).every((ln) => ln === firstColLen)
    if (!hasSameColLen) {
        throw Error("Length Error: Length of columns must be the same!");
    }
    const rowsArr = transposeArray(colData)
    return [rowsArr, colNames];
}


export function castDtypes(data: ArrayType1D | ArrayType2D, dtypes: Array<Dtypes>): ArrayType1D | ArrayType2D {
    if (isOneDArray(data)) {
        let data_: ArrayType1D = []
        for (const dtype of dtypes) {
            if (dtype === 'string') {
                data_ = (data as ArrayType1D).map(num => isEmpty(num) ? '' : num.toString());
            } else if (dtype === 'int') {
                data_ = (data as ArrayType1D).map(num => Math.floor(num as number));
            } else if (dtype === 'float') {
                data_ = (data as ArrayType1D).map(num => Number(num));
            } else if (dtype === 'boolean') {
                data_ = (data as ArrayType1D).map(num => Boolean(num));
            } else if (dtype === 'datetime') {
                data_ = (data as ArrayType1D).map(num => new Date(Date.parse(num as string)));
            }
        }
        return data_
    } else {
        const data_: ArrayType2D = []
        for (const row of data as ArrayType2D) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
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
}

/**
 * Converts a 2D array of array to 1D array for Series Class
 * @param data The array to convert.
 */
export function convert2DArrayToSeriesArray(data: ArrayType2D): Array<string> {
    const newArr = data.map((val) => isObject(val) ? JSON.stringify(val) : `${val}`);
    return newArr;
}
