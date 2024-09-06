import { IDataFrameConfig } from "./types/base";

export const DATA_TYPES = ["float", "int", "string", "boolean", "datetime"];

export const FLT_DEFAULT_VAL = 0.0
export const INT_DEFAULT_VAL = 0
export const STR_DEFAULT_VAL = ''
export const BOL_DEFAULT_VAL = false
export const DTE_DEFAULT_VAL = ''

export const DATA_FRAME_CONFIG: IDataFrameConfig = {
    lowMemoryMode: false,
    tfInstance: false,
}