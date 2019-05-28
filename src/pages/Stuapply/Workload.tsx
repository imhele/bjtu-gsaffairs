import {
  FetchListBody,
  CreateWorkloadBody,
  EditWorkloadBody,
  AuditWorkloadBody,
  ExportWorkloadFileBody,
} from '@/api/workload';
import StandardTable, { StandardTableMethods } from '@/components/StandardTable';
import { GlobalId } from '@/global';
import PageHeader from '@/layouts/PageHeader';
import { ConnectProps, ConnectState, WorkloadState, Dispatch } from '@/models/connect';
import commonStyles from '@/pages/common.less';
import { CellAction, PositionType } from '@/pages/Position/consts';
import { safeFun } from '@/utils/utils';
import {
  Button,
  Col,
  DatePicker,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Tabs,
  Tooltip,
} from 'antd';
import { ColProps } from 'antd/es/col';
import { SelectionSelectFn, TableRowSelection } from 'antd/es/table';
import { connect } from 'dva';
import moment from 'moment';
import React, { useRef, useState, Fragment } from 'react';
import { getUseMedia } from 'react-media-hook2';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import styles from './List.less';
import ExcelImageSrc from '@/assets/image/excel-color.png';
import PDFImageSrc from '@/assets/image/pdf-color.svg';

const { MonthPicker } = DatePicker;

export interface WorkloadProps extends Required<ConnectProps> {
  workload: WorkloadState;
  loading: {
    fetchList?: boolean;
  };
}

const getSelectableProps = (
  workload: WorkloadState,
  onSelect: SelectionSelectFn<object>,
  onSelectAll: (selected: boolean, selectedRows: object[], changeRows: object[]) => void,
): TableRowSelection<object> | null => {
  const { selectable, unSelectableKey } = workload;
  if (!selectable) return null;
  return {
    ...(selectable === true ? {} : selectable),
    getCheckboxProps: record => ({ disabled: record[unSelectableKey] }),
    onSelect,
    onSelectAll,
  };
};

const renderActualWorkloadAmount = (
  { rowKey }: WorkloadState,
  activeRowKey: number,
  onClick: (event: React.MouseEvent) => void,
  amountRef: React.MutableRefObject<number>,
  maxWorkload: number,
) => (text: any, record: any, index: number) => {
  if (!record.editable) return text;
  if (activeRowKey !== record[rowKey])
    return (
      <span className={styles.inlineTextButtonContainer} key={record[rowKey]}>
        {text}
        <a data-key={record[rowKey]} data-type={CellAction.Edit} onClick={onClick}>
          编辑
        </a>
      </span>
    );
  return (
    <span className={styles.inlineTextButtonContainer}>
      <InputNumber
        defaultValue={amountRef.current}
        onChange={v => (amountRef.current = v)}
        min={0}
        max={Math.min(record.position_work_time_l || maxWorkload, maxWorkload)}
      />
      <a
        data-index={index}
        data-workload={record.workload_id}
        data-key={record[rowKey]}
        data-type={CellAction.Save}
        onClick={onClick}
      >
        提交
      </a>
      <a data-key={record[rowKey]} data-type={CellAction.Cancel} onClick={onClick}>
        取消
      </a>
    </span>
  );
};

const renderWorkloadStatus = (
  { rowKey }: WorkloadState,
  onClick: (event: React.MouseEvent) => void,
) => (text: any, record: any, index: number) => {
  return (
    <span className={styles.inlineTextButtonContainer} key={record[rowKey]}>
      {text}
      {record.auditable && record.workload_status !== '已上报' && (
        <a
          data-index={index}
          data-workload={record.workload_id}
          data-type={CellAction.Audit}
          data-value="已上报"
          onClick={onClick}
        >
          审核通过
        </a>
      )}
      {record.auditable && (
        <a
          data-index={index}
          data-workload={record.workload_id}
          data-type={CellAction.Audit}
          data-value="草稿"
          onClick={onClick}
        >
          退回
        </a>
      )}
    </span>
  );
};

const RenderFilterItem: React.FC<{ label: string }> = ({ label, children }) => (
  <Row>
    <Col span={8} style={{ lineHeight: '32px' }}>
      {label}
    </Col>
    <Col span={16}>{children}</Col>
  </Row>
);

const initTime = moment()
  .subtract(1, 'M')
  .format('YYYYMM');

const onBatchAudit = (
  keys: string[] | number[],
  type: string,
  dispatch: Dispatch,
  callback: () => void,
) => {
  Modal.confirm({
    title: '批量审核',
    content: `已选中 ${keys.length} 条待审核记录`,
    okText: '开始审核',
    cancelText: '取消',
    onOk: () =>
      new Promise(async resolve => {
        let index: number = 0;
        for (const key of keys) {
          const id = typeof key === 'string' ? parseInt(key, 10) : key;
          await dispatch<AuditWorkloadBody>({
            hideMsg: true,
            type: 'workload/auditWorkload',
            payload: { status: '已上报', type, id },
          });
          index++;
          if (index % 10 === 0) message.success(`已审核 ${index} 条工作量申报记录`);
        }
        message.success('批量审核完成');
        callback();
        resolve();
      }),
  });
};

