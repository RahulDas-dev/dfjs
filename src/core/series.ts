import { BaseDataOptionType } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";
import * as utilty from '../utility'

export default class Series extends NDframe {

    constructor(data?: any, options: BaseDataOptionType = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG

        if (utilty.isOneDArray(data)) {
            super({
                data,
                index,
                columns,
                dtypes,
                config: _config,
                isSeries: true
            });
        }
        else if (utilty.istwoDArray(data) || utilty.isObjectArray(data)) {
            data = utilty.convert2DArrayToSeriesArray(data);
            super({
                data,
                index,
                columns,
                dtypes,
                config: _config,
                isSeries: true
            });
        }

    }
}