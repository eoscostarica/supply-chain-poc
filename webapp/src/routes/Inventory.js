import React, { memo, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import { useSharedState } from '../context/state.context'
import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import CreateOrder from '../components/CreateOrder'
import CreateOffer from '../components/CreateOffer'
import ClaimOffer from '../components/ClaimOffer'
import DetachAssets from '../components/DetachAssets'
import UpdateAssets from '../components/UpdateAssets'
import Loader from '../components/Loader'
import { ASSETS_BY_STATUS_QUERY } from '../gql'

const StyledTabs = styled(Tabs)`
  ${props => props.theme.breakpoints.up('md')} {
    display: none;
  }
`

const StyledFab = styled(Fab)`
  position: fixed;
  bottom: ${props => props.theme.spacing(2)}px;
  right: ${props => props.theme.spacing(2)}px;
  z-index: 1;
`

const EmptyMessage = styled(Typography)`
  text-align: center;
  padding: ${props => props.theme.spacing(2)}px;
`

const statusMap = {
  0: ['attached'],
  1: 'delivered'
}

// TODO: format date
const Inventory = () => {
  const { t } = useTranslation('inventory')
  const location = useLocation()
  const [state] = useSharedState()
  const [
    getAssets,
    { loading, data: { assets } = {} }
  ] = useLazyQuery(ASSETS_BY_STATUS_QUERY, { fetchPolicy: 'network-only' })
  const [tab, setTab] = useState(0)
  const [items, setItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const [asset, setAsset] = useState()

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleOpenModal = (name, edit = false) => () => {
    // TODO: Verify items detached view with @jorge
    if (edit && asset.category !== 'order') return

    setIsModalOpen(prev => ({ ...prev, [name]: true, edit }))
    setAnchorEl(null)
  }

  const handleCloseModal = name => () => {
    getAssets({
      variables: { status: statusMap[tab] }
    })
    setIsModalOpen(prev => ({ ...prev, [name]: false, edit: false }))
  }

  const handleOpenMenu = asset => event => {
    setAnchorEl(event.currentTarget)
    setAsset(asset)
  }

  const handleCloseMenu = () => {
    setAnchorEl(null)
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
      assets.map(asset => {
        const { idata, key, category } = asset
        const lastSixNumber = key.substr(key.length - 6)

        let title = `${t(category)} #${lastSixNumber}`

        if (category === 'order') {
          const companyName = idata.manufacturer.name

          title = `${companyName} - Orden #${lastSixNumber}`
        }

        return {
          title,
          summary: `${t('status')} - ${asset.status}`,
          action: (
            <IconButton
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={handleOpenMenu(asset)}
            >
              <MoreVertIcon />
            </IconButton>
          )
        }
      })
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
      {isModalOpen.create && (
        <CreateOrder
          open={isModalOpen.create}
          onClose={handleCloseModal('create')}
          orderInfo={isModalOpen.edit ? asset : {}}
          isEdit={isModalOpen.edit}
        />
      )}
      {isModalOpen.offer && (
        <CreateOffer
          asset={asset.id}
          open={isModalOpen.offer}
          onClose={handleCloseModal('offer')}
        />
      )}
      {isModalOpen.claim && (
        <ClaimOffer
          assets={[asset.id]}
          open={isModalOpen.claim}
          onClose={handleCloseModal('claim')}
        />
      )}
      {isModalOpen.detach && (
        <DetachAssets
          asset={asset.id}
          open={isModalOpen.detach}
          onClose={handleCloseModal('detach')}
        />
      )}
      {isModalOpen.update && (
        <UpdateAssets
          assets={[asset.id]}
          open={isModalOpen.update}
          onClose={handleCloseModal('update')}
        />
      )}
      {loading && <Loader />}
      {!loading && !assets?.length && (
        <EmptyMessage>{t('emptyMessage')}</EmptyMessage>
      )}
      {state.user.role === 'author' && (
        <StyledFab
          color="secondary"
          aria-label="add"
          onClick={handleOpenModal('create')}
        >
          <AddIcon />
        </StyledFab>
      )}
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => alert('work in progress')}>
          {t('view')}
        </MenuItem>
        {asset?.status !== 'offer_created' &&
          (asset?.author === state.user.orgAccount ||
            asset?.owner === state.user.orgAccount) && (
            <MenuItem onClick={handleOpenModal('update')}>
              {t('update')}
            </MenuItem>
          )}

        {asset?.assets?.info?.count > 0 && (
          <MenuItem onClick={handleOpenModal('detach')}>{t('detach')}</MenuItem>
        )}

        {asset?.status !== 'offer_created' &&
          asset?.owner === state.user.orgAccount && (
            <MenuItem onClick={handleOpenModal('offer')}>
              {t('offerTo')}
            </MenuItem>
          )}
        {asset?.status === 'offer_created' &&
          asset.offered_to === state.user.orgAccount && (
            <MenuItem onClick={handleOpenModal('claim')}>
              {' '}
              {t('claimOffer')}
            </MenuItem>
          )}
        <MenuItem onClick={() => alert('work in progress')}>
          {t('history')}
        </MenuItem>
        <MenuItem onClick={handleOpenModal('create', true)}>
          {t('edit')}
        </MenuItem>
      </Menu>
    </>
  )
}

export default memo(Inventory)
