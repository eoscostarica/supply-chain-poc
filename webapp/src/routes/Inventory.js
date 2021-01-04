import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles, useTheme } from '@material-ui/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import Box from '@material-ui/core/Box'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import { useSharedState } from '../context/state.context'
import Grid from '@material-ui/core/Grid'

import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import CreateOrder from '../components/CreateOrder'
import OrderInfo from '../components/OrderInfo'
import CreateOffer from '../components/CreateOffer'
import ClaimOffer from '../components/ClaimOffer'
import DetachAssets from '../components/DetachAssets'
import UpdateAssets from '../components/UpdateAssets'
import Loader from '../components/Loader'
import { ASSETS_BY_STATUS_QUERY } from '../gql'

const useStyles = makeStyles(theme => ({
  styledTabs: {
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  styledFab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1
  },
  emptyMessage: {
    textAlign: 'center',
    padding: theme.spacing(2)
  },
  infoBox: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      padding: theme.spacing(0, 2)
    }
  },
  listItems: {
    height: 'calc(100vh - 110px)',
    overflowX: 'scroll',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      height: 'calc(100vh - 70px)',
      padding: theme.spacing(0, 2)
    }
  },
  wrapper: {
    paddingTop: 32,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  }
}))

const statusMap = {
  0: ['attached'],
  1: 'delivered'
}

// TODO: format date
const Inventory = () => {
  const classes = useStyles()
  const theme = useTheme()
  const { t } = useTranslation('inventory')
  const location = useLocation()
  const matches = useMediaQuery(theme.breakpoints.up('md'))
  const [state] = useSharedState()
  const [
    getAssets,
    { loading, data: { assets } = {} }
  ] = useLazyQuery(ASSETS_BY_STATUS_QUERY, { fetchPolicy: 'network-only' })
  const [tab, setTab] = useState(0)
  const [items, setItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState({})
  const [anchorEl, setAnchorEl] = useState(null)
  const [selected, setSelected] = useState()
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

  const handleOnClick = item => {
    if (!matches) return

    setAsset(item.asset)
    setSelected(item.selected)
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
          asset,
          category,
          title,
          selected: lastSixNumber,
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
      content: (
        <Box display="flex">
          <Grid className={classes.listItems} item sm={12} md={6}>
            <ListItems
              items={items}
              handleOnClick={handleOnClick}
              selected={selected}
            />
          </Grid>
          <Grid item md={6} className={classes.infoBox}>
            <Box className={classes.wrapper}>
              {!!asset?.id && (
                <OrderInfo
                  order={asset}
                  isEdit
                  onHandleUpdate={handleOpenModal('update')}
                  onHandleDetach={handleOpenModal('detach')}
                  onHandleOffer={handleOpenModal('offer')}
                />
              )}
            </Box>
          </Grid>
        </Box>
      )
    },
    {
      label: t('delivered'),
      content: <ListItems items={items} />
    }
  ]

  return (
    <>
      <Tabs
        className={classes.styledTabs}
        value={tab}
        onChange={handleTabChange}
        items={tabs}
      />
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
        <Typography className={classes.emptyMessage}>
          {t('emptyMessage')}
        </Typography>
      )}
      {state.user.role === 'author' && (
        <Fab
          className={classes.styledFab}
          color="secondary"
          aria-label="add"
          onClick={handleOpenModal('create')}
        >
          <AddIcon />
        </Fab>
      )}
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={!!anchorEl}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleOpenModal('create', true)}>
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
              {t('claimOffer')}
            </MenuItem>
          )}
        <MenuItem onClick={() => alert('work in progress')}>
          {t('history')}
        </MenuItem>
      </Menu>
    </>
  )
}

export default memo(Inventory)
