import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'
import { SharedStateProvider } from './context/state.context'
import './i18n'

it('renders without crashing', () => {
  const div = document.createElement('div')

  ReactDOM.render(
    <SharedStateProvider>
      <App />
    </SharedStateProvider>,
    div
  )
  ReactDOM.unmountComponentAtNode(div)
})
