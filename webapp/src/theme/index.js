import { createMuiTheme } from '@material-ui/core/styles'

import palette from './palette'
import breakpoints from './breakpoints'

export default (prefersDarkMode) =>
  createMuiTheme({
    breakpoints,
    palette: { type: prefersDarkMode ? 'dark' : 'light', ...palette }
  })
