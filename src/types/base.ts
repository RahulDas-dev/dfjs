import { ParseConfig } from 'papaparse';

export type Dtypes = "float" | "int" | "string" | "boolean" | "datetime"

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
    dtypes?: Dtypes
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
    data?: ArrayType1D | ArrayType2D | Array<object> | object;
    type?: number;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Dtypes
    config?: Partial<DataFrameConfig>;
}

export interface LoadArrayDataType {
    data?: ArrayType1D | ArrayType2D
    index: Array<string | number>
    columns?: string[]
    dtypes?: Dtypes
}

export interface LoadObjectDataType {
    type: number;
    data: object | Array<object>
    index: Array<string | number>
    columns: string[]
    dtypes?: Dtypes
}

export interface NDframeInterface {
    // config?: ConfigsType;
    setDtypes(dtypes: Array<string>, infer: boolean): void;
    setIndex(index: Array<string | number>): void;
    resetIndex(): void;
    setColumnNames(columns: string[]): void
    get dtypes(): Array<string>;
    get ndim(): number;
    // get axis(): AxisType;
    get index(): Array<string | number>;
    get columns(): string[]
    get shape(): Array<number>;
    get values(): ArrayType1D | ArrayType2D
    // get tensor(): any
    get size(): number;
    print(): void;
}

export type SeriesInterface = NDframeInterface