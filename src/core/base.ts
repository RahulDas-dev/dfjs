import { ArrayType1D, ArrayType2D, DATA_TYPES, NdframeInputDataType } from "../types/base";
import * as err from "../error";
import * as math from 'mathjs'

import * as utils from '../utility'
import { TableConfigs, BASE_TABLE_CONFIG } from "../config/tableconfig";

export default class NDframe {
    protected _isSeries: boolean;
    protected _data: ArrayType2D | ArrayType1D;
    protected _dataIncolumnFormat: ArrayType1D | ArrayType2D = []
    protected _index: Array<string | number > = []
    protected _columns: string[] = []
    protected _dtypes: Array<string> = []
    protected _config: TableConfigs
    
    constructor({isSeries, data, index, columns, dtypes, config}: NdframeInputDataType ) {
        if (config) {
            this._config = new TableConfigs({ ...BASE_TABLE_CONFIG, ...config });
        } else {
            this._config = new TableConfigs(BASE_TABLE_CONFIG);
        }
        this._isSeries = isSeries
        if (data === undefined || (Array.isArray(data) && data.length === 0)) {
            columns = (columns === undefined)? [] : columns ;
            dtypes  = (dtypes === undefined)? []: dtypes;
            if (columns.length === 0 && dtypes.length !== 0) 
                throw new err.DtypeWithoutColumnError();
            this.loadArrayIntoNdframe({ data: [], index: [], columns: columns, dtypes: dtypes });
        } else if (utils.is1DArray(data)) {
            this.loadArrayIntoNdframe({ data, index, columns, dtypes });
        } else {
            if (Array.isArray(data) && utils.isObject(data[0])) {
                this.loadObjectIntoNdframe({ data, type: 1, index, columns, dtypes });

            } else if (utils.isObject(data)) {
                this.loadObjectIntoNdframe({ data, type: 2, index, columns, dtypes });

            } else if (
                Array.isArray((data)[0]) ||
                math.isNumeric((data)[0]) ||
                utils.isString((data)[0])
            ) {
                this.loadArrayIntoNdframe({ data, index, columns, dtypes });
            } else if (Array.isArray(data) && data.length > 0 && utils.isDate(data[0])) {
                this.loadArrayIntoNdframe({ data, index, columns, dtypes });
            } else {
                throw new Error("File format not supported!");
            }
        }
    }

    /**
     * Returns the underlying data in Array format.
    */
    get values(): ArrayType1D | ArrayType2D {
        return this._data;
    }

    get isSeries(): boolean {
        return this._isSeries;
    }

    /**
     * Returns the shape of the NDFrame. Shape is determined by [row length, column length]
    */
    get shape(): Array<number> {
        if (this._isSeries) {
            if (this._data.length === 0)
                return [0, 1];
            else
                return [this._data.length, 1];
        } else {
            if (this._data.length === 0){
                return [0, 0]
            } 
            else {
                const rowLen = (this._data).length
                const colLen = (this._data[0] as []).length
                return [rowLen, colLen]
            }
        }
    }

    /**
     * Internal function to load array of data into NDFrame
     * @param data The array of data to load into NDFrame
     * @param index Array of numeric or string names for subsetting array.
     * @param columns Array of column names.
     * @param dtypes Array of data types for each the column.
    */
    private loadArrayIntoNdframe({ data, index, columns, dtypes }: Partial<NdframeInputDataType>): void {
        // this.$data = utils.replaceUndefinedWithNaN(data, this.$isSeries);
        this._data = data
        if (!this._config.isLowMemoryMode) {
            //In NOT low memory mode, we transpose the array and save in column format.
            //This makes column data retrieval run in constant time
            this._dataIncolumnFormat = utils.transposeArray(data)
        }
        this.setIndex(index);
        this.setDtypes(dtypes);
        this.setColumnNames(columns);
    }

    /**
     * Internal function to format and load a Javascript object or object of arrays into NDFrame.
     * @param data Object or object of arrays.
     * @param type The type of the object. There are two recognized types:
     * 
     * - type 1 object are in JSON format `[{a: 1, b: 2}, {a: 30, b: 20}]`.
     * 
     * - type 2 object are of the form `{a: [1,2,3,4], b: [30,20, 30, 20}]}`
     * @param index Array of numeric or string names for subsetting array.
     * @param columns Array of column names.
     * @param dtypes Array of data types for each the column.
    */
    private loadObjectIntoNdframe({ data, type, index, columns, dtypes }: Partial<NdframeInputDataType>): void {
        if (type === 1 && Array.isArray(data)) {
            const _data = (data).map((item) => {
                return Object.values(item);
            });

            let _columnNames;

            if (columns) {
                _columnNames = columns
            } else {
                _columnNames = Object.keys((data)[0]);
            }

            this.loadArrayIntoNdframe({ data: _data, index, columns: _columnNames, dtypes });

        } else {
            const [_data, _colNames] = utils.getRowAndColValues(data);
            let _columnNames;

            if (columns) {
                _columnNames = columns
            } else {
                _columnNames = _colNames
            }
            this.loadArrayIntoNdframe({ data: _data, index, columns: _columnNames, dtypes });
        }
    }


