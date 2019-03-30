export const enum CellAction {
  Apply = 'apply',
  Audit = 'audit',
  Delete = 'delete',
  Download = 'download',
  Edit = 'edit',
  Preview = 'preview',
  Save = 'save',
  Cancel = 'cancel',
  File = 'file',
}

export const enum TopbarAction {
  /**
   * `Audit` here means "batch audit", it extends from `CellAction`.
   * When user selected any row without an audit `CellAction`, the "batch audit" button hides.
   */
  Audit = 'audit',
  AuditPass = 'audit-pass',
  Create = 'create',
  Export = 'export',
  MoveApply = 'move-apply',
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
