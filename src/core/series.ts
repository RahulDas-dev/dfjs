import { TArray1D, IBaseDataOption, TDtypes, InputDtypes, ISeries } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";
import * as utilty from '../utility'
import { _iloc } from "./indexing";
import * as tf from '@tensorflow/tfjs';

export default class Series extends NDframe implements ISeries {

    constructor(data?: InputDtypes, options: IBaseDataOption = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG
        super({
            data,
            index,
            columns,
            dtypes,
            config: _config,
            isSeries: true
        });
    }

    get dtype(): TDtypes {
        return [...this._dtypes.values()][0];
    }

    /**
     * Return number of non-null elements in a Series
     * @example
     * ```
     * const sf = new Series([1, 2, 3, 4, 5, 6]);
     * console.log(sf.count());
     * //output 6
     * ```
     * 
     * @example
     * ```
     * const sf = new Series([1, 2, 3, 4, 5, 6, NaN]);
     * console.log(sf.count());
     * //output 6
     * ```
    */
    count(): number {
        const values = utilty.removeMissingValuesFromArray(this.values)
        return values.length
    }

    get values(): TArray1D {
        return this._data as TArray1D;
    }

    get columns(): [string] {
        return [this._columns[0]]
    }

    /**
     * Makes a deep copy of a Series
     * @example
     * ```
     * const sf = new Series([1, 2, 3, 4, 5, 6]);
     * const sf2 = sf.copy();
     * ```
     * 
    */
    copy(): Series {
        const sf = new Series([...this.values], {
            columns: [...this.columns],
            index: [...this.index],
            dtypes: [...this.dtypes],
            config: { ...this.config }
        });
        return sf;
    }

    /**
    * Purely integer-location based indexing for selection by position.
    * ``.iloc`` is primarily integer position based (from ``0`` to
    * ``length-1`` of the axis), but may also be used with a boolean array.
    * 
    * @param rows Array of row indexes
    *  
    * Allowed inputs are in rows and columns params are:
    * 
    * - An array of single integer, e.g. ``[5]``.
    * - A list or array of integers, e.g. ``[4, 3, 0]``.
    * - A slice array string with ints, e.g. ``["1:7"]``.
    * - A boolean array.
    * - A ``callable`` function with one argument (the calling Series or
    * DataFrame) and that returns valid output for indexing (one of the above).
    * This is useful in method chains, when you don't have a reference to the
    * calling object, but would like to base your selection on some value.
    * 
    * ``.iloc`` will raise ``IndexError`` if a requested indexer is
    * out-of-bounds.
    * 
    * @example
    * ```
    * const sf = new Series([1, 2, 3, 4, 5, 6], { index: ['a', 'b', 'c', 'd', 'e', 'f'] });
    * const sf2 = sf.iloc([0, 2, 4]);
    * sf2.print();
    * ```
    */
    iloc(rows: Array<string | number | boolean>): Series {
        return _iloc({ ndFrame: this, rows }) as Series
    }

    /**
      * Returns the first n values in a Series
      * @param rows The number of rows to return
      * @example
      * ```
      * const sf = new Series([1, 2, 3, 4, 5, 6], { index: ['a', 'b', 'c', 'd', 'e', 'f'] });
      * const sf2 = sf.head(3);
      * sf2.print();
      * ```
    */
    head(rows = 5): Series {
        if (rows <= 0) {
            throw new Error("ParamError: Number of rows cannot be less than 1")
        }
        if (this.shape[0] <= rows) {
            return this.copy()
        }
        if (this.shape[0] - rows < 0) {
            throw new Error("ParamError: Number of rows cannot be greater than available rows in data")
        }
        return this.iloc([`0:${rows}`])
    }

