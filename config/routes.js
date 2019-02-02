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
        name: 'app.position',
        component: '../layouts/PageHeader',
        routes: [
          {
            path: '/position',
            redirect: '/position/manage/list',
          },
          {
            path: '/position/:type/list',
            component: './Position/List',
            dynamic: [{ type: 'manage' }, { type: 'teach' }],
            icon: ['tool', 'book'],
            name: ['app.position.manage', 'app.position.teach'],
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
