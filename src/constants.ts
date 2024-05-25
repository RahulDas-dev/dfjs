import { DataFrameConfig } from "./types/base";

export const DATA_TYPES = ["float32", "int32", "string", "boolean", "datetime", 'undefined'];

export const DATA_FRAME_CONFIG: DataFrameConfig = {
    lowMemoryMode: false,
    tfInstance: false,
}