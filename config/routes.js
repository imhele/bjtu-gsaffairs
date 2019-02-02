export default [
  // user
  {
    path: '/user',
    component: '../layouts/BlankLayout',
    routes: [{ path: '/user', redirect: '/user/login' }],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    routes: [
      // default route
      {
        path: '/',
        redirect: '/position',
      },
      // position
      {
        path: '/position',
        icon: 'cluster',
        name: 'route.position-list',
        component: '../layouts/PageHeader',
        routes: [
          {
            path: '/position',
            redirect: '/position/manage/list',
          },
          {
            path: '/position/:type',
            redirect: '/position/:type/list',
          },
          {
            path: '/position/:type/list',
            component: './Position/List',
            dynamic: [{ type: 'manage' }, { type: 'teach' }],
            icon: ['tool', 'book'],
            name: ['route.position.manage', 'route.position.teach'],
            scope: [['scope.position.manage.list'], ['scope.position.teach.list']],
          },
        ],
      },
      // exceptions
      {
        path: '/exception',
        hideInMenu: true,
        routes: [
          {
            path: '/exception',
            redirect: '/exception/404',
          },
          {
            path: '/exception/403',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            component: './Exception/404',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
