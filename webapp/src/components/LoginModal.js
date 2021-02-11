import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Visibility from '@material-ui/icons/Visibility'
import IconButton from '@material-ui/core/IconButton'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { useMutation } from '@apollo/react-hooks'

import { LOGIN_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import Loader from './Loader'

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  logoBox: {
    marginBottom: theme.spacing(4),
    paddingLeft: theme.spacing(5)
  },
  form: {
    width: '100%',
    [theme.breakpoints.up('xs')]: {
      maxWidth: 320
    },
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(4)
  },
  formAction: {
    display: 'flex',
    justifyContent: 'center',
    '& .MuiButtonBase-root': {
      minWidth: 200
    }
  },
  styledTextField: {
    paddingBottom: theme.spacing(3)
  }
}))

const LoginModal = ({ onClose, ...props }) => {
  const classes = useStyles()
  const { t } = useTranslation('loginForm')
  const [login, { loading }] = useMutation(LOGIN_MUTATION)
  const [state, setState] = useSharedState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()
  const [showPassword, setShowPassword] = useState(false)

  const handleOnLogin = async () => {
    try {
      const { data } = await login({
        variables: {
          username,
          password
        }
      })

      setState(data.login.access_token, 'token')
    } catch (error) {
      setState({
        message: {
          content: t(error.message),
          type: 'error'
        }
      })
    }
  }

  const handleOnCloseLogin = () => {
    setState({ showLogin: false })
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Modal
      open={state.showLogin || !state.user}
      onClose={handleOnCloseLogin}
      {...props}
    >
      <Box className={classes.wrapper}>
        <Box className={classes.logoBox}>
          <img alt="logo" src="/logo.png" width="156" height="213" />
        </Box>
        <form className={classes.form} noValidate autoComplete="off">
          <TextField
            id="username"
            className={classes.styledTextField}
            label={t('username')}
            variant="outlined"
            value={username || ''}
            onChange={event => setUsername(event.target.value)}
          />
          <TextField
            id="password"
            className={classes.styledTextField}
            label={t('password')}
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            value={password || ''}
            onChange={event => setPassword(event.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              )
            }}
          />
          <Box className={classes.formAction}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOnLogin}
              disabled={!username || !password}
            >
              {t('login')}
            </Button>
          </Box>
          {loading && <Loader />}
        </form>
        <Button>{t('credentialsRecovery')}</Button>
      </Box>
    </Modal>
  )
}

LoginModal.propTypes = {
  onClose: PropTypes.func
}

export default memo(LoginModal)
