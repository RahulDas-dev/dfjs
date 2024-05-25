import { BaseUserConfig, TableUserConfig } from 'table';


export const BASE_TABLE_CONFIG = {
    _tableMaxRow: 10,
    _tableMaxColInConsole: 10,
    _dtypeTestLim: 100,
    _lowMemoryMode: false,
}

/**
 * Package wide configuration class
 */
export class TableConfigs {

    constructor(
        private _tableDisplayConfig: BaseUserConfig & TableUserConfig = {},
        private _tableMaxRow = 10,
        private _tableMaxColInConsole = 10,
        private _dtypeTestLim = 100,
        private _lowMemoryMode = false) {

    }

    set tableDisplayConfig(config: BaseUserConfig & TableUserConfig) {
        this._tableDisplayConfig = config;
    }

    get tableDisplayConfig(): BaseUserConfig & TableUserConfig {
        return this._tableDisplayConfig;
    }

    set tableMaxColInConsole(val: number) {
        this._tableMaxColInConsole = val;
    }

    get tableMaxColInConsole(): number {
        return this._tableMaxColInConsole;
    }

    set tableMaxRow(val: number) {
        this._tableMaxRow = val;
    }

    get tableMaxRow(): number {
        return this._tableMaxRow;
    }

    get dtypeTestLim(): number {
        return this._dtypeTestLim;
    }

    set dtypeTestLim(val: number) {
        this._dtypeTestLim = val;
    }

    get lowMemoryMode(): boolean {
        return this._lowMemoryMode;
    }

    set lowMemoryMode(val: boolean) {
        this._lowMemoryMode = val;
    }
}



export const tableconfig = new TableConfigs()