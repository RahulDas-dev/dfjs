import Series from "./series";

import DataFrame from "./frame";
import { INDframe, TDtypes } from "../types/base";
import * as math from 'mathjs'


/**
* Internal function to slice a Series / DataFrame by index based labels
* @param Object 
*/
export function _iloc({ ndFrame, rows, columns }: {
    ndFrame: INDframe
    rows?: Array<string | number | boolean> | Series
    columns?: Array<string | number>
}): Series | DataFrame {

    const _index = ndFrame.index;
    const _rowIndexes = _select_rows({ ndFrame, rows })
    const _columnIndexes = _select_columns({ ndFrame, columns })

    if (ndFrame instanceof Series) {
        const _data = ndFrame.values;
        const newData = []
        const newIndex = []

        for (const rowIndx of _rowIndexes) {
            newData.push(_data[rowIndx])
            newIndex.push(_index[rowIndx])
        }
        const sf = new Series(
            newData,
            {
                index: newIndex,
                columns: ndFrame.columns,
                dtypes: ndFrame.dtypes,
                config: ndFrame.config
            })
        return sf
    } else if (ndFrame instanceof DataFrame) {
        const _data = ndFrame.values;
        const newData = []
        const newIndex = []
        const newColumnNames: string[] = []
        const newDtypes: Array<TDtypes> = []

        for (const rowIndx of _rowIndexes) {
            const rowData = _data[rowIndx]
            const newRowDataWithRequiredCols = []

            for (const colIndx of _columnIndexes) {
                newRowDataWithRequiredCols.push(rowData[colIndx])
            }
            newData.push(newRowDataWithRequiredCols)
            newIndex.push(_index[rowIndx])
        }

        for (const colIndx of _columnIndexes) {
            newColumnNames.push(ndFrame.columns[colIndx])
            newDtypes.push(ndFrame.dtypes[colIndx])
        }
        const df = new DataFrame(
            newData,
            {
                index: newIndex,
                columns: newColumnNames,
                dtypes: newDtypes,
                config: ndFrame.config
            })
        return df
    }
    else {
        throw new Error(`Unsupported data type`)
    }
}

function _select_rows({ ndFrame, rows }: { ndFrame: INDframe, rows?: Array<string | number | boolean> | Series }): Array<number> {
    if (rows === undefined) {
        return math.range(0, ndFrame.shape[0]).toArray() as Array<number>
    }
    if (rows instanceof Series) {
        rows = rows.values as Array<string | number>
    }
    if (!Array.isArray(rows)) {
        throw new Error(`rows parameter must be an Array. For example: rows: [1,2] or rows: ["0:10"]`)
    }
    let _rowIndexes: Array<number>
    if (rows.length == 0)
        _rowIndexes = math.range(0, ndFrame.shape[0]).toArray() as Array<number>
    else if (rows.length == 1 && typeof rows[0] == "string") {
        const rowSplit = rows[0].split(":")
        if (rowSplit.length != 2)
            throw new Error(`Invalid row split parameter: If using row split string, it must be of the form; rows: ["start:end"]`);

        if (isNaN(parseInt(rowSplit[0])) && rowSplit[0] != "")
            throw new Error(`Invalid row split parameter. Split parameter must be a number`);

        if (isNaN(parseInt(rowSplit[1])) && rowSplit[1] != "")
            throw new Error(`Invalid row split parameter. Split parameter must be a number`);

        const start = rowSplit[0] == "" ? 0 : parseInt(rowSplit[0])
        const end = rowSplit[1] == "" ? ndFrame.shape[0] : parseInt(rowSplit[1])

        if (start < 0)
            throw new Error(`row slice [start] index cannot be less than 0`);

        if (end > ndFrame.shape[0])
            throw new Error(`row slice [end] index cannot be bigger than ${ndFrame.shape[0]}`);
        _rowIndexes = math.range(start, end).toArray() as Array<number>
    } else {
        const _formatedRows = []
        const _index = ndFrame.index;
        for (const [i, row] of rows.entries()) {
            if (typeof row !== "number" || typeof row !== "boolean") {
                throw new Error(`Invalid row parameter: row index ${row} must be a number or boolean`);
            }
            if (typeof row === "boolean" && row === true) {
                _formatedRows.push(_index[i])
            }
            if (row > ndFrame.shape[0]) {
                throw new Error(`Invalid row parameter: Specified index ${String(row)} cannot be bigger than index length ${ndFrame.shape[0]}`);
            }
            if (typeof row === "number") {
                _formatedRows.push(row)
            }
        }
        _rowIndexes = _formatedRows as number[]
    }
    return _rowIndexes

}

