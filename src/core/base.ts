import {
    ArrayType1D,
    ArrayType2D,
    LoadArrayDataType,
    LoadObjectDataType,
    NdframeInputDataType,
    DataFrameConfig
} from "../types/base";
import { DATA_FRAME_CONFIG, DATA_TYPES } from "../constants";
import * as err from "../error";
import * as math from 'mathjs'

import * as utils from '../utility'


export default class NDframe {
    protected _isSeries: boolean
    protected _data: ArrayType2D | ArrayType1D
    // protected _dataIncolumnFormat: ArrayType1D | ArrayType2D
    protected _index: Array<string | number>
    protected _columns: string[]
    protected _dtypes: Map<string, string>
    protected _config: DataFrameConfig

    constructor({ isSeries, data, index, columns, dtypes, config }: NdframeInputDataType) {
        this._isSeries = isSeries
        this._data = []
        this._index = []
        this._columns = []
        this._dtypes = new Map<string, string>()
        this._config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG

        const data_ = data ?? []
        const columns_ = columns ?? []
        const dtypes_ = dtypes ?? []
        const index_ = index ?? []

        if (columns_.length === 0 && dtypes_.length !== 0)
            throw new err.DtypeWithoutColumnError();
        if (Array.isArray(data)) {
            if (utils.isObject(data[0]))
                // List of Object 
                this.loadObjectIntoNdframe({ data: data_, type: 1, index: index_, columns: columns_, dtypes: dtypes_ })
            else
                // ArrayType2D | ArrayType1D
                this.loadArrayIntoNdframe({ data: (data_ as ArrayType2D | ArrayType1D), index: index_, columns: columns_, dtypes: dtypes_ });
        } else if (utils.isObject(data))
            // Object 
            this.loadObjectIntoNdframe({ data: data_, type: 2, index: index_, columns: columns_, dtypes: dtypes_ });
        else
            throw new Error("File format not supported!");
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
        if (this._isSeries)
            return (this._data.length === 0) ? [0, 1] : [this._data.length, 1];
        else {
            if (this._data.length === 0) {
                return [0, 0]
            }
            else {
                const rowLen = (this._data).length
                const colLen = (this._data[0] as []).length
                return [rowLen, colLen]
            }
        }
    }

    /* private get row_count(): number {
        return this.shape[0]
    } */

    private get column_count(): number {
        return this.shape[1]
    }

    get isEmpty(): boolean {
        return this._data.length > 0 ? false : true
    }

    /**
     * Internal function to load array of data into NDFrame
     * @param data The array of data to load into NDFrame
     * @param index Array of numeric or string names for subsetting array.
     * @param columns Array of column names.
     * @param dtypes Array of data types for each the column.
    */
    private loadArrayIntoNdframe({ data, index, columns, dtypes }: LoadArrayDataType): void {
        // this.$data = utils.replaceUndefinedWithNaN(data, this.$isSeries);
        this._data = data
        if (!this._config.lowMemoryMode) {
            //In NOT low memory mode, we transpose the array and save in column format.
            //This makes column data retrieval run in constant time
            // this._dataIncolumnFormat = utils.transposeArray(data);
        }
        this.setIndex(index);
        this.setColumnNames(columns);
        this.setDtypes(dtypes);
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
    private loadObjectIntoNdframe({ data, type, index, columns, dtypes }: LoadObjectDataType): void {
        if (type === 1) {
            if (Array.isArray(data)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const _data = (data).map((item) => Object.values(item)) as ArrayType1D | ArrayType2D;
                let _columnNames = (typeof columns == 'undefined') ? columns : Object.keys(data[0] as object)
                _columnNames = (columns.length > 0) ? columns : _columnNames
                this.loadArrayIntoNdframe({ data: _data, index, columns: _columnNames, dtypes });
            }
            else
                throw Error('Not a Valid Data Type')
        } else {
            if (utils.isObject(data)) {
                const [_data, _colNames] = utils.getRowAndColValues(data);
                const _columnNames = (columns.length > 0) ? columns : _colNames
                this.loadArrayIntoNdframe({ data: _data, index, columns: _columnNames, dtypes });
            }
            else
                throw Error('Not a Valid Data Type')
        }
    }

    /**
     * Internal function to set the column names for the NDFrame. This function
     * performs a check to ensure that the column names are unique, and same length as the
     * number of columns in the data.
    */
    private setColumnNames(columns: string[] = []) {
        if (!Array.isArray(columns))
            throw new err.ColumnInvalidError()
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
            if (columns.length > 0) {
                if (this._data.length != 0 && columns.length != this.column_count) {
                    throw new err.ColumnNamesLengthError(columns, this.shape)
                }
                if (Array.from(new Set(columns)).length !== columns.length) {
                    throw new err.ColumnNamesLengthError(columns, this.shape)
                }
                const colset = new Map<string, number>()
                for (const item of columns) {
                    if (colset.has(item)) {
                        const count = colset.get(item) ?? 0 + 1
                        colset.set(item, count)
                    } else {
                        colset.set(item, 0)
                    }
                }
                for (const item of columns) {
                    const count = colset.get(item) ?? 0
                    const colname: string = (count > 0) ? `${item}_${count}` : item
                    this._columns.push(colname)
                }
            } else {
                this._columns = math.range(1, this.shape[1], true).toArray().map((val) => `column_${Number(val)}`) //generate columns
            }
        }
    }

