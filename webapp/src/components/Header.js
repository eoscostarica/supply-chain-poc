import React, { memo, useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { useLocation, useHistory } from 'react-router-dom'
import Hidden from '@material-ui/core/Hidden'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import AppBar from '@material-ui/core/AppBar'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
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

const useStyles = makeStyles(theme => ({
  styledTypography: {
    color: `${theme.palette.text.primary}`,
    flexGrow: 1
  },
  styledToolbar: {
    padding: 0,
    [theme.breakpoints.up('md')]: {
      padding: `${theme.spacing(0, 2)}`
    }
  },
  styledAppBar: {
    backgroundColor: `${theme.palette.background.paper}`,
    boxShadow: `${theme.shadows[0]}`,
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('md')]: {
      boxShadow: `${theme.shadows[4]}`,
      borderBottom: 0
    }
  },
  styledSectionDesktop: {
    display: 'none',
    height: 54,
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '0 auto 7px auto',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  },
  styledSectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  }
}))

const SwitchThemeModeButton = memo(({ useDarkMode, onSwitch }) => {
  const { t } = useTranslation('header')

  return (
    <Button
      startIcon={useDarkMode ? <SunIcon /> : <MoonIcon />}
      onClick={() => onSwitch(!useDarkMode)}
    >
      {t(useDarkMode ? 'lightMode' : 'darkMode')}
    </Button>
  )
})

SwitchThemeModeButton.propTypes = {
  useDarkMode: PropTypes.bool,
  onSwitch: PropTypes.func
}

const LanguageButton = memo(({ current, onChange }) => {
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null)
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

  const handleLanguajeMenuOpen = event => {
    setLanguageAnchorEl(event.currentTarget)
  }

  const handleLanguajeMenuClose = language => {
    setLanguageAnchorEl(null)
    typeof language === 'string' && onChange && onChange(language)
  }

  return (
    <>
      <Button startIcon={<LanguageIcon />} onClick={handleLanguajeMenuOpen}>
        {(current || '').toUpperCase()}
      </Button>
      <Menu
        keepMounted
        anchorEl={languageAnchorEl}
        open={!!languageAnchorEl}
        onClose={handleLanguajeMenuClose}
      >
        {languages.map(language => (
          <MenuItem
            key={`language-menu-${language.value}`}
            onClick={() => handleLanguajeMenuClose(language.value)}
          >
            {language.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
})

LanguageButton.propTypes = {
  current: PropTypes.string,
  onChange: PropTypes.func
}

const UserButton = memo(({ user }) => (
  <>{user && <Button startIcon={<AccountIcon />}>{user.account}</Button>}</>
))

UserButton.propTypes = {
  user: PropTypes.any
}

const AuthButton = memo(({ user, onLogin, onSignOut }) => {
  const { t } = useTranslation()

  return (
    <>
      {user && (
        <Button startIcon={<ExitIcon />} onClick={onSignOut}>
          {t('signOut')}
        </Button>
      )}
      {!user && (
        <Button startIcon={<FingerprintIcon />} onClick={onLogin}>
          {t('login')}
        </Button>
      )}
    </>
  )
})

AuthButton.propTypes = {
  user: PropTypes.any,
  onLogin: PropTypes.func,
  onSignOut: PropTypes.func
}

const Header = memo(({ onDrawerToggle }) => {
  const classes = useStyles()
  const { t } = useTranslation('routes')
  const history = useHistory()
  const location = useLocation()
  const [state, setState] = useSharedState()
  const { i18n } = useTranslation('translations')
  const [currentLanguaje, setCurrentLanguaje] = useState()
  const [menuAnchorEl, setMenuAnchorEl] = useState()

  const handleChangeLanguage = languaje => i18n.changeLanguage(languaje)

  const handleLogin = () => {
    setState({ showLogin: !state.showLogin })
  }

  const handleSignOut = () => {
    setState({ user: null })
    localStorage.clear()
    history.push('/')
  }

  const handleOpenMenu = event => {
    setMenuAnchorEl(event.currentTarget)
  }

  const handleCloseMenu = () => {
    setMenuAnchorEl(null)
  }

  useEffect(() => {
    setCurrentLanguaje(i18n.language?.substring(0, 2) || 'en')
  }, [i18n.language])

  return (
    <AppBar className={classes.styledAppBar} position="sticky">
      <Toolbar className={classes.styledToolbar}>
        <Hidden mdUp>
          <IconButton aria-label="Open drawer" onClick={onDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Hidden>
        <Typography className={classes.styledTypography} variant="h4">
          {t(`${location.pathname}>heading`, '')}
        </Typography>
        <PageTitle title={t(`${location.pathname}>title`, mainConfig.title)} />
        <Box className={classes.styledSectionDesktop}>
          <LanguageButton
            current={currentLanguaje}
            onChange={handleChangeLanguage}
          />
          <UserButton user={state.user} />
          <AuthButton
            user={state.user}
            onLogin={handleLogin}
            onSignOut={handleSignOut}
          />
        </Box>
        <Box className={classes.styledSectionMobile}>
          <IconButton
            aria-label="show more"
            aria-haspopup="true"
            onClick={handleOpenMenu}
          >
            <MoreIcon />
          </IconButton>
        </Box>
      </Toolbar>
      <Menu
        anchorEl={menuAnchorEl}
        open={!!menuAnchorEl}
        onClose={handleCloseMenu}
      >
        <MenuItem>
          <LanguageButton
            current={currentLanguaje}
            onChange={handleChangeLanguage}
          />
        </MenuItem>
        <MenuItem>
          <UserButton user={state.user} />
        </MenuItem>
        <MenuItem>
          <AuthButton
            user={state.user}
            onLogin={handleLogin}
            onSignOut={handleSignOut}
          />
        </MenuItem>
      </Menu>
    </AppBar>
  )
})

Header.propTypes = {
  onDrawerToggle: PropTypes.func
}

export default Header
