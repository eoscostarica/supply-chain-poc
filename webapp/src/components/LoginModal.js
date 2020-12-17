import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { useMutation } from '@apollo/react-hooks'
import jwtDecode from 'jwt-decode'

import { LOGIN_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import Loader from './Loader'

const Wrapper = styled(Box)`
  width: calc(100vw - ${(props) => props.theme.spacing(4)}px);
  height: calc(100vh - ${(props) => props.theme.spacing(4)}px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Img = styled.img`
  padding: ${(props) => props.theme.spacing(2)}px;
  max-width: 200px;
`

const Form = styled.form`
  width: 100%;
  ${(props) => props.theme.breakpoints.up('xs')} {
    max-width: 320px;
  }
  display: flex;
  flex-direction: column;
`

const StyledTextField = styled(TextField)`
  padding-bottom: ${(props) => props.theme.spacing(2)}px;
`

const LoginModal = ({ onClose, ...props }) => {
  const { t } = useTranslation()
  const [login, { loading }] = useMutation(LOGIN_MUTATION)
  const [state, setState] = useSharedState()
  const [username, setUsername] = useState()
  const [password, setPassword] = useState()

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

  return (
    <Modal open={state.showLogin || !state.user} {...props}>
      <Wrapper>
        <Img src="/logo.png" alt="logo" />
        <Form noValidate autoComplete="off">
          <StyledTextField
            id="username"
            label={t('username')}
            variant="outlined"
            value={username || ''}
            onChange={(event) => setUsername(event.target.value)}
          />
          <StyledTextField
            id="password"
            label={t('password')}
            variant="outlined"
            type="password"
            value={password || ''}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOnLogin}
            disabled={!username || !password}
          >
            {t('login')}
          </Button>
          {loading && <Loader />}
        </Form>
      </Wrapper>
    </Modal>
  )
}

LoginModal.propTypes = {
  onClose: PropTypes.func
}

export default memo(LoginModal)