    /**
      * Returns the last n values in a Series
      * @param rows The number of rows to return
      * @example
      * ```
      * const sf = new Series([1, 2, 3, 4, 5, 6], { index: ['a', 'b', 'c', 'd', 'e', 'f'] });
      * const sf2 = sf.tail(3);
      * sf2.print();
      * ```
    */
    tail(rows = 5): Series {
        if (rows <= 0) {
            throw new Error("ParamError: Number of rows cannot be less than 1")
        }
        if (this.shape[0] <= rows) {
            return this.copy()
        }
        if (this.shape[0] - rows < 0) {
            throw new Error("ParamError: Number of rows cannot be greater than available rows in data")
        }

        const startIdx = this.shape[0] - rows
        return this.iloc([`${startIdx}:`])
    }

    describe(): Series {
        const values = utilty.removeMissingValuesFromArray(this.values) as number[]
        const tensor = tf.tensor1d(values)
        const mean = tf.tensor1d(values).mean().dataSync()[0]
        const squaredDiffs = tf.sub(tensor, tensor.mean()).square();
        const variance = tf.mean(squaredDiffs);
        const std = tf.sqrt(variance).dataSync()[0];
        const min = tf.tensor1d(values).min().dataSync()[0]
        const max = tf.tensor1d(values).max().dataSync()[0]

        const sortedTensor = tensor.topk(values.length, true).values.reverse();
        const p50Idx = Math.floor(values.length / 2);
        let p50 = 0
        if (values.length % 2 === 0) {
            p50 = sortedTensor.slice([p50Idx - 1], [2]).mean().dataSync()[0];
        } else {
            p50 = sortedTensor.slice([p50Idx], [1]).dataSync()[0];
        }
        const p25Idx = Math.floor(0.25 * (values.length - 1));
        const p75Idx = Math.floor(0.75 * (values.length - 1));
        const p25 = sortedTensor.slice([p25Idx], [1]).dataSync()[0];
        const p75 = sortedTensor.slice([p75Idx], [1]).dataSync()[0];

        return new Series([values.length, mean, std, min, p25, p50, p75, max], {
            dtypes: ['float'],
            index: ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'],
            columns: [],
            config: this.config
        })
    }

    mean(): number {
        const values = utilty.removeMissingValuesFromArray(this.values) as number[]
        return tf.tensor1d(values).mean().dataSync()[0]
    }

    std(): number {
        const values = utilty.removeMissingValuesFromArray(this.values) as number[]
        const tensor = tf.tensor1d(values)
        const squaredDiffs = tf.sub(tensor, tensor.mean()).square();
        const variance = tf.mean(squaredDiffs);
        return tf.sqrt(variance).dataSync()[0];
    }

    min(): number {
        const values = utilty.removeMissingValuesFromArray(this.values) as number[]
        return tf.tensor1d(values).min().dataSync()[0]
    }

    max(): number {
        const values = utilty.removeMissingValuesFromArray(this.values) as number[]
        return tf.tensor1d(values).max().dataSync()[0]
    }

    median(): number {
        const values = utilty.removeMissingValuesFromArray(this.values) as number[];
        const tensor = tf.tensor1d(values);
        const sortedTensor = tensor.topk(values.length, true).values.reverse();
        const mid = Math.floor(values.length / 2);

        if (values.length % 2 === 0) {
            return sortedTensor.slice([mid - 1], [2]).mean().dataSync()[0];
        } else {
            return sortedTensor.slice([mid], [1]).dataSync()[0];
        }
    }

    get tensor(): tf.Tensor1D {
        if (this.dtypes[0] === 'string')
            return tf.tensor1d((this._data as Array<string>), 'string');
        else if (this.dtypes[0] === 'datetime')
            return tf.tensor1d((this._data as Array<number>), 'string');
        else if (this.dtypes[0] === 'int')
            return tf.tensor1d((this._data as Array<number>), 'int32');
        else if (this.dtypes[0] === 'float')
            return tf.tensor1d((this._data as Array<number>), 'float32');
        else
            return tf.tensor1d((this._data as Array<boolean>), 'bool');
    }


    print(): void {
        throw new Error("Method not implemented.");
    }

    tocsv(sep: string): string {
        const csvStr = this._data.join(sep);
        return csvStr
    }
}