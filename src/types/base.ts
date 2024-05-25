import { ParseConfig } from 'papaparse';

export type DTYPES = "float32" | "int32" | "string" | "boolean" | "undefined"

export const DATA_TYPES = ["float32", "int32", "string", "boolean", "datetime", 'undefined'];

export type ArrayType2D = Array<
    number[]
    | string[]
    | boolean[]
    | Date[]
    | (number | string | boolean | Date)[]>

export type ArrayType1D = Array<
    number
    | string
    | boolean
    | Date
    | (number | string | boolean | Date)>

export interface DataFrameConfig {
    lowMemoryMode: boolean
    tfInstance: boolean
}

export interface BaseDataOptionType {
    type?: number;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Array<string>
    config?: DataFrameConfig;
}

export interface CsvInputOptionsBrowser extends ParseConfig {
    frameConfig?: BaseDataOptionType
}

export interface CsvOutputOptionsBrowser {
    fileName?: string,
    sep?: string,
    header?: boolean,
    download?: boolean
};

export interface NdframeInputDataType {
    isSeries: boolean;
    data: ArrayType1D | ArrayType2D | Array<object> | object;
    type?: number;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Array<string>
    config?: Partial<DataFrameConfig>;
}

export interface LoadArrayDataType {
    data: ArrayType1D | ArrayType2D
    index: Array<string | number>
    columns: string[]
    dtypes: Array<string>
}

export interface LoadObjectDataType {
    type: number;
    data: object | Array<object>
    index: Array<string | number>
    columns: string[]
    dtypes: Array<string>
}