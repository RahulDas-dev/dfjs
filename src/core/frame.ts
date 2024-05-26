import { BaseDataOptionType } from "../types/base";
import NDframe from "./base";
import { DATA_FRAME_CONFIG } from "../constants";

export default class DataFrame extends NDframe {

    constructor(data?: any, options: BaseDataOptionType = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...DATA_FRAME_CONFIG, ...config } : DATA_FRAME_CONFIG
        super({ isSeries: false, data, index, columns, dtypes, config: _config });
        // this.$setInternalColumnDataProperty();
    }
}