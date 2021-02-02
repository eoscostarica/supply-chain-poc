import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/styles'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import InfoIcon from '@material-ui/icons/Info'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import { useSharedState } from '../context/state.context'
import Grid from '@material-ui/core/Grid'
import ExploreIcon from '@material-ui/icons/Explore'

import Filter from '../components/Filter'
import Modal from '../components/Modal'
import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import CreateOrder from '../components/CreateOrder'
import CreateGS1AssetsForm from '../components/CreateGS1AssetsForm'
import AssetInfo from '../components/AssetInfo'
import CreateOffer from '../components/CreateOffer'
import ClaimOffer from '../components/ClaimOffer'
import DetachAssets from '../components/DetachAssets'
import UpdateAssets from '../components/UpdateAssets'
import AssetHistory from '../components/AssetHistory'
import Loader from '../components/Loader'
import Vaccinate from '../components/Vaccinate'
import { mainConfig } from '../config'
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
      padding: theme.spacing(0, 2),
      width: '100%',
      height: 'calc(100vh - 70px)',
      overflowX: 'scroll'
    }
  },
  listItems: {
    height: 'calc(100vh - 185px)',
    overflowX: 'scroll',
    width: '100%',
    [theme.breakpoints.up('md')]: {
      height: 'calc(100vh - 170px)',
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
  },
  noItemSelected: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'inherit',
    '& svg': {
      width: 64,
      height: 64,
      color: 'rgba(0, 0, 0, 0.24)',
      marginBottom: 8
    },
    '& .MuiTypography-root': {
      fontSize: 24,
      lineHeight: '28px',
      color: 'rgba(0, 0, 0, 0.38)'
    }
  }
}))

const statusMap = {
  0: ['created', 'offer_created', 'offer_claimed', 'unwrapped'],
  1: ['detached', 'burned', 'discarded']
}
const FILTERS = ['order', 'batch', 'wrapper', 'vaccine', 'box', 'container']

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
  const [filter, setFilter] = useState([])

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleOpenModal = (name, edit = false) => () => {
    if (edit && asset.category !== 'order') return

    setIsModalOpen(prev => ({ ...prev, [name]: true, edit }))
  }

  const handleChangeFilter = data => {
    setFilter(data)
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
              href={mainConfig.blockExplorer.replace(
                '{transaction}',
                data.trxid
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data?.message}
            </a>
          ),
          type: 'success'
        }
      })

    if (name === 'detach') {
      setSelected(null)
      setAsset(null)
    }
  }

  const handleOnClick = item => {
    const { idata, key } = item.asset
    const lastSixNumber = key.substr(key.length - 6)
    const displayName =
      item.category === 'order'
        ? `${idata.manufacturer.name} - ${t('order')}`
        : t(item.category)

    setHeaderTitle(`${displayName} #${lastSixNumber}`)
    setAsset(item.asset)
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

    const assetsResult = filter.length
      ? assets.filter(({ category }) => filter.includes(category))
      : assets

    if (selected) {
      const assetSelected = (assets || []).find(({ id }) => id === selected)
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
      (assetsResult || []).map(asset => {
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
          id: asset.id,
          summary: `${t('status')} - ${t(asset.status)}`
        }
      })
    )
  }, [assets, t, selected, filter])

  const tabs = [
    {
      label: t('active'),
      content: (
        <Box display="flex">
          <Grid item sm={12} md={6}>
            <Filter
              options={FILTERS}
              onClick={handleChangeFilter}
              filtersSelected={filter?.length}
            />
            <Box className={classes.listItems}>
              {items.length ? (
                <ListItems
                  items={items}
                  handleOnClick={handleOnClick}
                  selected={selected}
                />
              ) : (
                <Box className={classes.noItemSelected}>
                  <InfoIcon />
                  <Typography align="center">{t('emptyMessage')}</Typography>
                </Box>
              )}
            </Box>
          </Grid>
          <Grid item md={6} className={classes.infoBox}>
            <Box className={classes.wrapper}>
              {asset?.id ? (
                <AssetInfo
                  asset={asset}
                  user={state.user || {}}
                  onHandleCreateBatch={handleOpenModal('batch')}
                  onHandleUpdate={handleOpenModal('update')}
                  onHandleDetach={handleOpenModal('detach')}
                  onHandleOffer={handleOpenModal('offer')}
                  onHandleClaimOffer={handleOpenModal('claim')}
                  onHandleHistory={handleOpenModal('history')}
                />
              ) : items.length ? (
                <Box className={classes.noItemSelected}>
                  <InfoIcon />
                  <Typography align="center">{t('noItemSelected')}</Typography>
                </Box>
              ) : null}
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
        <AssetInfo
          asset={asset}
          user={state.user || {}}
          onHandleUpdate={handleOpenModal('update')}
          onHandleCreateBatch={handleOpenModal('batch')}
          onHandleDetach={handleOpenModal('detach')}
          onHandleOffer={handleOpenModal('offer')}
          onHandleClaimOffer={handleOpenModal('claim')}
          onHandleHistory={handleOpenModal('history')}
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
          title={
            asset &&
            `${t(asset.category)} - #${asset.key.substr(asset.key.length - 6)}`
          }
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
          title={
            asset &&
            `${t(asset.category)} - #${asset.key.substr(asset.key.length - 6)}`
          }
        />
      )}
      {isModalOpen.update && (
        <UpdateAssets
          asset={asset}
          open={isModalOpen.update}
          onClose={handleCloseModal('update')}
          title={
            asset &&
            `${t(asset.category)} - #${asset.key.substr(asset.key.length - 6)}`
          }
          lastUpdate={asset?.updated_at}
        />
      )}
      {isModalOpen.history && (
        <AssetHistory
          asset={asset}
          open={isModalOpen.history}
          onClose={handleCloseModal('history')}
        />
      )}
      {isModalOpen.batch && (
        <CreateGS1AssetsForm
          asset={asset.id}
          open={isModalOpen.batch}
          onClose={handleCloseModal('batch')}
        />
      )}
    </>
  )
}

export default memo(Inventory)
