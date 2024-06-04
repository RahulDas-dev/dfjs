import { ArrayType1D, BaseDataOptionType, DataFrameInterface } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";
import Series from "./series";
import * as err from "../error";
import * as utils from '../utility'

export default class DataFrame extends NDframe implements DataFrameInterface {

    constructor(data?: any, options: BaseDataOptionType = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG
        super({ isSeries: false, data, index, columns, dtypes, config: _config });
        this.setInternalColumnDataProperty();
    }
    head(rows?: number | undefined): DataFrame {
        throw new Error("Method not implemented.");
    }
    tail(rows?: number | undefined): DataFrame {
        throw new Error("Method not implemented.");
    }

    /**
     * Maps all column names to their corresponding data, and return them as Series objects.
     * This makes column subsetting works. E.g this can work ==> `df["col1"]`
     * @param column Optional, a single column name to map
     */
    private setInternalColumnDataProperty(column?: string) {
        const that = this;
        if (column && typeof column === "string") {
            Object.defineProperty(that, column, {
                get(): Series {
                    return that.getColumnData(column)
                },
                set(arr: ArrayType1D | Series) {
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
                    set(arr: ArrayType1D | Series) {
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
        const dtypes = this._dtypes.get(column) ? [this._dtypes.get(column)] : undefined
        const index = [...this._index]
        const columns = [column]
        const config = { ...this._config }
        const data: ArrayType1D = []
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
    private setColumnData(column: string, data: ArrayType1D | Series): void {
        const columnIndex = this._columns.indexOf(column)
        if (columnIndex == -1) {
            throw new Error(`ParamError: column ${column} not found in ${this._columns.join(', ')}. If you need to add a new column, use the df.addColumn method. `)
        }
        let colunmValuesToAdd: ArrayType1D
        if (data instanceof Series) {
            colunmValuesToAdd = data.values as ArrayType1D
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
        const _dtype = utils.inferDtype(colunmValuesToAdd)[0]
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
        const df = new DataFrame([...this._data], {
            columns: [...this.columns],
            index: [...this.index],
            dtypes: [...this._dtypes.values()],
            config: { ...this._config }
        });
        return df;
    }

}