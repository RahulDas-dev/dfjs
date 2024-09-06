import { ParseConfig } from 'papaparse';
import DataFrame from '../core/frame';
import Series from '../core/series';
import * as tf from '@tensorflow/tfjs';


export type TDtypes = "float" | "int" | "string" | "boolean" | "datetime"

export type TinternalDtypes = "Array1D" | "Array2D" | "unknown"

export type TItem = number | string | Date | boolean

export type TArray1D = Array<number | string | Date | TItem>

export type TArray2D = Array<number[] | string[] | boolean[] | Date[] | TArray1D>

export type TArrayOfRecord = Array<Record<string | number, TItem>>;

export type TRecordOfArray = Record<string | number, TArray1D>;

export type TRecordOfSeries = Record<string | number, object>;

export type TSimpleRecord = Record<string | number, TItem>;

export type InputDtypes = TArray1D | TArray2D | TArrayOfRecord | TRecordOfArray | TRecordOfSeries | TSimpleRecord

export interface IDataFrameConfig {
    lowMemoryMode: boolean
    tfInstance: boolean
}

export interface IBaseDataOption {
    type?: number;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Array<TDtypes>
    config?: IDataFrameConfig;
}

export interface ICsvInputOptionsBrowser extends ParseConfig {
    frameConfig?: IBaseDataOption
}

export interface ICsvOutputOptionsBrowser {
    fileName?: string,
    sep?: string,
    header?: boolean,
    download?: boolean
};


export interface INdframeInputData {
    isSeries: boolean;
    data?: InputDtypes;
    index?: Array<string | number>
    columns?: string[]
    dtypes?: Array<TDtypes>
    config?: Partial<IDataFrameConfig>;
}

export interface INDframe {
    setDtypes(dtypes: Array<TDtypes> | undefined): void;
    setIndex(index: Array<string | number>): void;
    resetIndex(): void;
    setColumns(columns: string[]): void
    get config(): IDataFrameConfig;
    get dtypes(): Array<TDtypes>;
    get ndim(): number;
    get index(): Array<string | number>;
    get columns(): string[]
    get shape(): [number, number];
    get size(): number;
}


export interface ISeries extends INDframe {
    head(rows?: number): Series
    tail(rows?: number): Series
    get values(): TArray1D
    get tensor(): tf.Tensor1D
    get columns(): [string]
    copy(): Series
    print(): void;
    tocsv(sep: string): string
}


export interface IDataFrame extends INDframe {
    head(rows?: number): DataFrame
    tail(rows?: number): DataFrame
    get values(): TArray2D
    get tensor(): tf.Tensor2D
    get columns(): string[]
    copy(): DataFrame
    describe(): DataFrame
    print(): void;
    tocsv(sep: string, header: boolean): string
}