import { BaseDataOptionType } from "../types/base";
import NDframe from "./base";

export default class DataFrame extends NDframe{
    
    constructor(data: any, options: BaseDataOptionType = {}) {
        const { index, columns, dtypes, config } = options;
        super({ data, index, columns, dtypes, config, isSeries: false });
        // this.$setInternalColumnDataProperty();
    }
}