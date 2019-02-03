export enum PositionType {
  Manage = 'manage',
  Teach = 'teach',
}

export enum CellAction {
  Apply = 'apply',
  Audit = 'audit',
  Delete = 'delete',
  Download = 'download',
  Edit = 'edit',
  Preview = 'preview',
}

export enum TopbarAction {
  Create = 'create',
  Delete = 'delete',
  Export = 'export',
}

/**
 * When there is no row in the table is selected,
 * these action buttons will be hidden
 */
export const HideWithouSelection: Set<TopbarAction | CellAction> = new Set([
  TopbarAction.Export,
  TopbarAction.Delete,
]);
