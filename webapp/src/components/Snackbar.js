import React, { memo } from 'react'
import MuiSnackbar from '@material-ui/core/Snackbar'
import Alert from '@material-ui/lab/Alert'

import { useSharedState } from '../context/state.context'

const Snackbar = () => {
  const [state, setState] = useSharedState()

  return (
    <MuiSnackbar
      open={!!state.message?.type}
      autoHideDuration={6000}
      onClose={() => setState({ message: null })}
    >
      <Alert
        onClose={() => setState({ message: null })}
        severity={state.message?.type}
      >
        {state.message?.content}
      </Alert>
    </MuiSnackbar>
  )
}

export default memo(Snackbar)
