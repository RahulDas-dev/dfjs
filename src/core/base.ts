import {
    TArray1D,
    TArray2D,
    INdframeInputData,
    IDataFrameConfig,
    TDtypes,
    INDframe,
    TArrayOfRecord,
    TRecordOfArray,
    TRecordOfSeries,
    TinternalDtypes
} from "../types/base";
import { DATA_FRAME_CONFIG, DATA_TYPES } from "../constants";
import * as err from "../error";
import * as utils from '../utility'


export default class NDframe implements INDframe {

    protected readonly _isSeries: boolean
    protected _data: TArray2D | TArray1D
    protected _index: Array<string | number>
    protected _columns: string[]
    protected _dtypes: Map<string, TDtypes>
    protected _shape: [number, number]
    protected _internalDtypes: TinternalDtypes
    protected readonly _config: IDataFrameConfig

    constructor({ isSeries, data, index, columns, dtypes, config }: INdframeInputData) {

        this._isSeries = isSeries
        this._data = []
        this._index = []
        this._columns = []
        this._shape = [0, 0]
        this._dtypes = new Map<string, TDtypes>()
        this._internalDtypes = "unknown"
        this._config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG

        const data_ = data ?? [];
        const index_ = index ?? [];
        const columns_ = columns ?? []
        const dtypes_ = dtypes ?? []
        if (!Array.isArray(columns_))
            throw new err.ColumnTypeInvalidError()
        if (!Array.isArray(index_))
            throw new err.IndexInvalidError()
        if (utils.isOneDArray(data_))
            this._1Darray2Ndframe(data_, index_, columns_, dtypes_);
        else if (utils.isTwoDArray(data_))
            this._2Darray2Ndframe(data_, index_, columns_, dtypes_);
        else if (utils.isArrayOfRecord(data_))
            this._arrayOfRecords2Ndframe(data_, index_, columns_, dtypes_)
        else if (utils.isRecordOfArray(data_))
            this._recordOfArray2Ndframe(data_, index_, columns_, dtypes_);
        else if (utils.isRecordOfSeries(data_))
            this.series2Ndframe(data_, index_, columns_, dtypes_);
        else if (utils.isObject(data_))
            this._object2Ndframe(data_, index_, columns_, dtypes_);
        else
            throw new Error("File format not supported!");
    }
    get dtypes(): TDtypes[] {
        throw new Error("Method not implemented.");
    }
    get columns(): string[] {
        throw new Error("Method not implemented.");
    }

    get index(): (string | number)[] {
        return this._index
    }

    get size(): number {
        throw new Error("Method not implemented.");
    }

    get isSeries(): boolean {
        return this._isSeries;
    }

    /**
    * Returns the shape of the NDFrame. Shape is determined by [row length, column length]
    */
    get shape(): [number, number] {
        return this._shape
    }

    get config(): IDataFrameConfig {
        return this._config
    }



    /**
     * Internal function to load array of data into NDFrame
     * @param data The array of data to load into NDFrame
     * @param index Array of numeric or string names for subsetting array.
     * @param columns Array of column names.
     * @param TDtypes Array of data types for each the column.
    */
    private _array1or2DtoNdframe(data: TArray1D | TArray2D, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        this.setData(data)
        this.setIndex(index);
        this.setColumns(columns);
        this.setDtypes(dtypes);
    }

    private _1Darray2Ndframe(data: TArray1D, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        if (this._isSeries) {
            this._internalDtypes = 'Array1D'
            this._array1or2DtoNdframe(data, index, columns, dtypes);
        }
        else {
            this._internalDtypes = 'Array2D'
            const data_ = (data.length > 0) ? data.map((val) => [val]) as TArray2D : [[]]
            this._array1or2DtoNdframe(data_, index, columns, dtypes);
        }
    }

    private _2Darray2Ndframe(data: TArray2D, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        if (this._isSeries) {
            this._internalDtypes = 'Array1D'
            const data_ = (data.length > 0) ? data.map((val) => val.toString()) as TArray1D : []
            const dtypes_ = (dtypes.length > 0) ? (['string'] as TDtypes[]) : []
            this._array1or2DtoNdframe(data_, index, columns, dtypes_);
        }
        else {
            this._internalDtypes = 'Array2D'

            this._array1or2DtoNdframe(data, index, columns, dtypes);
        }
    }

