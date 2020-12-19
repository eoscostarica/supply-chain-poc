import { createMuiTheme } from '@material-ui/core/styles'

import palette from './palette'
import breakpoints from './breakpoints'

export default useDarkMode =>
  createMuiTheme({
    breakpoints,
    palette: { type: useDarkMode ? 'dark' : 'light', ...palette }
  })
