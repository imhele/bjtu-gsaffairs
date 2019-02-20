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
}
