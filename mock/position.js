import { APIPrefix } from './login';

const possibleValues = {
  sess: ['2018-2019学年 第一学期', '2018-2019学年 第二学期'],
  depName: ['交通运输学院', '软件学院', '计算机与信息技术学院'],
  name: [{ text: '中国城市轨道交通协会专家和学术委员会', type: 'preview' }],
  campus: ['校本部', '东校区'],
  checkStatus: ['草稿', '待审核', '审核通过', '审核不通过', '无效'],
  releaseStatus: ['未发布', '已发布'],
  applyStatus: ['草稿', '待审核', '审核通过', '审核不通过', '无效'],
  action: [
    [{ text: '审核', type: 'audit' }, { text: '删除', type: 'delete' }],
    [{ text: '编辑', type: 'edit' }, { text: '删除', type: 'delete' }],
    [{ text: '申请', type: 'apply' }],
    [{ text: '下载', type: 'download' }],
  ],
};

const columns = [
  {
    width: 195,
    title: '学期',
    dataIndex: 'sess',
  },
  {
    width: 180,
    title: '单位',
    dataIndex: 'depName',
  },
  {
    width: 315,
    title: '岗位名称',
    dataIndex: 'name',
  },
  {
    width: 60,
    title: '岗位人数',
    dataIndex: 'needNum',
  },
  {
    width: 80,
    title: '校区',
    dataIndex: 'campus',
  },
  {
    width: 105,
    title: '审核状态',
    dataIndex: 'checkStatus',
  },
  {
    width: 95,
    title: '发布状态',
    dataIndex: 'releaseStatus',
  },
  {
    width: 150,
    title: '操作',
    dataIndex: 'action',
  },
];

const source = Array.from({ length: 120 }).map((_, index) => ({
  key: `${index}`,
  sess: possibleValues.sess[index % 2],
  depName: possibleValues.depName[index % 3],
  name: [{ text: '中国城市轨道交通协会专家和学术委员会', type: 'preview' }],
  needNum: parseInt((Math.random() * 100).toFixed(0), 10),
  campus: possibleValues.campus[Math.random() > 0.6 ? 0 : 1],
  checkStatus: possibleValues.checkStatus[index % 5],
  releaseStatus: possibleValues.releaseStatus[index % 2],
  applyStatus: possibleValues.applyStatus[index % 5],
  action: possibleValues.action[Math.random() > 0.7 ? 0 : 1],
}));

const positionList = (req, res) => {
  const { filtersValue = {}, limit = 10, offset = 0, type } = req.body;
  if (!['manage', 'teach'].includes(type)) {
    return {
      errcode: 40001,
      errmsg: 'Invalid type of position',
    };
  }
  const filtersKey = Object.keys(filtersValue);
  const filteredSource = filtersKey.length
    ? source.filter(value => !filtersKey.some(key => value[key] !== filtersValue[key]))
    : source;
  const dataSource = filteredSource.slice(offset, offset + limit);
  if (!dataSource.length) {
    dataSource.push(...filteredSource.slice(filteredSource.length - limit));
  }
  setTimeout(() => {
    res.send({
      actionKey: ['action', 'name'],
      columns,
      dataSource,
      total: filteredSource.length,
    });
  }, 200);
};

export default {
  [`POST ${APIPrefix}/position/list`]: positionList,
};
