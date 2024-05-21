import { BaseUserConfig, TableUserConfig } from 'table';
import { ConfigsType } from '../types/base';


/**
 * Package wide configuration class
 */
export class TableConfigs {
    tableDisplayConfig: BaseUserConfig & TableUserConfig
    tableMaxRow: number;
    tableMaxColInConsole: number;
    dtypeTestLim: number;
    lowMemoryMode: boolean;

    constructor(options: ConfigsType) {
        const {
            tableDisplayConfig,
            tableMaxRow,
            tableMaxColInConsole,
            dtypeTestLim,
            lowMemoryMode,
        } = {
            tableDisplayConfig: {},
            tableMaxRow: 10,
            tableMaxColInConsole: 10,
            dtypeTestLim: 500,
            lowMemoryMode: false,
            ...options
        }
        this.tableDisplayConfig = tableDisplayConfig
        this.tableMaxRow = tableMaxRow  // The maximum number of rows to display in console
        this.tableMaxColInConsole = tableMaxColInConsole  // The maximum number of columns to display in console
        this.dtypeTestLim = dtypeTestLim  // The number of rows to use when inferring data type
        this.lowMemoryMode = lowMemoryMode  // Whether to use minimal memory or not.
    }

    setTableDisplayConfig(config: BaseUserConfig & TableUserConfig) {
        this.tableDisplayConfig = config;
    }

    get getTableDisplayConfig(): BaseUserConfig & TableUserConfig {
        return this.tableDisplayConfig;
    }

    setTableMaxColInConsole(val: number) {
        this.tableMaxColInConsole = val;
    }

    get getTableMaxColInConsole(): number {
        return this.tableMaxColInConsole;
    }

    setMaxRow(val: number) {
        this.tableMaxRow = val;
    }

    get getMaxRow(): number {
        return this.tableMaxRow;
    }

    get getDtypeTestLim(): number {
        return this.dtypeTestLim;
    }

    setDtypeTestLim(val: number) {
        this.dtypeTestLim = val;
    }

    get isLowMemoryMode(): boolean {
        return this.lowMemoryMode;
    }

    setIsLowMemoryMode(val: boolean) {
        this.lowMemoryMode = val;
    }
}

export const BASE_TABLE_CONFIG = {
    tableMaxRow: 10,
    tableMaxColInConsole: 10,
    dtypeTestLim: 20,
    lowMemoryMode: false,
}
