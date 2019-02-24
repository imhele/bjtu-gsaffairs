const route: Route<true>[] = [
  // user
  {
    path: '/user',
    name: 'route.user',
    component: '../layouts/BlankLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      {
        path: '/user/login',
        name: 'route.user.login',
        component: './User/Login',
      },
    ],
  },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    scope: ['scope.admin'],
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
        name: 'route.position',
        Routes: ['./src/layouts/PageHeader'],
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
            name: ['route.position.manage.list', 'route.position.teach.list'],
            scope: [['scope.position.manage.list'], ['scope.position.teach.list']],
          },
          {
            path: '/position/:type/create',
            component: './Position/Create',
            hideInMenu: true,
            dynamic: [{ type: 'manage' }, { type: 'teach' }],
            name: ['route.position.manage.create', 'route.position.teach.create'],
            scope: [['scope.position.manage.create'], ['scope.position.teach.create']],
          },
          {
            path: '/position/:type/edit',
            component: './Position/Edit',
            hideInMenu: true,
            dynamic: [{ type: 'manage' }, { type: 'teach' }],
            name: ['route.position.manage.edit', 'route.position.teach.edit'],
            scope: [['scope.position.manage.edit'], ['scope.position.teach.edit']],
          },
          {
            path: '/position/:type/audit',
            component: './Position/Audit',
            hideInMenu: true,
            dynamic: [{ type: 'manage' }, { type: 'teach' }],
            name: ['route.position.manage.audit', 'route.position.teach.audit'],
            scope: [['scope.position.manage.audit'], ['scope.position.teach.audit']],
          },
          {
            path: '/position/:type/apply',
            component: './Position/Apply',
            hideInMenu: true,
            dynamic: [{ type: 'manage' }, { type: 'teach' }],
            name: ['route.position.manage.apply', 'route.position.teach.apply'],
            scope: [['scope.position.manage.apply'], ['scope.position.teach.apply']],
          },
        ],
      },
      {
        path: '/stuapply',
        component: './Stuapply/List',
        icon: 'bars',
        name: 'route.stuapply',
      },
      // result
      {
        path: '/result',
        hideInMenu: true,
        routes: [
          {
            path: '/result',
            redirect: '/exception/404',
          },
          {
            path: '/result/success',
            redirect: '/exception/404',
          },
          {
            path: '/result/success/:id',
            component: './Result/Success',
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

export default route;
