
import { TArray1D, TArray2D, IBaseDataOption, IDataFrame, InputDtypes, TDtypes, TRecordOfArray } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";
import { _iloc } from './indexing'
import Series from "./series";
import * as err from "../error";
import * as utils from '../utility'
import * as tf from '@tensorflow/tfjs';

export default class DataFrame extends NDframe implements IDataFrame {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string | symbol]: any;

    constructor(data?: InputDtypes, options: IBaseDataOption = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG
        super({ isSeries: false, data, index, columns, dtypes, config: _config });
        this.setInternalColumnDataProperty();
    }

    /**
    * Returns the underlying data in Array format.
    */
    get values(): TArray2D {
        return this._data as TArray2D;
    }

    get columns(): string[] {
        return this._columns
    }

    get isEmpty(): boolean {
        return this._shape[1] > 0 ? false : true
    }

    /**
     * Returns the TDtypes of the columns
    */
    get dtypes(): Array<TDtypes> {
        return [...this._dtypes.values()]
    }

    head(rows = 5): DataFrame {
        if (rows <= 0) {
            throw new Error("ParamError: Number of rows cannot be less than 1")
        }
        if (this._shape[0] <= rows) {
            return this.copy()
        }
        return this.iloc({ rows: [`0:${rows}`] })
    }

    tail(rows = 5): DataFrame {
        if (rows <= 0) {
            throw new Error("ParamError: Number of rows cannot be less than 1")
        }
        if (this._shape[0] <= rows) {
            return this.copy()
        }
        if (this._shape[0] - rows < 0) {
            throw new Error("ParamError: Number of rows cannot be greater than available rows in data")
        }
        rows = this._shape[0] - rows
        return this.iloc({ rows: [`${rows}:`] })
    }

    iloc({ rows, columns }: {
        rows?: Array<string | number | boolean> | Series,
        columns?: Array<string | number>
    }): DataFrame {
        return _iloc({ ndFrame: this, rows, columns }) as DataFrame;
    }

    /**
     * Maps all column names to their corresponding data, and return them as Series objects.
     * This makes column subsetting works. E.g this can work ==> `df["col1"]`
     * @param column Optional, a single column name to map
     */
    private setInternalColumnDataProperty(column?: string) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        if (column && typeof column === "string") {
            Object.defineProperty(that, column, {
                get(): Series {
                    return that.getColumnData(column)
                },
                set(arr: TArray1D | Series) {
                    that.setColumnData(column, arr);
                },
                configurable: true,
                enumerable: true
            })
        } else {
            const columns = this._columns;
            for (const col of columns) {
                const column = col;
                Object.defineProperty(this, column, {
                    get(): Series {
                        return that.getColumnData(column)
                    },
                    set(arr: TArray1D | Series) {
                        that.setColumnData(column, arr);
                    },
                    configurable: true,
                    enumerable: true
                })
            }
        }
    }

    /**
     * Returns the column data from the DataFrame by column name. 
     * @param column column name to get the column data
     * @param returnSeries Whether to return the data in series format or not. Defaults to true
     */
    private getColumnData(column: string): Series {
        const columnIndex = this._columns.indexOf(column)
        if (columnIndex == -1) {
            throw new err.ColumnNotFoundError(column)
        }
        const data: TArray1D = []
        for (const row of this._data) {
            if (Array.isArray(row))
                data.push(row[columnIndex])
        }
        return new Series(data, {
            dtype: this._dtypes.get(column),
            index: [...this._index],
            name: column,
            config: { ...this.config }
        })

    }

    /**
     * Updates the internal column data via column name.
     * @param column The name of the column to update.
     * @param arr The new column data
     */
    private setColumnData(column: string, data: TArray1D | Series): void {
        const columnIndex = this._columns.indexOf(column)
        if (columnIndex == -1) {
            throw new Error(`ParamError: column ${column} not found in ${this._columns.join(', ')}. If you need to add a new column, use the df.addColumn method. `)
        }
        let colunmValuesToAdd: TArray1D
        if (data instanceof Series) {
            colunmValuesToAdd = data.values
        } else if (Array.isArray(data)) {
            colunmValuesToAdd = data;
        } else {
            throw new Error("ParamError: specified value not supported. It must either be an Array or a Series of the same length")
        }
        if (colunmValuesToAdd.length !== this._shape[0]) {
            throw new err.ColumnNamesLengthError(this._columns, this._shape)
        }
        for (let i = 0; i < this._data.length; i++) {
            (this._data[i] as Array<string | number | boolean | Date>)[columnIndex] = colunmValuesToAdd[i]
        }
        const _dtype = utils.inferDtype(colunmValuesToAdd, 'Array1D')[0]
        this._dtypes.set(column, _dtype)
    }

    get(columns: string[] | string): DataFrame | Series {
        if (Array.isArray(columns)) {
            const data: TRecordOfArray = {}
            for (const col of columns) {
                const columnIndex = this._columns.indexOf(col)
                if (columnIndex == -1) {
                    throw new err.ColumnNotFoundError(col)
                }
                data[col] = (this._data as TArray2D).map((row) => row[columnIndex]) as TArray1D
            }
            return new DataFrame(data, {
                columns: [...columns],
                index: [...this._index],
                dtypes: columns.map((col) => this._dtypes.get(col)!),
                config: { ...this.config }
            })
        } else {
            return this.getColumnData(columns)
        }
    }

    [Symbol.iterator]() {
        let index = -1;
        const data = this._data;

        return {
            next: () => ({ value: data[++index], done: !(index in data) })
        };
    }

    /**
     * Makes a deep copy of a DataFrame.
     * @example
     * ```
     * const df = new DataFrame([[1, 2], [3, 4]], { columns: ['A', 'B']})
     * const df2 = df.copy()
     * df2.print()
     * ```
     */
    copy(): DataFrame {
        const df = new DataFrame([...this.values], {
            columns: [...this.columns],
            index: [...this.index],
            dtypes: [...this._dtypes.values()],
            config: { ...this._config }
        });
        return df;
    }

    /**   
    * Return the numrical columns in the DataFrame    
    */
    private _numerical_columns() {
        const numericalColumns: string[] = [];
        this._dtypes.forEach((dtype, column) => {
            if (['number', 'float', 'int'].includes(dtype)) {
                numericalColumns.push(column);
            }
        });
        return numericalColumns;
    }

    /* private _categorical_columns() {
        const categoricalColumns: string[] = [];
        this._dtypes.forEach((dtype, column) => {
            if (dtype === 'string') {
                categoricalColumns.push(column);
            }
        });
        return categoricalColumns;
    }

    private _boolean_columns() {
        const categoricalColumns: string[] = [];
        this._dtypes.forEach((dtype, column) => {
            if (dtype === 'boolean') {
                categoricalColumns.push(column);
            }
        });
        return categoricalColumns;
    }

    private _date_columns() {
        const categoricalColumns: string[] = [];
        this._dtypes.forEach((dtype, column) => {
            if (dtype === 'datetime') {
                categoricalColumns.push(column);
            }
        });
        return categoricalColumns;
    } */

    /**
    * Generate descriptive statistics for all numeric columns.
    * Descriptive statistics include those that summarize the central tendency,
    * dispersion and shape of a datasetÃ¢â‚¬â„¢s distribution, excluding NaN values.
    * @example
    * ```
    * const df = new DataFrame([[1, 2], [3, 4]], { columns: ['A', 'B']})
    * df.describe().print()
    * ```
    */
    describe(): DataFrame {
        const numericColumnNames = this._numerical_columns()
        const index = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
        const statsObject: Record<string, Series> = {};
        const columns = [];
        const dtypes = []
        for (const colName of numericColumnNames) {
            const series_stat = this.getColumnData(colName).describe();
            statsObject[colName] = series_stat;
            columns.push(colName);
            dtypes.push('float')
        }
        const df = new DataFrame(statsObject, { index });
        return df
    }

    /*
    * 
    */
    mean(): Series {
        const numericColumnNames = this._numerical_columns()
        if (numericColumnNames.length === 0) {
            throw new Error("No numeric columns found in DataFrame")
        }
        const means = []
        for (const colName of numericColumnNames) {
            const series_mean = this.getColumnData(colName).mean();
            means.push({ [colName]: series_mean })
        }
        const index = means.map((item) => Object.keys(item)[0])
        const se = new Series(means, { index, name: 'mean', dtype: 'float' });
        return se
    }

    sum(): Series {
        const numericColumnNames = this._numerical_columns()
        if (numericColumnNames.length === 0) {
            throw new Error("No numeric columns found in DataFrame")
        }
        const sums = [] as Array<Record<string, number>>
        for (const colName of numericColumnNames) {
            const series_sum = this.getColumnData(colName).sum();
            sums.push({ [colName]: series_sum })
        }
        const index = sums.map((item) => Object.keys(item)[0])
        const se = new Series(sums, { index, name: 'sum', dtype: 'float' });
        return se
    }

    std(): Series {
        const numericColumnNames = this._numerical_columns()
        if (numericColumnNames.length === 0) {
            throw new Error("No numeric columns found in DataFrame")
        }
        const stds = [] as Array<Record<string, number>> // Array of objects with column name as key and std as value )
        for (const colName of numericColumnNames) {
            const series_std = this.getColumnData(colName).std();
            stds.push({ [colName]: series_std })
        }
        const index = stds.map((item) => Object.keys(item)[0])
        const se = new Series(stds, { index, name: 'std', dtype: 'float' });
        return se
    }

    median(): Series {
        const numericColumnNames = this._numerical_columns()
        if (numericColumnNames.length === 0) {
            throw new Error("No numeric columns found in DataFrame")
        }
        const medians = [] as Array<Record<string, number>> // Array of objects with column name as key and std as value )  '
        for (const colName of numericColumnNames) {
            const series_median = this.getColumnData(colName).median();
            medians.push({ [colName]: series_median })
        }
        const index = medians.map((item) => Object.keys(item)[0])
        const se = new Series(medians, { index, name: 'median', dtype: 'float' });
        return se
    }

    min(): Series {
        const numericColumnNames = this._numerical_columns()
        if (numericColumnNames.length === 0) {
            throw new Error("No numeric columns found in DataFrame")
        }
        const mins = [] as Array<Record<string, number>>
        for (const colName of numericColumnNames) {
            const series_min = this.getColumnData(colName).min();
            mins.push({ [colName]: series_min })
        }
        const index = mins.map((item) => Object.keys(item)[0])
        const se = new Series(mins, { index, name: 'min', dtype: 'float' });
        return se
    }

    max(): Series {
        const numericColumnNames = this._numerical_columns()
        if (numericColumnNames.length === 0) {
            throw new Error("No numeric columns found in DataFrame")
        }
        const maxs = [] as Array<Record<string, number>>
        for (const colName of numericColumnNames) {
            const series_max = this.getColumnData(colName).max();
            maxs.push({ [colName]: series_max })
        }
        const index = maxs.map((item) => Object.keys(item)[0])
        const se = new Series(maxs, { index, name: 'max', dtype: 'float' });
        return se
    }


    get tensor(): tf.Tensor2D {
        return tf.tensor2d((this._data as Array<Array<number>>), this._shape, "float32")
    }

    isna(): DataFrame {
        const data = this._data as TArray2D
        const isnaData: Array<Array<boolean>> = []
        for (const row of data) {
            const isnaRow: Array<boolean> = []
            for (const item of row) {
                isnaRow.push(utils.isEmpty(item))
            }
            isnaData.push(isnaRow)
        }
        const df = new DataFrame(isnaData, {
            columns: [...this._columns],
            index: [...this._index],
            dtypes: new Array(this._columns.length).fill('boolean'),
            config: { ...this._config }
        })
        return df
    }

    drop(options: { columns?: string[] | string, index?: Array<string | number>, inplace?: boolean }): DataFrame | void {
        const { columns, index, inplace } = { inplace: false, ...options }
        if (!columns && !index) {
            throw Error('ParamError: Must specify one of columns or index');
        }
        if (columns && index) {
            throw Error('ParamError: Can only specify one of columns or index');
        }
        if (columns) {
            const columns_ = Array.isArray(columns) ? columns : [columns]
            for (const col of columns_) {
                if (this._columns.indexOf(col) === -1) {
                    throw Error(`ParamError: specified column "${col}" not found in columns`);
                }
            }
            return this._dropColumns(columns_, inplace);
        }
        if (index) {
            const rowIndices: Array<number> = []
            if (typeof index === "string" || typeof index === "number" || typeof index === "boolean") {
                if (this._index.indexOf(index) === -1) {
                    throw Error(`ParamError: specified index ${String(index)} not found in indices`);
                }
                rowIndices.push(this._index.indexOf(index))
            } else if (Array.isArray(index)) {
                for (const idx of index) {
                    if (this._index.indexOf(idx) === -1) {
                        throw Error(`ParamError: specified index "${idx}" not found in indices`);
                    }
                    rowIndices.push(this._index.indexOf(idx));
                }
            } else {
                throw Error('ParamError: index must be an array of indices or a scalar index');
            }
            return this._dropRows(rowIndices, inplace);
        }
    }

    private _dropColumns(columns: string[], inplace: boolean): DataFrame | void {
        const data = this._data as TArray2D
        const newColumns = this._columns.filter((col) => !columns.includes(col))
        const newData = data.map((row) => {
            const newRow = row.filter((_, i) => !columns.includes(this._columns[i]))
            return newRow
        })
        if (inplace) {
            this.setData(newData)
            this._columns = newColumns
            this.setInternalColumnDataProperty()
            this._dtypes = new Map(newColumns.map((col) => [col, this._dtypes.get(col)!]))
        } else {
            const df = new DataFrame(newData, {
                columns: newColumns,
                index: [...this._index],
                dtypes: newColumns.map((col) => this._dtypes.get(col)!),
                config: { ...this.config }
            });
            return df
        }
    }

    private _dropRows(index: Array<string | number>, inplace: boolean): DataFrame | void {
        const data = this._data as TArray2D
        const newData = data.filter((_row, i) => !index.includes(i))
        if (inplace) {
            this.setData(newData)
            this._index = this._index.filter((_, i) => !index.includes(i))
        } else {
            const df = new DataFrame(newData, {
                columns: [...this._columns],
                index: this._index.filter((_, i) => !index.includes(i)),
                dtypes: [...this._dtypes.values()],
                config: { ...this.config }
            });
            return df
        }
    }


    print(): void {
        throw new Error("Method not implemented.");
    }

    tocsv(sep: string, header: boolean): string {
        const rows = this._data as TArray2D
        let csvStr = (header === true) ? `${this.columns.join(sep)}\n` : ""
        for (const item of rows) {
            const rowstr = `${item.join(sep)}\n`;
            csvStr += rowstr;
        }
        return csvStr
    }
}