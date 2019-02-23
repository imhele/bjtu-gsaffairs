import 'egg';

declare module 'egg' {}

declare module 'sequelize' {
  interface ValidationErrorItem {
    instance: any;
    validatorName: string;
    validatorKey: string;
  }

  interface DefineValidateOptions {
    fn?: (value: any) => void;
  }

  interface Model<TInstance, TAttributes> {
    formatBack: (values: { [K in keyof TAttributes]?: any }) => { [K in keyof TAttributes]: any };
    toForm: (fields?: (keyof TAttributes)[], exclude?: boolean) => SimpleFormItemProps[];
  }
}
