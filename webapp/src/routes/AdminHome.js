import React, { memo } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import CodeIcon from '@material-ui/icons/Code'
import { Typography } from '@material-ui/core'

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;

  svg {
    font-size: 5.5rem;
    padding-right: ${(props) => props.theme.spacing(1)}px;
  }
`

const AdminHome = () => {
  const { t } = useTranslation('')

  return (
    <Root>
      <CodeIcon />
      <Typography variant="h4">{t('adminHome')}</Typography>
    </Root>
  )
}

export default memo(AdminHome)
