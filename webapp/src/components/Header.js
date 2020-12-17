import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import Hidden from '@material-ui/core/Hidden'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import MenuIcon from '@material-ui/icons/Menu'
import LanguageIcon from '@material-ui/icons/Language'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import AccountIcon from '@material-ui/icons/AccountCircle'
import ExitIcon from '@material-ui/icons/ExitToApp'
import { Sun as SunIcon, Moon as MoonIcon } from 'react-feather'

import { useSharedState } from '../context/state.context'
import PageTitle from '../components/PageTitle'
import { mainConfig } from '../config'

const StyledTypography = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  flex-grow: 1;
`

const StyledAppBar = styled(AppBar)`
  background-color: ${props => props.theme.palette.background.paper};
`

const languages = [
  {
    value: 'en',
    label: 'EN'
  },
  {
    value: 'es',
    label: 'ES'
  }
]

const ThemeMenu = () => {
  const { t } = useTranslation()
  const [state, setState] = useSharedState()

  return (
    <Tooltip title={t('switchTheme')}>
      <IconButton
        aria-label="switch theme"
        onClick={() => setState({ prefersDarkMode: !state.prefersDarkMode })}
      >
        {state.prefersDarkMode ? <SunIcon /> : <MoonIcon />}
      </IconButton>
    </Tooltip>
  )
}

const LanguageMenu = () => {
  const [anchorMenu, setAnchorMenu] = useState(null)
  const { i18n } = useTranslation('translations')
  const [currentLanguaje, setCurrentLanguaje] = useState('')

  const toggleMenu = event => {
    setAnchorMenu(event.currentTarget)
  }

  const closeMenu = language => {
    setAnchorMenu(null)

    if (typeof language === 'string') {
      i18n.changeLanguage(language)
    }
  }

  useEffect(() => {
    setCurrentLanguaje(i18n.language?.substring(0, 2) || 'en')
  }, [i18n.language])

  return (
    <>
      <Button startIcon={<LanguageIcon />} onClick={toggleMenu}>
        {currentLanguaje.toUpperCase()}
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorMenu}
        open={Boolean(anchorMenu)}
        onClose={closeMenu}
      >
        {languages.map(language => (
          <MenuItem
            key={`language-menu-${language.value}`}
            onClick={() => closeMenu(language.value)}
          >
            {language.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

const UserMenu = () => {
  const { t } = useTranslation()
  const [state, setState] = useSharedState()

  const handleOnLogin = () => {
    setState({ showLogin: !state.showLogin })
  }

  const handleSignOut = () => {
    setState({ user: null })
    localStorage.clear()
  }

  return (
    <>
      {state.user && (
        <>
          <Button startIcon={<AccountIcon />}>{state.user.account}</Button>
          <Button startIcon={<ExitIcon />} onClick={handleSignOut}>
            {t('logout')}
          </Button>
        </>
      )}
      {!state.user && (
        <Button startIcon={<FingerprintIcon />} onClick={handleOnLogin}>
          {t('login')}
        </Button>
      )}
    </>
  )
}

const Header = ({ onDrawerToggle }) => {
  const { t } = useTranslation('routes')
  const location = useLocation()

  return (
    <StyledAppBar position="sticky">
      <Toolbar>
        <Hidden mdUp>
          <IconButton
            color="inherit"
            aria-label="Open drawer"
            onClick={onDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Hidden>
        <StyledTypography variant="h4">
          {t(`${location.pathname}>heading`, '')}
        </StyledTypography>
        <PageTitle title={t(`${location.pathname}>title`, mainConfig.title)} />
        <ThemeMenu />
        <LanguageMenu />
        <UserMenu />
      </Toolbar>
    </StyledAppBar>
  )
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func
}

export default memo(Header)
