import { BASE_TABLE_CONFIG, TableConfigs } from "./config/tableconfig";
import { ArrayType1D, ArrayType2D } from "./types/base";

const config = new TableConfigs(BASE_TABLE_CONFIG);

/**
 * Checks if array is 1D
 * @param arr The array 
 */
export function is1DArray(arr: ArrayType1D | ArrayType2D): boolean {
    if (
        typeof arr[0] == "number" ||
        typeof arr[0] == "string" ||
        typeof arr[0] == "boolean" ||
        arr[0] === null
    ) {
        return true;
    } else {
        return false;
    }
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
 * Checks if a value is empty. Empty means it's either null, undefined or NaN
 * @param value The value to check.
 * @returns 
 */
export function isEmpty<T>(value: T): boolean {
    return value === undefined || value === null || (isNaN(value as number) && typeof value !== "string");
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
 * Infer data type from an array or array of arrays
 * @param arr An array or array of arrays
 */
export function inferDtype(arr: ArrayType1D | ArrayType2D) {
    if (is1DArray(arr)) {
        return [typeChecker(arr)];
    } else {
        const arrSlice = transposeArray(arr.slice(0, config.getDtypeTestLim))
        const dtypes = arrSlice.map((innerArr) => {
            return typeChecker(innerArr);
        });
        return dtypes;
    }
}

/**
 * Private type checker used by inferDtype function
 * @param arr The array
 */
function typeChecker(arr: ArrayType1D | ArrayType2D) {
    let dtypes: string;
    let lim: number;
    const intTracker: Array<boolean> = [];
    const floatTracker: Array<boolean> = [];
    const stringTracker: Array<boolean> = [];
    const boolTracker: Array<boolean> = [];
    const dateTracker: Array<boolean> = [];

    if (arr.length < config.getDtypeTestLim) {
        lim = arr.length;
    } else {
        lim = config.getDtypeTestLim;
    }

    const arrSlice = arr.slice(0, lim);

    for (let i = 0; i < lim; i++) {
        const ele = arrSlice[i];
        if (typeof ele == "boolean") {
            floatTracker.push(false);
            intTracker.push(false);
            stringTracker.push(false);
            boolTracker.push(true);
            dateTracker.push(false);
        } else if (isEmpty(ele)) {
            floatTracker.push(true);
            intTracker.push(false);
            stringTracker.push(false);
            boolTracker.push(false);
            dateTracker.push(false);
        } else if (isDate(ele)) {
            floatTracker.push(false);
            intTracker.push(false);
            stringTracker.push(false);
            boolTracker.push(false);
            dateTracker.push(true);
        } else if (!isNaN(Number(ele))) {
            if ((ele as unknown as string).toString().includes(".")) {
                floatTracker.push(true);
                intTracker.push(false);
                stringTracker.push(false);
                boolTracker.push(false);
                dateTracker.push(false);
            } else {
                floatTracker.push(false);
                intTracker.push(true);
                stringTracker.push(false);
                boolTracker.push(false);
                dateTracker.push(false);
            }
        } else {
            floatTracker.push(false);
            intTracker.push(false);
            stringTracker.push(true);
            boolTracker.push(false);
            dateTracker.push(false);
        }
    }

    const even = (ele: number | string | boolean) => ele == true;

    if (stringTracker.some(even)) {
        dtypes = "string";
    } else if (floatTracker.some(even)) {
        dtypes = "float32";
    } else if (intTracker.some(even)) {
        dtypes = "int32";
    } else if (boolTracker.some(even)) {
        dtypes = "boolean";
    } else if (dateTracker.some(even)) {
        dtypes = "datetime";
    } else {
        dtypes = "undefined";
    }
    return dtypes;
}


/**
 * Transposes an array of array
 * @param obj The object to check.
 * @param key The key to find.
 */
export function transposeArray(arr: ArrayType1D | ArrayType2D): ArrayType1D | ArrayType2D { //old name: __get_col_values
    if (arr.length === 0) return arr

    const rowLen: number = arr.length;
    if (Array.isArray(arr[0])) {
        const colLen: number = arr[0].length;
        const newArr = [];

        for (let i = 0; i <= colLen - 1; i++) {
            const temp = [];
            for (let j = 0; j < rowLen; j++) {
                const _elem = (arr as any)[j][i]
                temp.push(_elem);
            }
            newArr.push(temp);
        }
        return newArr;
    } else {
        return arr;
    }
}

/**
 * Retrieve row array and column names from an object of the form {a: [1,2,3,4], b: [30,20, 30, 20]}
 * @param obj The object to retrieve rows and column names from.
 */
export function getRowAndColValues(obj: object): [ArrayType1D | ArrayType2D, string[]] {
    const colNames = Object.keys(obj);
    const colData = Object.values(obj);
    const firstColLen = colData[0].length;

    colData.forEach((cdata) => {
        if (cdata.length != firstColLen) {
            throw Error("Length Error: Length of columns must be the same!");
        }
    });

    const rowsArr = transposeArray(colData)
    return [rowsArr, colNames];
}