const ExportSelectiont: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSelect: (fileType: 'excel' | 'pdf') => Promise<any> | void;
}> = ({ onCancel, onSelect, visible }) => (
  <Modal
    wrapClassName={styles.exportModal}
    footer={false}
    onCancel={onCancel}
    title="导出"
    visible={visible}
  >
    <div className={styles.fileType} onClick={() => onSelect('pdf')}>
      <div className={styles.icon}>
        <img src={PDFImageSrc} />
      </div>
      <div className={styles.meta}>
        <span className={styles.name}>PDF</span>
        <span className={styles.ext}>.pdf</span>
      </div>
    </div>
    <div className={styles.fileType} onClick={() => onSelect('excel')}>
      <div className={styles.icon}>
        <img src={ExcelImageSrc} />
      </div>
      <div className={styles.meta}>
        <span className={styles.name}>Excel</span>
        <span className={styles.ext}>.xlsx</span>
      </div>
    </div>
  </Modal>
);

const Workload: React.FC<WorkloadProps> = ({ dispatch, loading, workload }) => {
  const amountRef = useRef(0);
  const [exportVisible, setExportVisible] = useState(false);
  const postType = useRef('manage' as PositionType);
  const selectedRows = useRef({} as { [key: string]: any });
  const tableMethods = useRef<StandardTableMethods>({} as any);
  const pageSet = useRef({ limit: 10, offset: 0, time: initTime, student: '', status: '' });
  const [activeRowKey, setActiveRowKey] = useState(null as number);
  const onSelect = (record: object, selected: boolean) => {
    const { rowKey } = workload;
    if (selected) selectedRows.current[record[rowKey]] = record;
    else delete selectedRows.current[record[rowKey]];
  };
  const onSelectAll = (selected: boolean, _: object[], changeRows: object[]) =>
    changeRows.forEach(record => onSelect(record, selected));
  const onClickBatchAudit = () => {
    const workloadIdList: number[] = Object.values(selectedRows.current)
      .filter(i => i && i.workload_status === '待审核')
      .map(i => i.workload_id);
    if (!workloadIdList.length) return message.warn('选中的记录中没有待审核的内容');
    return onBatchAudit(workloadIdList, postType.current, dispatch, () => {
      pageSet.current.offset = 0;
      setActiveRowKey(null!);
      fetchList();
    });
  };
  const onClickExportFile = (fileType: 'excel' | 'pdf') => {
    setExportVisible(false);
    const workloadIdList: number[] = Object.values(selectedRows.current)
      .filter(i => i && i.workload_status === '已上报')
      .map(i => i.workload_id);
    if (!workloadIdList.length) return message.warn('选中的记录中没有可导出的内容');
    const timeStr = ` ${pageSet.current.time.slice(0, 4)} 年 ${pageSet.current.time.slice(4)} 月`;
    message.info(`正在导出${timeStr}的 ${workloadIdList.length} 条已上报记录`);
    return dispatch<ExportWorkloadFileBody>({
      type: 'workload/exportWorkloadFile',
      payload: { workloadIdList, type: postType.current, fileType },
    });
  };
  const onClickRowAction = ({ currentTarget }: React.MouseEvent) => {
    const { dataset } = currentTarget as HTMLElement;
    const numKey = dataset.key ? parseInt(dataset.key, 10) : null;
    if (dataset.type === CellAction.Edit) return setActiveRowKey(numKey);
    if (dataset.type === CellAction.Cancel) return setActiveRowKey(null!);
    const callback = () => {
      setActiveRowKey(null!);
      fetchList('clearSelection');
    };
    if (dataset.type === CellAction.Audit) {
      if (!dataset.workload) return;
      return dispatch<AuditWorkloadBody>({
        callback,
        type: 'workload/auditWorkload',
        payload: {
          status: dataset.value,
          type: postType.current,
          id: parseInt(dataset.workload, 10),
        },
      });
    }
    if (dataset.type !== CellAction.Save) return;
    if (!dataset.workload)
      return dispatch<CreateWorkloadBody>({
        callback,
        type: 'workload/createWorkload',
        payload: {
          amount: amountRef.current,
          type: postType.current,
          time: pageSet.current.time,
          stuapplyId: numKey,
        },
      });
    dispatch<EditWorkloadBody>({
      callback,
      type: 'workload/editWorkload',
      payload: {
        amount: amountRef.current,
        type: postType.current,
        id: parseInt(dataset.workload, 10),
      },
    });
  };

  const fetchList = (..._: any[]) => {
    if (_.length) {
      selectedRows.current = {};
      safeFun(tableMethods.current.clearSelectedRowKeys);
    }
    dispatch<FetchListBody>({
      type: 'workload/fetchList',
      payload: {
        ...pageSet.current,
        type: postType.current,
      },
      callback: () => {
        const { dataSource, total } = workload;
        // exception: offset === 0
        if (pageSet.current.offset && total <= pageSet.current.offset) {
          pageSet.current.offset = total - dataSource.length;
        }
      },
    });
  };
  const PageHeaderExtra = (
    <Fragment>
      <div style={{ margin: '32px auto 16px', textAlign: 'center' }}>
        <Input.Search
          defaultValue={pageSet.current.student}
          enterButton
          onSearch={v => fetchList((pageSet.current.student = v))}
          placeholder="输入学号、学生姓名以搜索"
          style={{ maxWidth: 480, marginRight: 16 }}
        />
      </div>
      <Tabs
        className={styles.tabs}
        onChange={key => {
          postType.current = key as PositionType;
          fetchList('clearSelection');
        }}
      >
        <Tabs.TabPane key="manage" tab={formatMessage({ id: 'position.manage' })} />
        <Tabs.TabPane key="teach" tab={formatMessage({ id: 'position.teach' })} />
      </Tabs>
    </Fragment>
  );
  const columns = workload.columns.map(col => {
    if (col.dataIndex === 'workload_amount')
      return {
        ...col,
        render: renderActualWorkloadAmount(
          workload,
          activeRowKey,
          onClickRowAction,
          amountRef,
          workload.maxWorkload,
        ),
      };
    if (col.dataIndex === 'workload_status')
      return { ...col, render: renderWorkloadStatus(workload, onClickRowAction) };
    return col;
  });

  useState(fetchList);

  const filterColProps: ColProps = { lg: 8, md: 12, sm: 24, style: { marginBottom: 16 } };

  return (
    <PageHeader headerExtra={PageHeaderExtra}>
      <div className={commonStyles.contentBody}>
        <Row gutter={{ md: 8, lg: 16, xl: 32 }} key="Filter">
          <Col {...filterColProps}>
            <RenderFilterItem label="申报月份">
              <MonthPicker
                allowClear={false}
                onChange={date => fetchList((pageSet.current.time = date.format('YYYYMM')))}
                style={{ width: '100%' }}
                value={moment(pageSet.current.time, 'YYYYMM')}
              />
            </RenderFilterItem>
          </Col>
          <Col {...filterColProps}>
            <RenderFilterItem label="上报状态">
              <Select
                defaultValue=""
                onChange={status => fetchList((pageSet.current.status = status))}
                style={{ width: '100%' }}
              >
                <Select.Option value="">全部</Select.Option>
                <Select.Option value="草稿">草稿</Select.Option>
                <Select.Option disabled={postType.current !== 'teach'} value="待审核">
                  待审核
                </Select.Option>
                <Select.Option value="已上报">已上报</Select.Option>
              </Select>
            </RenderFilterItem>
          </Col>
          {workload.selectable && (
            <Col {...filterColProps}>
              <Tooltip title="导出选中的已上报的申报记录">
                <Button icon="cloud-download" onClick={() => setExportVisible(true)} type="primary">
                  导出
                </Button>
              </Tooltip>
              {postType.current !== 'manage' && (
                <Button onClick={onClickBatchAudit} style={{ marginLeft: '1em' }}>
                  审核通过
                </Button>
              )}
              <ExportSelectiont
                onCancel={() => setExportVisible(false)}
                onSelect={onClickExportFile}
                visible={exportVisible}
              />
            </Col>
          )}
        </Row>
        <StandardTable
          actionKey={null}
          alert={{
            clearText: <FormattedMessage id="word.clear" />,
            format: (node: any) => (
              <FormattedMessage id="position.list.table.selected-alert" values={{ node }} />
            ),
          }}
          columns={columns}
          dataSource={workload.dataSource}
          getMenthods={m => (tableMethods.current = m)}
          key="Table"
          loading={loading.fetchList}
          pagination={{
            onChange: (page: number, pageSize: number) => {
              pageSet.current.limit = pageSize;
              pageSet.current.offset = (page - 1) * pageSize;
              fetchList();
            },
            onShowSizeChange: (_: number, pageSize: number) => {
              pageSet.current.limit = pageSize;
              fetchList();
            },
            pageSize: pageSet.current.limit,
            pageSizeOptions: ['10', '20', '50', '100'],
            position: 'both',
            showQuickJumper: true,
            showTotal: () => formatMessage({ id: 'word.total' }, { total: workload.total }),
            showSizeChanger: true,
            simple: getUseMedia(GlobalId.BasicLayout)[0],
            total: workload.total,
          }}
          rowKey={workload.rowKey}
          scroll={{ x: 900 }}
          selectable={getSelectableProps(workload, onSelect, onSelectAll)}
        />
      </div>
    </PageHeader>
  );
};

export default connect(
  ({ workload, loading }: ConnectState): Partial<WorkloadProps> => ({
    workload,
    loading: {
      fetchList: loading.effects['workload/fetchList'],
    },
  }),
)(Workload);
