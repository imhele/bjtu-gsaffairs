import { APIPrefix } from './login';

const columns = [
  {
    width: 120,
    title: '学期',
    dataIndex: 'sess',
  },
  {
    width: 100,
    title: '单位',
    dataIndex: 'depName',
  },
  {
    width: 240,
    title: '岗位名称',
    dataIndex: 'name',
  },
  {
    width: 50,
    title: '岗位人数',
    dataIndex: 'needNum',
  },
  {
    width: 50,
    title: '校区',
    dataIndex: 'campus',
  },
  {
    width: 75,
    title: '审核状态',
    dataIndex: 'checkStatus',
  },
  {
    width: 64,
    title: '发布状态',
    dataIndex: 'releaseStatus',
  },
  {
    width: 100,
    title: '操作',
    dataIndex: 'action',
  },
];

const positionList = (req, res) => {
  const { filtersValue, limit, offset, type } = req.body;
  res.send({ actionKey: ['action', 'name'], columns });
};

export default {
  [`POST ${APIPrefix}/position/list`]: positionList,
};
