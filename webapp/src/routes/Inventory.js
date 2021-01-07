import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/styles'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { useSharedState } from '../context/state.context'
import Grid from '@material-ui/core/Grid'
import ExploreIcon from '@material-ui/icons/Explore'

import Modal from '../components/Modal'
import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import CreateOrder from '../components/CreateOrder'
import CreateBatch from '../components/CreateBatch'
import OrderInfo from '../components/OrderInfo'
import CreateOffer from '../components/CreateOffer'
import ClaimOffer from '../components/ClaimOffer'
import DetachAssets from '../components/DetachAssets'
import UpdateAssets from '../components/UpdateAssets'
import Loader from '../components/Loader'
import Vaccinate from '../components/Vaccinate'
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
    paddingTop: theme.spacing(4),
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: '100vh',
    overflow: 'scroll',
    paddingBottom: theme.spacing(12)
  },
  secondaryView: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  }
}))

const statusMap = {
  0: ['created', 'offer_created', 'offer_claimed', 'unwrapped'],
  1: ['detached', 'burned', 'discarded']
}

// TODO: format date
const Inventory = () => {
  const classes = useStyles()
  const { t } = useTranslation('inventory')
  const location = useLocation()
  const [state, setState] = useSharedState()
  const [headerTitle, setHeaderTitle] = useState()
  const [
    getAssets,
    { loading, data: { assets } = {} }
  ] = useLazyQuery(ASSETS_BY_STATUS_QUERY, { fetchPolicy: 'network-only' })
  const [tab, setTab] = useState(0)
  const [items, setItems] = useState([])
  const [isModalOpen, setIsModalOpen] = useState({})
  const [selected, setSelected] = useState()
  const [asset, setAsset] = useState()

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleOpenModal = (name, edit = false) => () => {
    if (edit && asset.category !== 'order') return

    setIsModalOpen(prev => ({ ...prev, [name]: true, edit }))
  }

  const handleCloseModal = name => data => {
    setIsModalOpen(prev => ({ ...prev, [name]: false, edit: false }))
    getAssets({
      variables: { status: statusMap[tab] }
    })
    data?.id && setSelected(data.id)
    data?.message &&
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.trxId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data?.message}
            </a>
          ),
          type: 'success'
        }
      })
  }

  const handleOnClick = item => {
    setSelected(item.id)
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

    if (selected) {
      const assetSelected = assets.find(({ id }) => id === selected)
      setAsset(assetSelected)

      if (!assetSelected) {
        return
      }

      const lastSixNumber = assetSelected.key.substr(
        assetSelected.key.length - 6
      )
      setHeaderTitle(`${t(assetSelected.category)} #${lastSixNumber}`)
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
          category,
          title,
          id: asset.id,
          summary: `${t('status')} - ${t(asset.status)}`
        }
      })
    )
  }, [assets, t, selected])

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
                  user={state.user || {}}
                  isEdit
                  onHandleCreateBatch={handleOpenModal('batch')}
                  onHandleUpdate={handleOpenModal('update')}
                  onHandleDetach={handleOpenModal('detach')}
                  onHandleOffer={handleOpenModal('offer')}
                  onHandleClaimOffer={handleOpenModal('claim')}
                />
              )}
            </Box>
          </Grid>
        </Box>
      )
    },
    {
      label: t('delivered'),
      content: <ListItems items={items} handleOnClick={() => {}} />
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
      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={headerTitle}
        className={classes.secondaryView}
        useSecondaryHeader
        useMaxSize
      >
        <OrderInfo
          order={asset}
          user={state.user || {}}
          isEdit
          onHandleUpdate={handleOpenModal('update')}
          onHandleCreateBatch={handleOpenModal('batch')}
          onHandleDetach={handleOpenModal('detach')}
          onHandleOffer={handleOpenModal('offer')}
          onHandleClaimOffer={handleOpenModal('claim')}
        />
      </Modal>
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
      {state.user.role === 'vaccinator' && (
        <Fab
          className={classes.styledFab}
          color="secondary"
          aria-label="add"
          onClick={handleOpenModal('vaccinate')}
        >
          <ExploreIcon />
        </Fab>
      )}
      {isModalOpen.vaccinate && (
        <Vaccinate
          open={isModalOpen.vaccinate}
          onClose={handleCloseModal('vaccinate')}
        />
      )}
      {isModalOpen.create && (
        <CreateOrder
          open={isModalOpen.create}
          onClose={handleCloseModal('create')}
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
      {isModalOpen.offer && (
        <CreateOffer
          asset={asset.id}
          open={isModalOpen.offer}
          onClose={handleCloseModal('offer')}
        />
      )}
      {isModalOpen.update && (
        <UpdateAssets
          assets={[asset.id]}
          open={isModalOpen.update}
          onClose={handleCloseModal('update')}
        />
      )}
      {isModalOpen.batch && (
        <CreateBatch
          asset={asset.id}
          open={isModalOpen.batch}
          onClose={handleCloseModal('batch')}
        />
      )}
    </>
  )
}

export default memo(Inventory)
