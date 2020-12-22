import React from 'react'
import PropTypes from 'prop-types'
import jwtDecode from 'jwt-decode'

const SharedStateContext = React.createContext()

const getCurrentUser = token => {
  if (!token) {
    return
  }

  const data = jwtDecode(localStorage.getItem('token'))

  return {
    id: data.sub,
    name: data.name,
    username: data.username,
    email: data.email,
    account: data['https://hasura.io/jwt/claims']['x-hasura-user-account'],
    orgAccount: data['https://hasura.io/jwt/claims']['x-hasura-org-account'],
    role: data['https://hasura.io/jwt/claims']['x-hasura-default-role']
  }
}

const initialValue = {
  useDarkMode: false,
  showLogin: false,
  user: getCurrentUser(localStorage.getItem('token'))
}

const sharedStateReducer = (state, action) => {
  switch (action.type) {
    case 'set': {
      return {
        ...state,
        ...action.payload
      }
    }

    case 'token': {
      localStorage.setItem('token', action.payload)

      return {
        ...state,
        showLogin: false,
        user: getCurrentUser(action.payload)
      }
    }

    default: {
      throw new Error(`Unsupported action type: ${action.type}`)
    }
  }
}

export const SharedStateProvider = ({ children, ual, ...props }) => {
  const [state, dispatch] = React.useReducer(sharedStateReducer, initialValue)
  const value = React.useMemo(() => [state, dispatch], [state])

  return (
    <SharedStateContext.Provider value={value} {...props}>
      {children}
    </SharedStateContext.Provider>
  )
}

SharedStateProvider.propTypes = {
  children: PropTypes.node,
  ual: PropTypes.any
}

export const useSharedState = () => {
  const context = React.useContext(SharedStateContext)

  if (!context) {
    throw new Error(`useSharedState must be used within a SharedStateContext`)
  }

  const [state, dispatch] = context
  const setState = (payload, type = 'set') => dispatch({ type, payload })

  return [state, setState]
}
