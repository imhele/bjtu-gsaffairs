import moment from 'moment';
import { APIPrefix } from './login';
import {
  createForm,
  detailColumns,
  detailDataSource,
  possibleValues,
  tableColumns,
} from './position.json';

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
    action: possibleValues.action[index % 4],
    applyStatus: possibleValues.applyStatus[index % 5],
    campus: possibleValues.campus[Math.random() > 0.4 ? 0 : 1],
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
    campus: possibleValues.campus[Math.random() > 0.4 ? 0 : 1],
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
 * If the table data exceeds 1000 rows or the table operation is jammed,
 * `audit` function can be turned off to increase rendering speed on equipment with poor performance.
 */
const operationArea = {
  operation: [
    { icon: 'plus', text: '新建', type: 'create' },
    { icon: 'cloud-download', text: '导出', type: 'export' },
    { icon: 'audit', text: '审核', type: 'audit' },
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
        .filter(value => value.name.text.includes(filtersValue.name));
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
    delete result.actionKey;
    delete result.selectable;
    delete result.operationArea;
  }
  setTimeout(() => res.send(result), 400);
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
    name: currentPosition.name.text,
    needNum: currentPosition.needNum,
    campus: currentPosition.campus,
    way: currentPosition.way,
    checkStatus: currentPosition.checkStatus,
    releaseStatus: currentPosition.releaseStatus,
  };
  condition.forEach(cond => delete dataSource[cond]);
  let current = 0;
  let status = 'process';
  switch (dataSource.checkStatus) {
    case '待审核':
      current = Math.random() > 0.5 ? 1 : 2;
      break;
    case '审核通过':
      current = type === 'manage' ? 3 : 4;
      if (dataSource.releaseStatus === '已发布') {
        status = 'finish';
      } else {
        status = 'wait';
      }
      break;
    case '审核不通过':
      current = Math.random() > 0.5 ? 1 : 2;
      status = 'error';
      break;
    default:
      break;
  }
  const result = {
    columns: detailColumns.filter(col => !condition.includes(col.dataIndex)),
    dataSource,
    stepsProps: {
      current,
      status,
      labelPlacement: 'vertical',
      steps:
        type === 'manage'
          ? [
              { title: '单位申报' },
              { title: '人事处审核' },
              { title: '研工部审核' },
              { title: '发布岗位' },
            ]
          : [
              { title: '教师申报' },
              { title: '用人单位审核' },
              { title: detailDataSource.classType === '本科' ? '教务处审核' : '研究生院审核' },
              { title: '研工部审核' },
              { title: '发布岗位' },
            ],
    },
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

/**
 * Part of `position/form`
 */
const positionForm = (req, res) => {
  const { type } = req.query;
  const { action, key = '' } = req.body || {};
  if (!['manage', 'teach'].includes(type)) {
    return res.send({
      errcode: 40001,
      errmsg: 'Invalid type of position',
    });
  }
  if (!['create', 'edit'].includes(action)) {
    return res.send({
      errcode: 40004,
      errmsg: 'Invalid action type for fetching form',
    });
  }
  const result = { ...createForm[type] };
  if (action === 'edit') {
    const currentPosition = source[type].find(row => row.key === key);
    if (!currentPosition) {
      return res.send({
        errcode: 40002,
        errmsg: 'Invalid key of position',
      });
    }
    result.initialFieldsValue = {
      ...detailDataSource,
      ...currentPosition,
      name: currentPosition.name.text,
    };
    result.initialFieldsValue.timeRange = result.initialFieldsValue.timeRange.split(' ~ ');
  }
  setTimeout(() => res.send(result), 400);
};

/**
 * Part of `position/create`
 */
const positionCreate = (req, res) => {
  const { type } = req.query;
  if (!['manage', 'teach'].includes(type)) {
    return res.send({
      errcode: 40001,
      errmsg: 'Invalid type of position',
    });
  }
  if (!req.body) {
    return res.send({
      errcode: 40005,
      errmsg: 'Invalid value(s)',
    });
  }
  source[type].unshift({
    ...detailDataSource,
    key: `${Math.random()}`,
    action: possibleValues.action[Math.random() > 0.7 ? 0 : 1],
    applyStatus: null,
    checkStatus: possibleValues.checkStatus[1],
    releaseStatus: possibleValues.releaseStatus[0],
    ...req.body,
    name: { text: req.body.name, type: 'preview' },
    timeRange: req.body.timeRange.join(' ~ '),
  });
  const extraData =
    type === 'manage' ? ['sess', 'name', 'adminName'] : ['sess', 'name', 'classTech'];
  setTimeout(() => {
    res.send({
      errcode: 0,
      title: '创建成功',
      description: '你已成功创建一个新岗位，请耐心等待审核结果',
      extra: {
        columns: detailColumns.filter(col => extraData.includes(col.dataIndex)),
        dataSource: {
          sess: source[type][0].sess,
          name: source[type][0].name.text,
          adminName: source[type][0].adminName,
          classTech: source[type][0].classTech,
        },
      },
      stepsProps: {
        current: 1,
        steps:
          type === 'manage'
            ? [
                {
                  description: moment().format('YYYY-MM-DD HH:mm'),
                  title: '单位申报',
                },
                { title: '人事处审核' },
                { title: '研工部审核' },
                { title: '发布岗位' },
              ]
            : [
                {
                  description: moment().format('YYYY-MM-DD HH:mm'),
                  title: '教师申报',
                },
                { title: '用人单位审核' },
                { title: req.body.classType === '本科' ? '教务处审核' : '研究生院审核' },
                { title: '研工部审核' },
                { title: '发布岗位' },
              ],
      },
    });
  }, 400);
};

/**
 * Part of `position/edit`
 */
const positionEdit = (req, res) => {
  const { type } = req.query;
  const { key = '' } = req.body || {};
  if (!['manage', 'teach'].includes(type)) {
    return res.send({
      errcode: 40001,
      errmsg: 'Invalid type of position',
    });
  }
  if (!req.body) {
    return res.send({
      errcode: 40005,
      errmsg: 'Invalid value(s)',
    });
  }
  const currentIndex = source[type].findIndex(row => row.key === key);
  if (currentIndex === -1) {
    return res.send({
      errcode: 40002,
      errmsg: 'Invalid key of position',
    });
  }
  source[type][currentIndex] = {
    ...source[type][currentIndex],
    ...req.body,
    name: { text: req.body.name, type: 'preview' },
    timeRange: req.body.timeRange.join(' ~ '),
  };
  setTimeout(() => {
    res.send({
      errcode: 0,
      errmsg: '提交成功',
    });
  }, 400);
};

export default {
  [`POST ${APIPrefix}/position/list`]: positionList,
  [`POST ${APIPrefix}/position/detail`]: positionDetail,
  [`POST ${APIPrefix}/position/delete`]: positionDelete,
  [`POST ${APIPrefix}/position/form`]: positionForm,
  [`POST ${APIPrefix}/position/create`]: positionCreate,
  [`POST ${APIPrefix}/position/edit`]: positionEdit,
};
