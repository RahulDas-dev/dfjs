import { ArrayType1D, BaseDataOptionType } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";
import Series from "./series";
import * as err from "../error";
import * as utils from '../utility'

export default class DataFrame extends NDframe {

    constructor(data?: any, options: BaseDataOptionType = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG
        super({ isSeries: false, data, index, columns, dtypes, config: _config });
        this.setInternalColumnDataProperty();
    }

    /**
     * Maps all column names to their corresponding data, and return them as Series objects.
     * This makes column subsetting works. E.g this can work ==> `df["col1"]`
     * @param column Optional, a single column name to map
     */
    private setInternalColumnDataProperty(column?: string) {
        const self = this;
        if (column && typeof column === "string") {
            Object.defineProperty(self, column, {
                get() {
                    return self.getColumnData(column)
                },
                set(arr: ArrayType1D | Series) {
                    self.setColumnData(column, arr);
                }
            })
        } else {
            const columns = this.columns;
            for (const col of columns) {
                const column = col;
                Object.defineProperty(this, column, {
                    get() {
                        return self.getColumnData(column)
                    },
                    set(arr: ArrayType1D | Series) {
                        self.setColumnData(column, arr);
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
    private getColumnData(column: string, returnSeries = true) {
        const columnIndex = this._columns.indexOf(column)

        if (columnIndex == -1) {
            throw new err.ColumnNotFoundError(column)
        }

        const dtypes = this._dtypes.get(column)
        const index = [...this._index]
        const columns = [column]
        const config = { ...this._config }
        const data: ArrayType1D = []
        for (const row of this._data) {
            data.push(row[columnIndex])
        }
        if (returnSeries) {
            return new Series(data, {
                dtypes,
                index,
                columns,
                config
            })
        } else {
            return data
        }
    }

    /**
     * Updates the internal column data via column name.
     * @param column The name of the column to update.
     * @param arr The new column data
     */
    private setColumnData(column: string, data: ArrayType1D | Series): void {

        const columnIndex = this._columns.indexOf(column)

        if (columnIndex == -1) {
            throw new Error(`ParamError: column ${column} not found in ${this._columns}. If you need to add a new column, use the df.addColumn method. `)
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

        if (this._config.lowMemoryMode) {
            //Update row ($data) array
            for (let i = 0; i < this._data.length; i++) {
                (this._data as any)[i][columnIndex] = colunmValuesToAdd[i]
            }
            //Update the dtypes
            const _dtype = utils.inferDtype(colunmValuesToAdd)[0]
            this._dtypes.set(column, _dtype)

        }
    }


}