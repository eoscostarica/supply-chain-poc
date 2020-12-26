import React, { memo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLazyQuery } from '@apollo/react-hooks'
import styled from 'styled-components'

import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import { USER_LIST_QUERY } from '../gql'

const StyledTabs = styled(Tabs)`
  ${props => props.theme.breakpoints.up('md')} {
    display: none;
  }
`

const Users = () => {
  const [value, setValue] = useState(0)
  const { t } = useTranslation('users')
  const [getUsers, { data: { users } = {} }] = useLazyQuery(USER_LIST_QUERY)

  const tabs = [
    {
      label: t('users'),
      content: (
        <ListItems
          items={
            users
              ? users.map(({ name, created_at: createAt }) => {
                  const newDate = new Date(createAt)
                  const dateFormat = newDate.toLocaleString({
                    hour: 'numeric',
                    hour12: true
                  })

                  return {
                    title: name,
                    summary: `Creado el - ${dateFormat}`
                  }
                })
              : []
          }
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

  useEffect(() => {
    getUsers()
  }, [getUsers])

  return <StyledTabs value={value} onChange={handleChange} items={tabs} />
}

export default memo(Users)
