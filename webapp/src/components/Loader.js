import React, { memo } from 'react'
import styled from 'styled-components'

import { CircularProgress } from '@material-ui/core'

const Root = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
`

const Loader = () => {
  return (
    <Root>
      <CircularProgress m={2} color="secondary" />
    </Root>
  )
}

export default memo(Loader)
