import React, { memo } from 'react'
import styled from 'styled-components'
import MuiSnackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

import { useSharedState } from '../context/state.context'

const StyledSnackbar = styled(MuiSnackbar)`
  a {
    color: ${props => props.theme.palette.success.contrastText};
    word-break: break-word;
  }
`

const Snackbar = () => {
  const [state, setState] = useSharedState()

  return (
    <StyledSnackbar
      open={!!state.message?.type}
      autoHideDuration={state?.message?.autoHideDuration}
      onClose={() => setState({ message: null })}
    >
      <Alert
        onClose={() => setState({ message: null })}
        severity={state.message?.type}
      >
        {state.message?.content}
      </Alert>
    </StyledSnackbar>
  )
}

export default memo(Snackbar)