function _select_columns({ ndFrame, columns }: {
    ndFrame: INDframe
    columns?: Array<string | number>
}): Array<number> {

    if (columns === undefined)
        return math.range(0, ndFrame.shape[1]).toArray() as Array<number>

    if (!Array.isArray(columns))
        throw new Error(`columns parameter must be an Array. For example: columns: [1,2] or columns: ["0:10"]`)
    let _columnIndexes: Array<number>

    if (!columns) {
        _columnIndexes = math.range(0, ndFrame.shape[1]).toArray() as Array<number>

    } else if (columns.length == 1 && typeof columns[0] == "string") {
        const columnSplit = columns[0].split(":")

        if (columnSplit.length != 2) {
            throw new Error(`Invalid column split parameter: If using column split string, it must be of the form; columns: ["start:end"]`);
        }
        if (isNaN(parseInt(columnSplit[0])) && columnSplit[0] != "") {
            throw new Error(`Invalid column split parameter. Split parameter must be a number`);
        }

        if (isNaN(parseInt(columnSplit[1])) && columnSplit[1] != "") {
            throw new Error(`Invalid column split parameter. Split parameter must be a number`);
        }

        const start = columnSplit[0] == "" ? 0 : parseInt(columnSplit[0])
        const end = columnSplit[1] == "" ? ndFrame.shape[1] : parseInt(columnSplit[1])

        if (start < 0) {
            throw new Error(`column slice [start] index cannot be less than 0`);
        }

        if (end > ndFrame.shape[1]) {
            throw new Error(`column slice [end] index cannot be bigger than ${ndFrame.shape[1]}`);
        }
        _columnIndexes = math.range(start, end).toArray() as Array<number>
    } else {
        for (const column of columns) {
            if (typeof column != "number") {
                throw new Error(`Invalid column parameter: column index ${column} must be a number`);
            }
            if (column > ndFrame.shape[1]) {
                throw new Error(`Invalid column parameter: Specified index ${column} cannot be bigger than index length ${ndFrame.shape[1]}`);
            }
        }
        _columnIndexes = columns as number[]
    }

    return _columnIndexes
}

