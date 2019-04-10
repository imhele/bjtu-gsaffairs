import {
  FetchListBody,
  CreateWorkloadBody,
  EditWorkloadBody,
  AuditWorkloadBody,
} from '@/api/workload';
import StandardTable from '@/components/StandardTable';
import { GlobalId } from '@/global';
import PageHeader from '@/layouts/PageHeader';
import { ConnectProps, ConnectState, WorkloadState } from '@/models/connect';
import commonStyles from '@/pages/common.less';
import { CellAction } from '@/pages/Position/consts';
import { DatePicker, InputNumber, Tabs } from 'antd';
import { TableRowSelection, SelectionSelectFn } from 'antd/es/table';
import { connect } from 'dva';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { getUseMedia } from 'react-media-hook2';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import styles from './List.less';

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
        max={record.position_work_time_l || 48}
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

const initTime = moment().format('YYYYMM');

const Workload: React.FC<WorkloadProps> = ({ dispatch, loading, workload }) => {
  const postType = useRef('manage');
  const selectedRows = useRef({});
  const amountRef = useRef(0);
  const pageSet = useRef({ limit: 10, offset: 0, time: initTime });
  const [activeRowKey, setActiveRowKey] = useState(null as number);
  const onClickRowAction = ({ currentTarget }: React.MouseEvent) => {
    const { dataset } = currentTarget as HTMLElement;
    const numKey = dataset.key ? parseInt(dataset.key, 10) : null;
    switch (dataset.type as CellAction) {
      case CellAction.Edit:
        setActiveRowKey(numKey);
        break;
      case CellAction.Save:
        if (!dataset.workload)
          dispatch<CreateWorkloadBody>({
            type: 'workload/createWorkload',
            payload: {
              amount: amountRef.current,
              type: postType.current,
              time: pageSet.current.time,
              stuapplyId: numKey,
            },
            callback: () => {
              pageSet.current.offset = parseInt(dataset.index, 10);
              setActiveRowKey(null!);
              fetchList();
            },
          });
        else
          dispatch<EditWorkloadBody>({
            type: 'workload/editWorkload',
            payload: {
              amount: amountRef.current,
              type: postType.current,
              id: parseInt(dataset.workload, 10),
            },
            callback: () => {
              pageSet.current.offset = parseInt(dataset.index, 10);
              setActiveRowKey(null!);
              fetchList();
            },
          });
        break;
      case CellAction.Cancel:
        setActiveRowKey(null!);
        break;
      case CellAction.Audit:
        if (!dataset.workload) break;
        dispatch<AuditWorkloadBody>({
          type: 'workload/auditWorkload',
          payload: {
            status: dataset.value,
            type: postType.current,
            id: parseInt(dataset.workload, 10),
          },
          callback: () => {
            pageSet.current.offset = parseInt(dataset.index, 10);
            fetchList();
          },
        });
        break;
      default:
        break;
    }
  };

  const fetchList = () => {
    dispatch<FetchListBody>({
      type: 'workload/fetchList',
      payload: {
        limit: pageSet.current.limit,
        offset: pageSet.current.offset,
        time: pageSet.current.time,
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
  const onSelect = (record: object, selected: boolean) => {
    const { rowKey } = workload;
    if (selected) selectedRows.current[record[rowKey]] = record;
    else delete selectedRows.current[record[rowKey]];
  };
  const onSelectAll = (selected: boolean, _: object[], changeRows: object[]) =>
    changeRows.forEach(record => onSelect(record, selected));
  const PageHeaderExtra = (
    <Tabs
      className={styles.tabs}
      onChange={key => {
        postType.current = key;
        fetchList();
      }}
    >
      <Tabs.TabPane key="manage" tab={formatMessage({ id: 'position.manage' })} />
      <Tabs.TabPane key="teach" tab={formatMessage({ id: 'position.teach' })} />
    </Tabs>
  );
  const columns = workload.columns.map(col => {
    if (col.dataIndex === 'workload_amount')
      return {
        ...col,
        render: renderActualWorkloadAmount(workload, activeRowKey, onClickRowAction, amountRef),
      };
    if (col.dataIndex === 'workload_status')
      return { ...col, render: renderWorkloadStatus(workload, onClickRowAction) };
    return col;
  });

  useState(fetchList);

  return (
    <PageHeader headerExtra={PageHeaderExtra}>
      <div className={commonStyles.contentBody}>
        <div>
          <span style={{ marginRight: '1em' }}>申报月份</span>
          <MonthPicker
            allowClear={false}
            onChange={date => {
              pageSet.current.time = date.format('YYYYMM');
              fetchList();
            }}
            style={{ marginBottom: 16 }}
            value={moment(pageSet.current.time, 'YYYYMM')}
          />
        </div>
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
          // getMenthods={this.getTableMethods}
          loading={loading.fetchList}
          // onClickAction={this.onClickAction}
          // operationArea={this.getOperationArea()}
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
