import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '46d'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', '898'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'dd5'),
            routes: [
              {
                path: '/intro/about',
                component: ComponentCreator('/intro/about', '45f'),
                exact: true,
                sidebar: "main"
              },
              {
                path: '/intro/history',
                component: ComponentCreator('/intro/history', 'fe2'),
                exact: true,
                sidebar: "main"
              },
              {
                path: '/problems/better-web',
                component: ComponentCreator('/problems/better-web', '99b'),
                exact: true,
                sidebar: "main"
              },
              {
                path: '/problems/web2-limits',
                component: ComponentCreator('/problems/web2-limits', '6ed'),
                exact: true,
                sidebar: "main"
              },
              {
                path: '/problems/web3-building-blocks',
                component: ComponentCreator('/problems/web3-building-blocks', 'a47'),
                exact: true,
                sidebar: "main"
              },
              {
                path: '/roadmap',
                component: ComponentCreator('/roadmap', '426'),
                exact: true,
                sidebar: "main"
              },
              {
                path: '/',
                component: ComponentCreator('/', '3b2'),
                exact: true,
                sidebar: "main"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
