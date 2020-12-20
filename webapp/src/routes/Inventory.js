import React, { memo, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'

import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import CreateOrder from '../components/CreateOrder'
import Loader from '../components/Loader'
import { ASSETS_BY_STATUS_QUERY } from '../gql'
import { Typography } from '@material-ui/core'

const StyledTabs = styled(Tabs)`
  ${props => props.theme.breakpoints.up('md')} {
    display: none;
  }
`

const StyledFab = styled(Fab)`
  position: absolute;
  bottom: ${props => props.theme.spacing(2)}px;
  right: ${props => props.theme.spacing(2)}px;
  z-index: 1;
`

const EmptyMessage = styled(Typography)`
  text-align: center;
  padding: ${props => props.theme.spacing(2)}px;
`

const statusMap = {
  0: 'created',
  1: 'delivered'
}

// TODO: format date
const Inventory = () => {
  const { t } = useTranslation('inventory')
  const location = useLocation()
  const [
    getAssets,
    { loading, data: { assets } = {} }
  ] = useLazyQuery(ASSETS_BY_STATUS_QUERY, { fetchPolicy: 'network-only' })
  const [tab, setTab] = useState(0)
  const [items, setItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    getAssets({
      variables: { status: statusMap[tab] }
    })
    setIsModalOpen(false)
  }

  useEffect(() => {
    switch (location.pathname) {
      case '/inventory/active':
        setTab(0)
        break
      case '/inventory/delivered':
        setTab(1)
        break

      default:
        setTab(0)
        break
    }
  }, [location.pathname, setTab])

  useEffect(() => {
    getAssets({ variables: { status: statusMap[tab] } })
  }, [tab, getAssets])

  useEffect(() => {
    if (!assets) {
      return
    }

    setItems(
      assets.map(asset => ({
        title: `${t(asset.category)} #${asset.key}`,
        summary: `${t('createdAt')} - ${asset.created_at}`,
        caption: `${t('lastUpdate')}. ${asset.updated_at}`
      }))
    )
  }, [assets, t])

  const tabs = [
    {
      label: t('active'),
      content: <ListItems items={items} />
    },
    {
      label: t('delivered'),
      content: <ListItems items={items} />
    }
  ]

  return (
    <>
      <StyledTabs value={tab} onChange={handleTabChange} items={tabs} />
      <CreateOrder open={isModalOpen} onClose={handleCloseModal} />
      {loading && <Loader />}
      {!loading && !assets?.length && (
        <EmptyMessage>{t('emptyMessage')}</EmptyMessage>
      )}
      <StyledFab color="secondary" aria-label="add" onClick={handleOpenModal}>
        <AddIcon />
      </StyledFab>
    </>
  )
}

export default memo(Inventory)