    /**
     * Internal function to format and load a Javascript object or object of arrays into NDFrame.
     * @param data Object or object of arrays.
     * 
     * - object are in JSON format `[{a: 1, b: 2}, {a: 30, b: 20}]`.
     * 
     * @param index Array of numeric or string names for subsetting array.
     * @param columns Array of column names.
     * @param TDtypes Array of data types for each the column.
    */
    private _arrayOfRecords2Ndframe(data: TArrayOfRecord, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        const [data_, columns_] = utils.perseArrayOfRecord(data);
        if ((columns === undefined) || (Array.isArray(columns) && columns.length == 0))
            columns = columns_
        if (this._isSeries) {
            this._internalDtypes = 'Array1D'
            const _data_ = (data_.length === 1) ? data_[0] : data_.map((val) => val.toString())
            this._array1or2DtoNdframe(_data_, index, columns, dtypes);
        }
        else {
            this._internalDtypes = 'Array2D'
            this._array1or2DtoNdframe(data_, index, columns, dtypes);
        }
    }

    /**
     * Internal function to format and load a Javascript object or object of arrays into NDFrame.
     * @param data Object or object of arrays.
     * object are of the form `{a: [1,2,3,4], b: [30,20, 30, 20]}`
     * @param index Array of numeric or string names for subsetting array.
     * @param columns Array of column names.
     * @param TDtypes Array of data types for each the column.
    */
    private _recordOfArray2Ndframe(data: TRecordOfArray, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        const [data_, columns_] = utils.perseRecoredsOfArray(data);
        if ((columns === undefined) || (Array.isArray(columns) && columns.length == 0))
            columns = columns_
        if (this._isSeries) {
            this._internalDtypes = 'Array1D'
            const _data_ = (data_.length === 1) ? data_[0] : data_.map((val) => val.toString())
            this._array1or2DtoNdframe(_data_, index, columns, dtypes);
        }
        else {
            this._internalDtypes = 'Array2D'
            this._array1or2DtoNdframe(data_, index, columns, dtypes);
        }
    }

    private series2Ndframe(data: TRecordOfSeries, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        const [data_, columns_] = utils.perseRecoredsOfSeries(data);
        if ((columns === undefined) || (Array.isArray(columns) && columns.length == 0))
            columns = columns_
        if (this._isSeries) {
            this._internalDtypes = 'Array1D'
            const _data_ = (data_.length === 1) ? data_[0] : data_.map((val) => val.toString())
            this._array1or2DtoNdframe(_data_, index, columns, dtypes);
        } else {
            this._internalDtypes = 'Array2D'
            this._array1or2DtoNdframe(data_, index, columns, dtypes);
        }
    }

    private _object2Ndframe(data: Record<string | number, unknown>, index: (string | number)[], columns: string[], dtypes: TDtypes[]): void {
        const columns_ = Object.keys(data).map((val) => val.toString());
        if ((columns === undefined) || (Array.isArray(columns) && columns.length == 0)) {
            columns = columns_
        }
        if (this._isSeries) {
            this._internalDtypes = 'Array1D'
            const data_: TArray1D = Object.values(data) as TArray1D;
            this._array1or2DtoNdframe(data_, index, columns, dtypes);
        } else {
            this._internalDtypes = 'Array2D'
            const data_ = Object.values(data).map((val) => [val]) as TArray2D;
            this._array1or2DtoNdframe(data_, index, columns, dtypes);
        }
    }

    protected setData(data: TArray1D | TArray2D): void {
        this._data = data
        this.setShape()
    }

    protected setShape(): void {
        if (this._isSeries)
            this._shape = (this._data.length === 0) ? [0, NaN] : [this._data.length, NaN];
        else {
            if (this._data.length === 0) {
                this._shape = [0, 0]
            }
            else {
                const rowLen = (this._data).length
                if (Array.isArray(this._data[0])) {
                    const colLen = (this._data[0] as []).length
                    this._shape = [rowLen, colLen]
                } else {
                    this._shape = [rowLen, 1]
                }
            }
        }
    }

