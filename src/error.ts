import { DATA_TYPES } from "./types/base";


export class IndexInvalidError extends Error {
    constructor() {
        const message = `IndexError: Index must be of type Array of < String | number > type`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, IndexInvalidError.prototype);
    }
}


export class IndexLengthError extends Error {
    constructor(index: Array<string | number>, shape: Array<number>) {
        const message = `IndexError: You provided an index of length ${index.length} but Ndframe rows has length of ${shape[0]}`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, IndexLengthError.prototype);
    }
}


export class IndexDuplicateError extends Error {
    constructor() {
        const message = `IndexError: Row index must contain unique values`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, IndexLengthError.prototype);
    }
}

export class ColumnInvalidError extends Error {
    constructor() {
        const message = `ParamError: Columns must be of type Array of < String > Type`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, ColumnInvalidError.prototype);
    }
}


export class ColumnNamesLengthError extends Error {
    constructor(columns: string[], shape: Array<number>) {
        const message = `ParamError: Column names length mismatch. You provided a column of length ${columns.length} but Ndframe columns has length of ${shape[1]}`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, ColumnNamesLengthError.prototype);
    }
}


export class DtypeWithoutColumnError extends Error {
    constructor() {
        const message = `DtypeError: columns parameter must be provided when dtypes parameter is provided`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, IndexLengthError.prototype);
    }
}

export class DtypesInvalidError extends Error {
    constructor() {
        const message = `DtypeError: Dtypes must be of type Array of < String > Type`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, DtypesInvalidError.prototype);
    }
}

export class DtypeNotSupportedError extends Error {
    constructor(dtype: string) {
        const sdtypes = DATA_TYPES.join(', ')
        const message = `DtypeError: Dtype "${dtype}" not supported. dtype must be one of "${sdtypes}`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, IndexLengthError.prototype);
    }
}

export class DtypesLengthError extends Error {
    constructor(dtypes: Array<string>, shape: Array<number>) {
        const message = `DtypeError: You provided a dtype array of length ${dtypes.length} but Ndframe columns has length of ${shape[1]}`
        super(message);
        this.name = this.constructor.name;
        Object.setPrototypeOf(this, IndexLengthError.prototype);
    }
}
