import React, { lazy, useMemo, Suspense } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import { StylesProvider } from '@material-ui/styles'

import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import { ApolloProvider } from '@apollo/react-hooks'

import routes from './routes'
import getTheme from './theme'
import Loader from './components/Loader'
import Snackbar from './components/Snackbar'
import DashboardLayout from './layouts/Dashboard'

import { useSharedState } from './context/state.context'
import { client } from './graphql'

const LoginModal = lazy(() => import('./components/LoginModal'))

const App = () => {
  const [state] = useSharedState()

  const theme = useMemo(() => getTheme(state.useDarkMode), [state.useDarkMode])

  const renderRoute = ({ component: Component, ...route }, index) => (
    <Route
      key={`path-${route.path}-${index}`}
      path={route.path}
      exact={route.exact}
    >
      <Component />
    </Route>
  )

  const userRoutes = useMemo(
    () => routes(state.user?.role || 'guest'),

    [state.user]
  )

  return (
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <ApolloProvider client={client}>
              <BrowserRouter>
                <DashboardLayout routes={userRoutes.sidebar}>
                  <Suspense fallback={<Loader />}>
                    {state.showLogin && <LoginModal />}
                    <Snackbar />
                    <Switch>{userRoutes.browser.map(renderRoute)}</Switch>
                  </Suspense>
                </DashboardLayout>
              </BrowserRouter>
            </ApolloProvider>
          </MuiPickersUtilsProvider>
        </ThemeProvider>
      </MuiThemeProvider>
    </StylesProvider>
  )
}

App.propTypes = {}

export default App
