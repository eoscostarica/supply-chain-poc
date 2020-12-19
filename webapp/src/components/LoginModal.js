import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Visibility from '@material-ui/icons/Visibility'
import IconButton from '@material-ui/core/IconButton'
import VisibilityOff from '@material-ui/icons/VisibilityOff'
import { useMutation } from '@apollo/react-hooks'
import jwtDecode from 'jwt-decode'

import { LOGIN_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import Loader from './Loader'

const Wrapper = styled(Box)`
  width: calc(100vw - ${props => props.theme.spacing(4)}px);
  height: calc(100vh - ${props => props.theme.spacing(4)}px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const LogoBox = styled(Box)`
  margin-bottom: ${props => props.theme.spacing(4)}px;
  padding-left: ${props => props.theme.spacing(5)}px;
`

const Form = styled.form`
  width: 100%;
  ${props => props.theme.breakpoints.up('xs')} {
    max-width: 320px;
  }
  display: flex;
  flex-direction: column;
  margin-bottom: ${props => props.theme.spacing(4)}px;
`
const FormAction = styled(Box)`
  display: flex;
  justify-content: center;
  .MuiButtonBase-root {
    min-width: 200px;
  }
`

const StyledTextField = styled(TextField)`
  padding-bottom: ${props => props.theme.spacing(3)}px;
`

const LoginModal = ({ onClose, ...props }) => {
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

      setState({ showLogin: false, user: jwtDecode(data.login.access_token) })
      localStorage.setItem('token', data.login.access_token)
    } catch (error) {
      setState({
        message: {
          content: t(error.message),
          type: 'error'
        }
      })
    }
  }

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Modal open={state.showLogin || !state.user} {...props}>
      <Wrapper>
        <LogoBox>
          <img alt="logo" src="/logoInmu.png" width="156" height="213" />
        </LogoBox>
        <Form noValidate autoComplete="off">
          <StyledTextField
            id="username"
            label={t('username')}
            variant="outlined"
            value={username || ''}
            onChange={event => setUsername(event.target.value)}
          />
          <StyledTextField
            id="password"
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
          <FormAction>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOnLogin}
              disabled={!username || !password}
            >
              {t('login')}
            </Button>
          </FormAction>
          {loading && <Loader />}
        </Form>
        <Button>{t('credentialsRecovery')}</Button>
      </Wrapper>
    </Modal>
  )
}

LoginModal.propTypes = {
  onClose: PropTypes.func
}

export default memo(LoginModal)