    /**
     * Internal function to set the column names for the NDFrame. This function
     * performs a check to ensure that the column names are unique, and same length as the
     * number of columns in the data.
    */
    setColumns(columns: string[]) {
        if (!Array.isArray(columns))
            throw new err.ColumnTypeInvalidError()
        if (this._isSeries) {
            if (columns.length > 0) {
                if (this._data.length != 0 && columns.length != 1 && typeof columns != 'string') {
                    throw new err.ColumnNamesLengthError(columns, this._shape)
                }
                this._columns = columns
            } else {
                this._columns = ["column_1"]
            }
        }
        else {
            if (columns.length > 0) {
                if (this._shape[1] > 0 && columns.length != this._shape[1]) {
                    throw new err.ColumnNamesLengthError(columns, this._shape)
                }
                const colset = new Map<string, number>()
                for (const item of columns) {
                    if (colset.has(item)) {
                        colset.set(item, (colset.get(item) ?? 0) + 1)
                    } else {
                        colset.set(item, 1)
                    }
                }
                for (const item of columns) {
                    const count = colset.get(item) ?? 0
                    const colname: string = (count > 1) ? `${item}_${count}` : item
                    this._columns.push(colname)
                }
            } else {
                if (this.shape[1] == 0)
                    this._columns = []
                else
                    this._columns = utils.range(0, this._shape[1]).map((val) => `column_${Number(val) + 1}`) //generate columns
            }
        }
    }

    /**
     * Internal function to set the index of the NDFrame with the specified
     * array of indices. Performs all necessary checks to ensure that the
     * index is valid.
    */
    setIndex(index: Array<string | number> = []): void {
        if (!Array.isArray(index))
            throw new err.IndexInvalidError()
        if (index.length > 0) {
            if (this._data.length != 0 && index.length != this._shape[0]) {
                throw new err.IndexLengthError(index, this._shape)
            }
            if (Array.from(new Set(index)).length !== this._shape[0]) {
                throw new err.IndexDuplicateError()
            }
            this._index = index
        } else {
            if (this._shape[0] == 0)
                this._index = []
            else
                this._index = utils.range(0, this._shape[0]) as Array<string | number>
        }
    }

    /**
     * Internal function to reset the index of the NDFrame using a range of indices.
    */
    resetIndex(): void {
        if (this._shape[0] == 0)
            this._index = []
        else
            this._index = utils.range(0, this._shape[0]) as Array<string | number>
    }

    /**
     * Internal function to set the TDtypes of the NDFrame from an array. This function
     * performs the necessary checks.
    */
    setDtypes(dtypes: Array<TDtypes> = []): void {
        const _dtypes = new Map<string, TDtypes>()
        let _dtypes_extracted = new Array<TDtypes>()
        if (this._isSeries) {
            if (!Array.isArray(dtypes))
                throw new err.DtypesInvalidError()
            else if (Array.isArray(dtypes)) {
                if (dtypes.length == 0) {
                    if (this._shape[0] == 0)
                        _dtypes_extracted = []
                    else if (this._shape[1] == 0)
                        _dtypes_extracted = []
                    else
                        _dtypes_extracted = utils.inferDtype(this._data, this._internalDtypes)
                }
                else if (dtypes.every(item => DATA_TYPES.includes(item) === true)) {
                    this._data = utils.castDtypes(this._data, dtypes, this._internalDtypes)
                    _dtypes_extracted = dtypes
                }
                else
                    throw new err.DtypesInvalidError()
            }
        }
        else {
            if (!Array.isArray(dtypes))
                throw new err.DtypesInvalidError()
            if (this._data.length == 0)
                _dtypes_extracted = []
            else {
                if (dtypes.length == 0) {
                    if (this._shape[0] == 0)
                        _dtypes_extracted = []
                    else if (this._shape[1] == 0)
                        _dtypes_extracted = []
                    else
                        _dtypes_extracted = utils.inferDtype(this._data, this._internalDtypes)
                }
                else if (dtypes.every(item => DATA_TYPES.includes(item) === true)) {
                    this._data = utils.castDtypes(this._data, dtypes, this._internalDtypes)
                    _dtypes_extracted = dtypes
                }
                else
                    throw new err.DtypesInvalidError()
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
     * Returns the dimension of the data. Series have a dimension of 1,
     * while DataFrames have a dimension of 2.
    */
    get ndim(): number {
        return this._isSeries ? 1 : 2;
    }
}