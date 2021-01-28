import React, { lazy } from 'react'

import { HelpCircle as HelpCircleIcon } from 'react-feather'
import DescriptionIcon from '@material-ui/icons/Description'
import BusinessIcon from '@material-ui/icons/Business'
import ArchiveIcon from '@material-ui/icons/Archive'
import UnarchiveIcon from '@material-ui/icons/Unarchive'
import PeopleIcon from '@material-ui/icons/People'
import SettingsIcon from '@material-ui/icons/Settings'
import InfoIcon from '@material-ui/icons/Error'
import AppsIcon from '@material-ui/icons/Apps';
import SettingsInputComponentIcon from '@material-ui/icons/SettingsInputComponent'

const About = lazy(() => import('./About'))
const AdminHome = lazy(() => import('./AdminHome'))
const CheckpointHome = lazy(() => import('./CheckpointHome'))
const GuestHome = lazy(() => import('./GuestHome'))
const Help = lazy(() => import('./Help'))
const Page404 = lazy(() => import('./Route404'))
const WorkInProgress = lazy(() => import('./WorkInProgress'))
const User = lazy(() => import('./User'))
const Inventory = lazy(() => import('./Inventory'))
const Manufacturers = lazy(() => import('./Manufacturers'))
const Organizations = lazy(() => import('./Organization'))
const VaccinationCertificate = lazy(() => import('./VaccinationCertificate'))

const routes = [
  {
    name: 'generalView',
    icon: <AppsIcon />,
    component: AdminHome,
    path: '/',
    exact: true
  },
  {
    component: CheckpointHome,
    path: '/',
    exact: true,
    roles: ['checkpoint']
  },
  {
    component: GuestHome,
    path: '/',
    exact: true,
    roles: ['guest', 'vaccinator']
  },
  {
    name: 'inventory',
    icon: <DescriptionIcon />,
    roles: ['author', 'reviewer', 'vaccinator'],
    childrens: [
      {
        name: 'activeBatches',
        icon: <ArchiveIcon />,
        component: Inventory,
        path: '/inventory/active',
        exact: true
      },
      {
        name: 'deliveredBatches',
        icon: <UnarchiveIcon />,
        component: Inventory,
        path: '/inventory/delivered',
        exact: true
      }
    ]
  },
  {
    name: 'manufacturers',
    icon: <BusinessIcon />,
    roles: ['author'],
    component: Manufacturers,
    path: '/manufacturers'
  },
  {
    name: 'organizations',
    icon: <SettingsInputComponentIcon />,
    roles: ['author'],
    component: Organizations,
    path: '/organizations'
  },
  {
    name: 'users',
    icon: <PeopleIcon />,
    component: User,
    path: '/users',
    exact: true,
    roles: ['author']
  },
  {
    name: 'settings',
    icon: <SettingsIcon />,
    component: WorkInProgress,
    path: '/settings',
    exact: true,
    roles: ['author']
  },
  {
    header: 'docs',
    name: 'about',
    icon: <HelpCircleIcon />,
    component: About,
    path: '/about',
    exact: true
  },
  {
    name: 'help',
    icon: <InfoIcon />,
    component: Help,
    path: '/help',
    exact: true
  },
  {
    component: VaccinationCertificate,
    path: '/certificate',
    exact: true
  },
  {
    component: Page404
  }
]

export default role => {
  const routesForRole = routes.filter(
    route => !route.roles || route.roles.includes(role)
  )

  return {
    sidebar: routesForRole.filter(route => !!route.name),
    browser: routesForRole
      .reduce(
        (routes, route) => [
          ...routes,
          ...(route.childrens ? route.childrens : [route])
        ],
        []
      )
      .filter(route => !!route.component)
  }
}
