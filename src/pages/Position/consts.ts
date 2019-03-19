import { ColProps } from 'antd/es/grid';

export enum PositionType {
  Manage = 'manage',
  Teach = 'teach',
}

export const enum CellAction {
  Apply = 'apply',
  Audit = 'audit',
  Delete = 'delete',
  Download = 'download',
  Edit = 'edit',
  Preview = 'preview',
  Save = 'save',
  Cancel = 'cancel',
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
}

/**
 * When there is no row in the table is selected,
 * these action buttons will be hidden
 */
export const HideWithouSelection: Set<TopbarAction | CellAction> = new Set([
  TopbarAction.Audit,
  TopbarAction.AuditPass,
  TopbarAction.Export,
]);

export const buttonColProps: ColProps[] = [
  {
    sm: { span: 24, offset: 0 },
    md: { span: 12, offset: 6 },
    style: { marginTop: 8, paddingLeft: '0.5%' },
  },
  {
    sm: { span: 24, offset: 0 },
    md: { span: 12, offset: 3 },
    style: { marginTop: 8, paddingLeft: '0.5%' },
  },
];