    get columns(): string[] {
        return this._columns
    }

    /**
     * Internal function to set the index of the NDFrame with the specified
     * array of indices. Performs all necessary checks to ensure that the
     * index is valid.
    */
    private setIndex(index: Array<string | number> = []): void {
        if (!Array.isArray(index))
            throw new err.IndexInvalidError()
        if (index.length > 0) {
            if (this._data.length != 0 && index.length != this.shape[0]) {
                throw new err.IndexLengthError(index, this.shape)
            }
            if (Array.from(new Set(index)).length !== this.shape[0]) {
                throw new err.IndexDuplicateError()
            }
            this._index = index
        } else {
            this._index = math.range(0, this.shape[0] - 1).toArray() as Array<string | number> //generate index
        }
    }

    /**
     * Internal function to reset the index of the NDFrame using a range of indices.
    */
    resetIndex(): void {
        this._index = math.range(0, this.shape[0] - 1).toArray() as Array<string | number>
    }

    /**
     * Internal function to set the Dtypes of the NDFrame from an array. This function
     * performs the necessary checks.
    */
    private setDtypes(dtypes: Array<string> = []): void {
        if (!Array.isArray(dtypes))
            throw new err.DtypesInvalidError()
        const _dtypes = new Map<string, string>()
        let _dtypes_extracted = new Array<string>()
        if (this._isSeries) {
            if (dtypes) {
                if (this._data.length != 0 && dtypes.length != 1) {
                    throw new err.DtypesLengthError(dtypes, this.shape)
                }
                if (!(DATA_TYPES.includes(`${dtypes[0]}`))) {
                    throw new err.DtypeNotSupportedError(dtypes[0])
                }
                _dtypes_extracted = [dtypes[0]]
            } else {
                _dtypes_extracted = utils.inferDtype(this._data)
            }
        } else {
            if (dtypes.length > 0) {
                if (this._data.length != 0 && dtypes.length != this.column_count) {
                    throw new err.DtypesLengthError(dtypes, this.shape)
                }
                if (this._data.length == 0 && dtypes.length == 0) {
                    const col_name = this._columns[0]
                    this._dtypes.set(col_name, dtypes[0])
                } else {
                    dtypes.forEach((dtype) => {
                        if (!(DATA_TYPES.includes(dtype))) {
                            throw new err.DtypeNotSupportedError(dtype)
                        }
                    })
                    _dtypes_extracted = dtypes
                }
            } else {
                _dtypes_extracted = utils.inferDtype(this._data)
            }
        }
        for (let i = 0; i < _dtypes_extracted.length; i++) {
            const col_name = this._columns[i]
            const col_dtype = _dtypes_extracted[i]
            _dtypes.set(col_name, col_dtype)
        }
        this._dtypes = utils.sortMapByKeys(_dtypes, this._columns)
    }

    /**
     * Returns the dtypes of the columns
    */
    get dtypes(): Array<string> {
        return [...this._dtypes.values()]
    }

    /**
     * Returns the dimension of the data. Series have a dimension of 1,
     * while DataFrames have a dimension of 2.
    */
    get ndim(): number {
        return this._isSeries ? 1 : 2;
    }

    tocsv(sep: string, header: boolean): string {
        if (this._isSeries) {
            const csvStr = this._data.join(sep);
            return csvStr
        } else {
            const rows = this._data as ArrayType2D
            let csvStr = (header === true) ? `${this.columns.join(sep)}\n` : ""
            for (const item of rows) {
                const rowstr = `${item.join(sep)}\n`;
                csvStr += rowstr;
            }
            return csvStr
        }
    }

}