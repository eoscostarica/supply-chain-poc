import React, { memo } from 'react'
import styled from 'styled-components'

import FullTabs from '../components/Tabs'

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
  height: 100%;
`

const StyledTabs = styled(FullTabs)`
  flex: 1;
  height: 100%;

  .MuiTabs-root {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2),
      0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  }

  .Mui-selected {
    color: rgba(0, 0, 0, 0.8);
  }

  .MuiTabs-indicator {
    background-color: #ed5951;
  }
`

const Users = () => {
  return (
    <Root>
      <StyledTabs laberTab1="Users" laberTab2="Roles" />
    </Root>
  )
}

export default memo(Users)
