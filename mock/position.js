import { APIPrefix } from './login';

const possibleValues = {
  action: [
    [{ text: '审核', type: 'audit' }, { text: '删除', type: 'delete' }],
    [{ text: '编辑', type: 'edit' }, { text: '删除', type: 'delete' }],
    [{ text: '申请', type: 'apply' }],
    [{ text: '下载', type: 'download' }],
  ],
  applyStatus: ['草稿', '待审核', '审核通过', '审核不通过', '无效'],
  campus: ['校本部', '东校区'],
  checkStatus: ['草稿', '待审核', '审核通过', '审核不通过', '无效'],
  depName: ['交通运输学院', '软件学院', '计算机与信息技术学院'],
  name: [
    [{ text: 'aaaaaaaaaaaaaaa', type: 'preview' }],
    [{ text: 'bbbbbbbbbbbbbbb', type: 'preview' }],
    [{ text: 'imheleimheleimhele', type: 'preview' }],
  ],
  releaseStatus: ['未发布', '已发布'],
  sess: ['2018-2019学年 第一学期', '2018-2019学年 第二学期'],
  way: ['固定', '临时'],
};

const columns = [
  {
    width: 200,
    title: '学期',
    dataIndex: 'sess',
  },
  {
    width: 188,
    title: '单位',
    dataIndex: 'depName',
  },
  {
    width: 255,
    title: '岗位名称',
    dataIndex: 'name',
  },
  {
    width: 64,
    title: '岗位人数',
    dataIndex: 'needNum',
  },
  {
    width: 78,
    title: '校区',
    dataIndex: 'campus',
  },
  {
    width: 108,
    title: '审核状态',
    dataIndex: 'checkStatus',
  },
  {
    width: 95,
    title: '发布状态',
    dataIndex: 'releaseStatus',
  },
  {
    width: 95,
    title: '聘用方式',
    dataIndex: 'way',
  },
  {
    width: 108,
    title: '申请状态',
    dataIndex: 'applyStatus',
  },
  {
    width: 112,
    title: '操作',
    dataIndex: 'action',
  },
];

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

const source = Array.from({ length: 120 }).map((_, index) => ({
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
}));

const operationArea = {
  operation: [
    { icon: 'plus', text: '新建', type: 'create' },
    { icon: 'cloud-download', text: '导出', type: 'export' },
  ],
};

const positionList = (req, res) => {
  const { filtersValue = {}, limit = 10, offset = 0, type } = req.body;
  if (!['manage', 'teach'].includes(type)) {
    return {
      errcode: 40001,
      errmsg: 'Invalid type of position',
    };
  }
  /**
   * `name` use `Input` to search, shouldn't give a simple comparison.
   */
  const filtersKey = Object.keys(filtersValue).filter(key => key !== 'name');
  /**
   * if `filter` is `{}`, the data will not be filtered
   */
  const filteredSource = !Object.keys(filtersValue).length
    ? source
    : !filtersValue.name
    ? source.filter(value => !filtersKey.some(key => value[key] !== filtersValue[key]))
    : source
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
  const result = {
    actionKey: ['action', 'name'],
    columns: columns.filter(col => !['applyStatus', 'way'].includes(col.dataIndex)),
    dataSource,
    filters: filters.filter(col => !['applyStatus', 'way'].includes(col.id)),
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
  }
  setTimeout(() => {
    res.send(result);
  }, 400);
};

export default {
  [`POST ${APIPrefix}/position/list`]: positionList,
};