/**
* Internal function to slice a Series/DataFrame by specified string location based labels
* @param Object 
*/
export function _loc({ ndFrame, rows, columns }: {
    ndFrame: INDframe
    rows?: Array<string | number | boolean> | Series
    columns?: Array<string>
}): Series | DataFrame {

    let _rowIndexes: Array<number>
    let _columnIndexes: Array<number>
    const _index = ndFrame.index;
    if (rows instanceof Series) {
        rows = rows.values as Array<string>
    }
    if (rows !== undefined && !Array.isArray(rows)) {
        throw new Error(`rows parameter must be an Array. For example: rows: [1,2] or rows: ["0:10"]`)
    }
    if (columns !== undefined && !Array.isArray(columns)) {
        throw new Error(`columns parameter must be an Array. For example: columns: ["a","b"] or columns: ["a:c"]`)
    }
    if (!rows) {
        _rowIndexes = _index.map(indexValue => _index.indexOf(indexValue)) // Return all row index
    } else if (rows.length == 1 && typeof rows[0] == "string") {
        if (rows[0].indexOf(":") === -1) {
            let temp;
            if (rows[0].startsWith(`"`) || rows[0].startsWith(`'`) || rows[0].startsWith("`")) {
                temp = _index.indexOf(rows[0].replace(/['"`]/g, ''))
            } else {
                temp = _index.indexOf(Number(rows[0]))
            }
            if (temp === -1) {
                throw new Error(`IndexError: Specified index (${rows[0]}) not found`);
            }
            _rowIndexes = [temp]
        } else {
            const rowSplit = rows[0].split(":")
            if (rowSplit.length != 2) {
                throw new Error(`Invalid row split parameter: If using row split string, it must be of the form; rows: ["start:end"]`);
            }
            let start: number
            let end: number
            if (rowSplit[0] === "") {
                start = _index.indexOf(_index[0])
            } else {
                if (rowSplit[0].startsWith(`"`) || rowSplit[0].startsWith(`'`) || rowSplit[0].startsWith("`")) {
                    start = _index.indexOf(rowSplit[0].replace(/['"`]/g, ''))
                } else {
                    start = _index.indexOf(Number(rowSplit[0]))
                }
            }
            if (rowSplit[1] === "") {
                end = _index.indexOf(_index[_index.length - 1]) + 1
            } else {
                if (rowSplit[0].startsWith(`"`) || rowSplit[0].startsWith(`'`) || rowSplit[0].startsWith("`")) {
                    end = _index.indexOf(rowSplit[1].replace(/['"`]/g, ''))
                } else {
                    end = _index.indexOf(Number(rowSplit[1]))
                }
            }
            if (start === -1) {
                throw new Error(`IndexError: Specified start index not found`);
            }
            if (end === -1) {
                throw new Error(`IndexError: Specified end index not found`);
            }
            _rowIndexes = _index.slice(start, end).map(indexValue => _index.indexOf(indexValue))
        }
    } else {
        const rowsIndexToUse = []
        for (let i = 0; i < rows.length; i++) {
            const isBoolean = typeof rows[i] === "boolean"
            if (isBoolean && rows[i]) {
                rowsIndexToUse.push(_index.indexOf(_index[i]))
            }
            if (!isBoolean) {
                const rowIndex = _index.indexOf(rows[i] as number | string)
                if (rowIndex === -1) {
                    throw new Error(`IndexError: Specified index (${rows[i]}) not found`);
                }
                rowsIndexToUse.push(rowIndex)
            }
        }

        _rowIndexes = rowsIndexToUse
    }

    const _columnNames = ndFrame.columns

    if (!columns) {
        _columnIndexes = _columnNames.map(columnName => _columnNames.indexOf(columnName))// Return all column index

    } else if (columns.length == 1) {
        if (typeof columns[0] !== "string") {
            throw new Error(`ColumnIndexError: columns parameter must be an array of a string name. For example: columns: ["b"]`)
        }

        if (columns[0].indexOf(":") == -1) { // Input type ==> ["A"] 
            _columnIndexes = [_columnNames.indexOf(columns[0])]

        } else { // Input type ==> ["a:b"] or [`"col1":"col5"`]
            const columnSplit = columns[0].split(":")

            if (columnSplit.length != 2) {
                throw new Error(`ColumnIndexError: Invalid row split parameter. If using row split string, it must be of the form; rows: ["start:end"]`);
            }

            const start = columnSplit[0] == "" ? _columnNames.indexOf(_columnNames[0]) : _columnNames.indexOf(columnSplit[0])
            const end = columnSplit[1] == "" ? _columnNames.indexOf(_columnNames[_columnNames.length - 1]) : _columnNames.indexOf(columnSplit[1])

            if (start === -1) {
                throw new Error(`ColumnIndexError: Specified start index not found`);
            }

            if (end === -1) {
                throw new Error(`ColumnIndexError: Specified end index not found`);
            }
            _columnIndexes = _columnNames.slice(start, end + 1).map(columnName => _columnNames.indexOf(columnName))
            _columnIndexes.pop() //Remove the last element

        }
    } else {// Input type ==> ["A", "B"] or ["col1", "col2"]
        for (const column of columns) {
            if (_columnNames.indexOf(column) === -1) {
                throw new Error(`ColumnIndexError: Specified column (${column}) not found`);
            }
        }
        _columnIndexes = columns.map(columnName => _columnNames.indexOf(columnName))
    }

    if (ndFrame instanceof Series) {
        const newData = []
        const newIndex = []
        const _data = ndFrame.values;

        for (const rowIndx of _rowIndexes) {
            newData.push(_data[rowIndx])
            newIndex.push(_index[rowIndx])
        }
        const sf = new Series(
            newData,
            {
                index: newIndex,
                columns: ndFrame.columns,
                dtypes: ndFrame.dtypes,
                config: ndFrame.config
            })

        return sf
    } else if (ndFrame instanceof DataFrame) {
        const newData = []
        const newIndex = []
        const _data = ndFrame.values;
        const newColumnNames: string[] = []
        const newDtypes: Array<TDtypes> = []
        for (const rowIndx of _rowIndexes) {
            const rowData = _data[rowIndx]
            const newRowDataWithRequiredCols = []

            for (const colIndx of _columnIndexes) {
                newRowDataWithRequiredCols.push(rowData[colIndx])
            }
            newData.push(newRowDataWithRequiredCols)
            newIndex.push(_index[rowIndx])
        }
        for (const colIndx of _columnIndexes) {
            newColumnNames.push(ndFrame.columns[colIndx])
            newDtypes.push(ndFrame.dtypes[colIndx])
        }
        const df = new DataFrame(
            newData,
            {
                index: newIndex,
                columns: newColumnNames,
                dtypes: newDtypes,
                config: ndFrame.config
            })
        return df
    }
    else {
        throw new Error(`Unsupported data type`)
    }
}