    /**
     * Internal function to set the column names for the NDFrame. This function
     * performs a check to ensure that the column names are unique, and same length as the
     * number of columns in the data.
    */
    private setColumnNames( columns? : string[]) {
        if (this._isSeries) {
            if (columns) {
                if (this._data.length != 0 && columns.length != 1 && typeof columns != 'string') {
                    throw new err.ColumnNamesLengthError(columns, this.shape)
                }
                this._columns = columns
            } else {
                this._columns = ["0"]
            }
        } else {
            if (columns) {
                if (this._data.length != 0 && columns.length != this.shape[1]) {
                    throw new err.ColumnNamesLengthError(columns, this.shape)
                }
                if (Array.from(new Set(columns)).length !== columns.length) {
                    throw new err.ColumnNamesLengthError(columns, this.shape)
                }
                this._columns = columns
            } else {
                this._columns = math.range(0, this.shape[1] - 1).toArray().map((val) => `column_${val}`) //generate columns
            }
        }
    }

    get columns(): string[]{
        return this._columns
    }

    /**
     * Internal function to set the index of the NDFrame with the specified
     * array of indices. Performs all necessary checks to ensure that the
     * index is valid.
    */
    private setIndex(index: Array<string | number> | undefined): void {
        if (index) {

            if (this._data.length != 0 && index.length != this.shape[0]) {
                throw new err.IndexLengthError(index, this.shape)
            }
            if (Array.from(new Set(index)).length !== this.shape[0]) {
                throw new err.IndexDuplicateError()
            }
            this._index = index
        } else {
            this._index = math.range(0, this.shape[0] - 1).toArray() as  Array<string | number > //generate index
        }
    }

    /**
     * Internal function to reset the index of the NDFrame using a range of indices.
    */
    resetIndex(): void {
        this._index = math.range(0, this.shape[0] - 1).toArray() as Array<string | number >
    }

    /**
     * Internal function to set the Dtypes of the NDFrame from an array. This function
     * performs the necessary checks.
    */
    private setDtypes(dtypes: Array<string> | undefined): void {
        if (this._isSeries) {
            if (dtypes) {
                if (this._data.length != 0 && dtypes.length != 1) {
                    throw new err.DtypesLengthError(dtypes, this.shape)
                }

                if (!(DATA_TYPES.includes(`${dtypes[0]}`))) {
                    throw new err.DtypeNotSupportedError(dtypes[0])
                }

                this._dtypes = dtypes
            } else {
                this._dtypes = utils.inferDtype(this._data)
            }

        } else {
            if (dtypes) {
                if (this._data.length != 0 && dtypes.length != this.shape[1]) {
                    throw new err.DtypesLengthError(dtypes, this.shape)
                }
                if (this._data.length == 0 && dtypes.length == 0) {
                    this._dtypes = dtypes
                } else {
                    dtypes.forEach((dtype) => {
                        if (!(DATA_TYPES.includes(dtype))) {
                            throw new err.DtypeNotSupportedError(dtype)
                        }
                    })
                    this._dtypes = dtypes
                }
            } else {
                this._dtypes = utils.inferDtype(this._data)
            }
        }
    }

    
    /**
     * Returns the dtypes of the columns
    */
    get dtypes(): Array<string> {
        return this._dtypes
    }

    /**
     * Returns the dimension of the data. Series have a dimension of 1,
     * while DataFrames have a dimension of 2.
    */
    get ndim(): number {
        return this._isSeries ? 1 : 2 ;
    }

    tocsv(sep: string, header: boolean): string{
        if (this._isSeries){
            const csvStr = this._data.join(sep);
            return csvStr
        } else{
            const rows = this._data as ArrayType2D
            let csvStr = (header === true) ? `${this.columns.join(sep)}\n` : ""
            for (let i = 0; i < rows.length; i++) {
                const row = `${rows[i].join(sep)}\n`;
                csvStr += row;
            }
            return csvStr
        }
        
    }

}