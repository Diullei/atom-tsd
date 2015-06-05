declare module JsonSchemaModule {

    export interface ValidationError {
        instance: Object;
        schema: Object;
        message: string;
        property: string;
        stack: string;
    }

    export interface ValidatorResult {
        instance: Object;
        schema: Object;
        propertyPath: string;
        errors: ValidationError[];
        throwError: any;
    }

    export class Validator {
        public validate(instance: Object, schema: Object): ValidatorResult;
    }

    export function validate(instance: Object, schema: Object): ValidatorResult;
}

declare module 'jsonschema' {
    export = JsonSchemaModule;
}
