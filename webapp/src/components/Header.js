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
import Box from '@material-ui/core/Box'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Tooltip from '@material-ui/core/Tooltip'
import MenuIcon from '@material-ui/icons/Menu'
import LanguageIcon from '@material-ui/icons/Language'
import FingerprintIcon from '@material-ui/icons/Fingerprint'
import AccountIcon from '@material-ui/icons/AccountCircle'
import ExitIcon from '@material-ui/icons/ExitToApp'
import MoreIcon from '@material-ui/icons/MoreVert'
import { Sun as SunIcon, Moon as MoonIcon } from 'react-feather'

import { useSharedState } from '../context/state.context'
import PageTitle from '../components/PageTitle'
import { mainConfig } from '../config'

const StyledTypography = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  flex-grow: 1;
  font-size: 25px;

  ${props => props.theme.breakpoints.up('md')} {
    font-size: 35px;
  }
`

const StyledAppBar = styled(AppBar)`
  background-color: ${props => props.theme.palette.background.paper};
  box-shadow: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.24);

  ${props => props.theme.breakpoints.up('md')} {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
      0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
    border-bottom: 0;
  }
`

const StyledSectionDesktop = styled(Box)`
  ${props => props.theme.breakpoints.up('md')} {
    display: flex;
  }
  display: none;
`

const StyledSectionMobile = styled(Box)`
  ${props => props.theme.breakpoints.up('md')} {
    display: none;
  }
  display: flex;
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
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget)
  }

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }

  return (
    <div>
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
          <PageTitle
            title={t(`${location.pathname}>title`, mainConfig.title)}
          />
          <StyledSectionDesktop>
            <ThemeMenu />
            <LanguageMenu />
            <UserMenu />
          </StyledSectionDesktop>
          <StyledSectionMobile>
            <IconButton
              aria-label="show more"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </StyledSectionMobile>
        </Toolbar>
      </StyledAppBar>
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      >
        <MenuItem>
          <ThemeMenu />
        </MenuItem>
        <MenuItem>
          <LanguageMenu />
        </MenuItem>
        <MenuItem onClick={() => {}}>
          <UserMenu />
        </MenuItem>
      </Menu>
    </div>
  )
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func
}

export default memo(Header)
