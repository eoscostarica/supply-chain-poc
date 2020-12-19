import React, { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'

const StyledTabs = styled(Tabs)`
  ${props => props.theme.breakpoints.up('md')} {
    display: none;
  }
`

const Users = () => {
  const [value, setValue] = useState(0)
  const { t } = useTranslation('loginForm')

  const tabs = [
    {
      label: t('users'),
      content: (
        <ListItems
          items={[
            {
              title: 'User #1',
              summary: 'Creado el 12:03:58 12/04/20'
            },
            {
              title: 'User #2',
              summary: 'Creado el 12:03:58 12/04/20'
            }
          ]}
        />
      )
    },
    {
      label: t('roles'),
      content: (
        <ListItems
          items={[
            {
              title: 'Role #1',
              summary: 'Creado el 12:03:58 12/04/20'
            },
            {
              title: 'Role #2',
              summary: 'Creado el 12:03:58 12/04/20'
            }
          ]}
        />
      )
    }
  ]

  const handleChange = (event, newValue) => setValue(newValue)

  return <StyledTabs value={value} onChange={handleChange} items={tabs} />
}

export default memo(Users)
