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
            redirect: '/position/manage',
          },
          {
            path: '/position/manage',
            icon: 'tool',
            name: 'app.position.manage',
            component: './Position/Manage',
          },
          {
            path: '/position/teach',
            icon: 'book',
            name: 'app.position.teach',
            component: './Position/Teach',
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
