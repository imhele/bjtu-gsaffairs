import 'egg';

declare module 'egg' {}

declare module 'sequelize' {
  interface ValidationErrorItem {
    validatorName: string;
    validatorKey: string;
  }
}
