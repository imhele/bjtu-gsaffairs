export const enum CellAction {
  Apply = 'apply',
  Audit = 'audit',
  Delete = 'delete',
  Download = 'download',
  Edit = 'edit',
  Preview = 'preview',
}

export const enum TopbarAction {
  /**
   * `Audit` here means "batch audit", it extends from `CellAction`.
   * When user selected any row without an audit `CellAction`, the "batch audit" button hides.
   */
  Audit = 'audit',
  Create = 'create',
  Export = 'export',
}

export const enum SimpleFormItemType {
  ButtonRadio = 'ButtonRadio',
  DatePicker = 'DatePicker',
  Extra = 'Extra',
  Input = 'Input',
  InputNumber = 'InputNumber',
  MonthPicker = 'MonthPicker',
  Radio = 'Radio',
  RangePicker = 'RangePicker',
  Select = 'Select',
  TextArea = 'TextArea',
  WeekPicker = 'WeekPicker',
}
