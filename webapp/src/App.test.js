import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from '@material-ui/core/styles'

import App from './App'
import './i18n'
import * as theme from './theme'

it('renders without crashing', () => {
  const div = document.createElement('div')

  ReactDOM.render(
    <ThemeProvider theme={theme.lightTheme}>
      <App />
    </ThemeProvider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
