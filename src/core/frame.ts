import { BaseDataOptionType } from "../types/base";
import NDframe from "./base";
import { CdataFrameConfig } from "../constants";

export default class DataFrame extends NDframe {

    constructor(data: any, options: BaseDataOptionType = {}) {
        const { index, columns, dtypes, config } = options;
        const _config = config ? { ...CdataFrameConfig, ...config } : CdataFrameConfig
        super({ isSeries: false, data, index, columns, dtypes, config: _config });
        // this.$setInternalColumnDataProperty();
    }
}