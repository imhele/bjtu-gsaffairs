import { FetchListPayload } from '@/api/workload';
import StandardTable from '@/components/StandardTable';
import { GlobalId } from '@/global';
import PageHeader from '@/layouts/PageHeader';
import { ConnectProps, ConnectState, WorkloadState } from '@/models/connect';
import commonStyles from '@/pages/common.less';
import { Tabs } from 'antd';
import { TableRowSelection, SelectionSelectFn } from 'antd/es/table';
import { connect } from 'dva';
import React, { useRef, useState } from 'react';
import { getUseMedia } from 'react-media-hook2';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import styles from './List.less';

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

const Workload: React.FC<WorkloadProps> = ({ dispatch, loading, workload }) => {
  const postType = useRef('manage');
  const selectedRows = useRef({});
  const pageSet = useRef({ limit: 10, offset: 0 });

  const fetchList = () => {
    dispatch<FetchListPayload>({
      type: 'workload/fetchList',
      payload: {
        body: {
          limit: pageSet.current.limit,
          offset: pageSet.current.offset,
          type: postType.current,
        },
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

  useState(fetchList);

  return (
    <PageHeader headerExtra={PageHeaderExtra}>
      <div className={commonStyles.contentBody}>
        <StandardTable
          actionKey={null}
          alert={{
            clearText: <FormattedMessage id="word.clear" />,
            format: (node: any) => (
              <FormattedMessage id="position.list.table.selected-alert" values={{ node }} />
            ),
          }}
          columns={workload.columns}
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
