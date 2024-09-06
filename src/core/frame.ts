
import { TArray1D, TArray2D, IBaseDataOption, IDataFrame, InputDtypes } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";
import { _iloc } from './indexing'
import Series from "./series";
import * as err from "../error";
import * as utils from '../utility'
import * as tf from '@tensorflow/tfjs';

export default class DataFrame extends NDframe implements IDataFrame {


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

    head(rows = 5): DataFrame {
        if (rows <= 0) {
            throw new Error("ParamError: Number of rows cannot be less than 1")
        }
        if (this.shape[0] <= rows) {
            return this.copy()
        }
        return this.iloc({ rows: [`0:${rows}`] })
    }

    tail(rows = 5): DataFrame {
        if (rows <= 0) {
            throw new Error("ParamError: Number of rows cannot be less than 1")
        }
        if (this.shape[0] <= rows) {
            return this.copy()
        }
        if (this.shape[0] - rows < 0) {
            throw new Error("ParamError: Number of rows cannot be greater than available rows in data")
        }
        rows = this.shape[0] - rows
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
                }
            })
        } else {
            const columns = this.columns;
            for (const col of columns) {
                const column = col;
                Object.defineProperty(this, column, {
                    get(): Series {
                        return that.getColumnData(column)
                    },
                    set(arr: TArray1D | Series) {
                        that.setColumnData(column, arr);
                    }
                })
            }
        }
    }

    /**
     * Returns the column data from the DataFrame by column name. 
     * @param column column name to get the column data
     * @param returnSeries Whether to return the data in series format or not. Defaults to true
     */
    private getColumnData(column: string) {
        const columnIndex = this._columns.indexOf(column)
        if (columnIndex == -1) {
            throw new err.ColumnNotFoundError(column)
        }
        const col_dtype = this._dtypes.get(column)
        const dtypes = col_dtype !== undefined ? [col_dtype] : [];
        const index = [...this._index]
        const columns = [column]
        const config = { ...this._config }
        const data: TArray1D = []
        for (const row of this._data) {
            if (Array.isArray(row))
                data.push(row[columnIndex])
        }
        return new Series(data, {
            dtypes,
            index,
            columns,
            config
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
        if (colunmValuesToAdd.length !== this.shape[0]) {
            throw new err.ColumnNamesLengthError(this._columns, this.shape)
        }
        for (let i = 0; i < this._data.length; i++) {
            (this._data[i] as Array<string | number | boolean | Date>)[columnIndex] = colunmValuesToAdd[i]
        }
        const _dtype = utils.inferDtype(colunmValuesToAdd, 'Array1D')[0]
        this._dtypes.set(column, _dtype)
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
        for (const colName of numericColumnNames) {
            const series_stat = this.getColumnData(colName).describe();
            statsObject[colName] = series_stat;
        }
        const df = new DataFrame(statsObject, { index });
        return df
    }

    get tensor(): tf.Tensor2D {
        return tf.tensor2d((this._data as Array<Array<number>>), this.shape, "float32")
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