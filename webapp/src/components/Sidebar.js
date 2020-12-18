import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { NavLink as RouterNavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import Box from '@material-ui/core/Box'
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider'
import Chip from '@material-ui/core/Chip'
import List from '@material-ui/core/List'
import MuiListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import Collapse from '@material-ui/core/Collapse'
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css'
import {
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon
} from 'react-feather'

import { mainConfig } from '../config'

const Brand = styled(Box)`
  background-color: ${props => props.theme.palette.background.paper};
  height: 169px;
  display: flex;
  justify-content: center;
  padding: ${props => props.theme.spacing(2)}px;

  img {
    width: 91px;
    height: 124px;
  }
  ${props => props.theme.breakpoints.up('sm')} {
    height: auto;
  }
`

const Scrollbar = styled(PerfectScrollbar)`
  background-color: ${props => props.theme.palette.background.paper};
`

const StyledListItemText = styled(ListItemText)`
  span {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
  }
`

const NavLink = React.forwardRef((props, ref) => (
  <RouterNavLink innerRef={ref} {...props} />
))

const ExternalLink = React.forwardRef(({ to, children, className }, ref) => (
  <a
    ref={ref}
    href={to}
    className={className}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
))

ExternalLink.propTypes = {
  to: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string
}

const Badge = styled(Chip)`
  font-weight: ${props => props.theme.typography.fontWeightBold};
  height: 20px;
  background-color: ${props => props.theme.palette.primary.main};
  span.MuiChip-label,
  span.MuiChip-label:hover {
    cursor: pointer;
    color: ${props => props.theme.palette.primary.contrastText};
    padding: ${props => props.theme.spacing(0, 1)};
  }
`

const ListItemLink = ({ name, path, icon, badge, ...props }) => {
  const { t } = useTranslation('routes')
  const primaryText = path.includes('http')
    ? t(name, name)
    : t(`${path}>sidebar`, path)

  return (
    <MuiListItem
      button
      component={path.includes('http') ? ExternalLink : NavLink}
      exact
      to={path}
      activeClassName="active"
      href={path}
      {...props}
    >
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <StyledListItemText primary={primaryText} />
      {badge && <Badge label={badge} />}
    </MuiListItem>
  )
}

ListItemLink.propTypes = {
  name: PropTypes.string,
  path: PropTypes.string,
  icon: PropTypes.node,
  badge: PropTypes.string
}

const ListItemGroup = ({ name, icon, path, childrens, ...props }) => {
  const [open, setOpen] = useState(true)
  const { t } = useTranslation('routes')

  return (
    <>
      <MuiListItem button onClick={() => setOpen(() => !open)} {...props}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <StyledListItemText primary={t(name)} />
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </MuiListItem>
      {childrens && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {childrens.map((route, index) => (
            <ListItem
              header={route.header}
              path={route.path}
              icon={route.icon}
              text={route.text}
              key={`${route.name}${index}`}
            />
          ))}
        </Collapse>
      )}
    </>
  )
}

ListItemGroup.propTypes = {
  name: PropTypes.string,
  path: PropTypes.string,
  icon: PropTypes.node,
  childrens: PropTypes.array
}

const ListItemWrapper = styled(Box)`
  display: flex;
  flex-direction: column;

  p {
    font-weight: ${props => props.theme.typography.fontWeightBold};
    padding-left: ${props => props.theme.spacing(2)}px;
    cursor: default;
  }

  .MuiBox-root {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .MuiCollapse-container {
    width: 100%;
    padding-left: ${props => props.theme.spacing(2)}px;
  }

  .active {
    background-color: ${props => props.theme.palette.action.selected};
  }
`

const ListItem = ({ header, childrens, ...props }) => {
  const { t } = useTranslation('routes')

  return (
    <ListItemWrapper>
      {header && <Typography>{t(header)}</Typography>}
      {childrens && <ListItemGroup childrens={childrens} {...props} />}
      {!childrens && <ListItemLink {...props} />}
    </ListItemWrapper>
  )
}

ListItem.propTypes = {
  header: PropTypes.string,
  childrens: PropTypes.array
}

const Sidebar = ({ routes, ...props }) => (
  <Drawer {...props}>
    <Brand>
      <img alt={mainConfig.title} src="/logoInmu.png" />
    </Brand>
    <Divider />
    <Scrollbar>
      <List component="nav">
        {routes.map((category, index) => (
          <ListItem
            key={`${category.name}${index}`}
            name={category.name}
            header={category.header}
            path={category.path}
            icon={category.icon}
            badge={category.badge}
            childrens={category.childrens}
          />
        ))}
      </List>
    </Scrollbar>
  </Drawer>
)

Sidebar.propTypes = {
  routes: PropTypes.array
}

export default memo(Sidebar)
