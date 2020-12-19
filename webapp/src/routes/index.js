import React, { lazy } from 'react'

import {
  HelpCircle as HelpCircleIcon,
  GitMerge as GitMergeIcon,
  GitHub as GitHubIcon,
  Send as TelegramIcon
} from 'react-feather'
import DescriptionIcon from '@material-ui/icons/Description'
import ArchiveIcon from '@material-ui/icons/Archive'
import UnarchiveIcon from '@material-ui/icons/Unarchive'
import PeopleIcon from '@material-ui/icons/People'
import SettingsIcon from '@material-ui/icons/Settings'
import InfoIcon from '@material-ui/icons/Error'

import { mainConfig } from '../config'

const About = lazy(() => import('./About'))
const AdminHome = lazy(() => import('./AdminHome'))
const CheckpointHome = lazy(() => import('./CheckpointHome'))
const GuestHome = lazy(() => import('./GuestHome'))
const Help = lazy(() => import('./Help'))
const Page404 = lazy(() => import('./Route404'))
const WorkInProgress = lazy(() => import('./WorkInProgress'))

const routes = [
  {
    component: AdminHome,
    path: '/',
    exact: true,
    roles: ['author']
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
    roles: ['guest']
  },
  {
    name: 'inventory',
    icon: <DescriptionIcon />,
    roles: ['author'],
    childrens: [
      {
        name: 'activeBatches',
        icon: <ArchiveIcon />,
        component: WorkInProgress,
        path: '/active-batches',
        exact: true
      },
      {
        name: 'deliveredBatches',
        icon: <UnarchiveIcon />,
        component: WorkInProgress,
        path: '/delivered-batches',
        exact: true
      }
    ]
  },
  {
    name: 'users',
    icon: <PeopleIcon />,
    component: WorkInProgress,
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
    name: 'help',
    icon: <InfoIcon />,
    component: Help,
    path: '/help',
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
    name: 'changelog',
    badge: mainConfig.version || 'v1.0',
    path: 'https://github.com/eoscostarica/vaccine-traceability-poc/tags',
    icon: <GitMergeIcon />,
    exact: true
  },
  {
    header: 'community',
    name: 'github',
    path: 'https://github.com/eoscostarica/vaccine-traceability-poc',
    icon: <GitHubIcon />
  },
  {
    name: 'telegram',
    path: 'https://t.me/blockchaincostarica',
    icon: <TelegramIcon />
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
