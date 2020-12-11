
import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';
export default [
{
  path: '/',
  component: ComponentCreator('/','deb'),
  exact: true,
},
{
  path: '/__docusaurus/debug',
  component: ComponentCreator('/__docusaurus/debug','3d6'),
  exact: true,
},
{
  path: '/__docusaurus/debug/config',
  component: ComponentCreator('/__docusaurus/debug/config','914'),
  exact: true,
},
{
  path: '/__docusaurus/debug/content',
  component: ComponentCreator('/__docusaurus/debug/content','c28'),
  exact: true,
},
{
  path: '/__docusaurus/debug/globalData',
  component: ComponentCreator('/__docusaurus/debug/globalData','3cf'),
  exact: true,
},
{
  path: '/__docusaurus/debug/metadata',
  component: ComponentCreator('/__docusaurus/debug/metadata','31b'),
  exact: true,
},
{
  path: '/__docusaurus/debug/registry',
  component: ComponentCreator('/__docusaurus/debug/registry','0da'),
  exact: true,
},
{
  path: '/__docusaurus/debug/routes',
  component: ComponentCreator('/__docusaurus/debug/routes','244'),
  exact: true,
},
{
  path: '/docs',
  component: ComponentCreator('/docs','ccb'),
  
  routes: [
{
  path: '/docs/',
  component: ComponentCreator('/docs/','8f4'),
  exact: true,
},
{
  path: '/docs/accounts',
  component: ComponentCreator('/docs/accounts','fce'),
  exact: true,
},
{
  path: '/docs/architecture',
  component: ComponentCreator('/docs/architecture','54f'),
  exact: true,
},
{
  path: '/docs/token',
  component: ComponentCreator('/docs/token','a14'),
  exact: true,
},
{
  path: '/docs/traceability',
  component: ComponentCreator('/docs/traceability','184'),
  exact: true,
},
{
  path: '/docs/user-interface',
  component: ComponentCreator('/docs/user-interface','604'),
  exact: true,
},
]
},
{
  path: '*',
  component: ComponentCreator('*')
}
];
