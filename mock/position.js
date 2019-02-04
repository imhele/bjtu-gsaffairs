import { APIPrefix } from './login';
import { detailColumns, detailDataSource, possibleValues, tableColumns } from './position.json';

/**
 * Common data
 */
const filters = [
  {
    id: 'sess',
    selectOptions: possibleValues.sess.map(value => ({ value })),
    title: '学期',
    type: 'Select',
  },
  {
    id: 'depName',
    selectOptions: possibleValues.depName.map(value => ({ value })),
    title: '单位',
    type: 'Select',
  },
  {
    id: 'name',
    title: '岗位名称',
    type: 'Input',
  },
  {
    id: 'campus',
    selectOptions: possibleValues.campus.map(value => ({ value })),
    title: '校区',
    type: 'Select',
  },
  {
    id: 'checkStatus',
    selectOptions: possibleValues.checkStatus.map(value => ({ value })),
    title: '审核状态',
    type: 'Select',
  },
  {
    id: 'releaseStatus',
    selectOptions: possibleValues.releaseStatus.map(value => ({ value })),
    title: '发布状态',
    type: 'Select',
  },
  {
    id: 'way',
    selectOptions: possibleValues.way.map(value => ({ value })),
    title: '聘用方式',
    type: 'Select',
  },
  {
    id: 'applyStatus',
    selectOptions: possibleValues.applyStatus.map(value => ({ value })),
    title: '申请状态',
    type: 'Select',
  },
];

const source = {
  manage: Array.from({ length: 120 }).map((_, index) => ({
    key: `${index}`,
    action: possibleValues.action[Math.random() > 0.7 ? 0 : 1],
    applyStatus: possibleValues.applyStatus[index % 5],
    campus: possibleValues.campus[Math.random() > 0.6 ? 0 : 1],
    checkStatus: possibleValues.checkStatus[index % 5],
    depName: possibleValues.depName[index % 3],
    name: possibleValues.name[Math.random() > 0.33 ? (Math.random() > 0.66 ? 0 : 1) : 2],
    needNum: parseInt((Math.random() * 100).toFixed(0), 10),
    releaseStatus: possibleValues.releaseStatus[index % 2],
    sess: possibleValues.sess[index % 2],
    way: possibleValues.way[Math.random() > 0.8 ? 0 : 1],
  })),
  teach: Array.from({ length: 120 }).map((_, index) => ({
    key: `${index}`,
    action: possibleValues.action[Math.random() > 0.7 ? 0 : 1],
    applyStatus: possibleValues.applyStatus[index % 5],
    campus: possibleValues.campus[Math.random() > 0.6 ? 0 : 1],
    checkStatus: possibleValues.checkStatus[index % 5],
    depName: possibleValues.depName[index % 3],
    name: possibleValues.name[Math.random() > 0.33 ? (Math.random() > 0.66 ? 0 : 1) : 2],
    needNum: parseInt((Math.random() * 100).toFixed(0), 10),
    releaseStatus: possibleValues.releaseStatus[index % 2],
    sess: possibleValues.sess[index % 2],
    way: possibleValues.way[Math.random() > 0.8 ? 0 : 1],
  })),
};

/**
 * Part of `position/list`
 */
const operationArea = {
  operation: [
    { icon: 'plus', text: '新建', type: 'create' },
    { icon: 'cloud-download', text: '导出', type: 'export' },
  ],
};

const positionList = (req, res) => {
  const { type } = req.query;
  const { filtersValue = {}, limit = 10, offset = 0 } = req.body || {};
  if (!['manage', 'teach'].includes(type)) {
    return res.send({
      errcode: 40001,
      errmsg: 'Invalid type of position',
    });
  }
  /**
   * `name` use `Input` to search, shouldn't give a simple comparison.
   */
  const filtersKey = Object.keys(filtersValue).filter(key => key !== 'name');
  /**
   * if `filter` is `{}`, the data will not be filtered
   */
  const filteredSource = !Object.keys(filtersValue).length
    ? source[type]
    : !filtersValue.name
    ? source[type].filter(value => !filtersKey.some(key => value[key] !== filtersValue[key]))
    : source[type]
        .filter(value => !filtersKey.some(key => value[key] !== filtersValue[key]))
        .filter(value => value.name[0].text.includes(filtersValue.name));
  /**
   * Slice from filtered data
   */
  const dataSource = filteredSource.slice(offset, offset + limit);
  if (!dataSource.length) {
    dataSource.push(...filteredSource.slice(filteredSource.length - limit));
  }
  /**
   * Complete return value
   */
  const condition = ['applyStatus', 'way'];
  const result = {
    actionKey: ['action', 'name'],
    columns: tableColumns.filter(col => !condition.includes(col.dataIndex)),
    dataSource,
    filters: filters.filter(col => !condition.includes(col.id)),
    operationArea,
    selectable: {
      columnWidth: 57,
    },
    total: filteredSource.length,
  };
  if (filtersKey.length) {
    delete result.filters;
  }
  if (filtersKey.length || offset) {
    delete result.selectable;
    delete result.operationArea;
  }
  setTimeout(() => {
    res.send(result);
  }, 400);
};

/**
 * Part of `position/detail`
 */
const positionDetail = (req, res) => {
  const { type } = req.query;
  const { key = '' } = req.body || {};
  if (!['manage', 'teach'].includes(type)) {
    return res.send({
      errcode: 40001,
      errmsg: 'Invalid type of position',
    });
  }
  const currentPosition = source[type].find(row => row.key === key);
  if (!currentPosition) {
    return res.send({
      errcode: 40002,
      errmsg: 'Invalid key of position',
    });
  }
  const condition =
    type === 'manage'
      ? ['classTechNo', 'classTech', 'classType', 'classNum', 'classTime']
      : ['adminId', 'adminName'];
  const dataSource = {
    ...detailDataSource,
    sess: currentPosition.sess,
    depName: currentPosition.depName,
    name: currentPosition.name[0].text,
    needNum: currentPosition.needNum,
    campus: currentPosition.campus,
    way: currentPosition.way,
    checkStatus: currentPosition.checkStatus,
    releaseStatus: currentPosition.releaseStatus,
  };
  condition.forEach(cond => delete dataSource[cond]);
  const result = {
    columns: detailColumns.filter(col => !condition.includes(col.dataIndex)),
    dataSource,
  };
  setTimeout(() => {
    res.send(result);
  }, 500);
};

/**
 * Part of `position/delete`
 */
const positionDelete = (req, res) => {
  const { type } = req.query;
  const { key = '' } = req.body || {};
  if (!['manage', 'teach'].includes(type)) {
    return res.send({
      errcode: 40001,
      errmsg: 'Invalid type of position',
    });
  }
  setTimeout(() => {
    const delIndex = source[type].findIndex(row => row.key === key);
    if (delIndex === -1) {
      res.send({
        errcode: 40003,
        errmsg: 'Delete failed',
      });
    } else {
      source[type].splice(delIndex, 1);
      res.send({
        errcode: 0,
        errmsg: 'Delete successfully',
      });
    }
  }, 400);
};

export default {
  [`POST ${APIPrefix}/position/list`]: positionList,
  [`POST ${APIPrefix}/position/detail`]: positionDetail,
  [`POST ${APIPrefix}/position/delete`]: positionDelete,
};
