import { BaseUserConfig, TableUserConfig, } from "table"
import { ParseConfig } from 'papaparse';

export type DTYPES = "float32" | "int32" | "string" | "boolean" | "undefined"

export const DATA_TYPES = ["float32", "int32", "string", "boolean", "datetime", 'undefined'];

export type ArrayType2D = Array<
    number[]
    | string[]
    | boolean[]
    | (number | string | boolean)[]>

export type ArrayType1D = Array<
    number
    | string
    | boolean
    | (number | string | boolean)>

export interface ConfigsType {
    tableDisplayConfig?: BaseUserConfig & TableUserConfig
    tableMaxRow?: number;
    tableMaxColInConsole?: number;
    dtypeTestLim?: number;
    lowMemoryMode?: boolean
    tfInstance?: boolean
}

export interface BaseDataOptionType {
    type?: number;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Array<string>
    config?: ConfigsType;
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
    data: ArrayType1D | ArrayType2D;
    type?: number;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Array<string>
    config?: ConfigsType;
}