import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/styles'
import { useLocation } from 'react-router-dom'
import { useLazyQuery } from '@apollo/react-hooks'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import { useSharedState } from '../context/state.context'
import ExploreIcon from '@material-ui/icons/Explore'

import MasterDetail from '../layouts/MasterDetail'
import Filter from '../components/Filter'
import ListItems from '../components/ListItems'
import Tabs from '../components/Tabs'
import TabPanel from '../components/TabPanel'
import CreateGS1AssetsForm from '../components/CreateGS1AssetsForm'
import AssetInfo from '../components/AssetInfo'
import CreateOffer from '../components/CreateOffer'
import ClaimOffer from '../components/ClaimOffer'
import DetachAssets from '../components/DetachAssets'
import UpdateAssets from '../components/UpdateAssets'
import AssetHistory from '../components/AssetHistory'
import Loader from '../components/Loader'
import InfoBox from '../components/InfoBox'
import Vaccinate from '../components/Vaccinate'
import { ASSETS_BY_STATUS_QUERY } from '../gql'
import { getLastChars } from '../utils'

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
const FILTERS = ['pallet', 'case', 'vaccine']

// TODO: format date
const Inventory = () => {
  const classes = useStyles()
  const { t } = useTranslation('inventory')
  const location = useLocation()
  const [state] = useSharedState()
  const [
    getAssets,
    { loading, data: { assets } = {} }
  ] = useLazyQuery(ASSETS_BY_STATUS_QUERY, { fetchPolicy: 'network-only' })
  const [tab, setTab] = useState(0)
  const [items, setItems] = useState([])
  const [currentModal, setCurrentModal] = useState()
  const [selected, setSelected] = useState()
  const [asset, setAsset] = useState()
  const [filter, setFilter] = useState([])

  const handleTabChange = (event, newValue) => {
    setTab(newValue)
  }

  const handleChangeFilter = data => {
    setFilter(data)
  }

  const handleOpenModal = name => {
    setCurrentModal(name)
  }

  const handleCloseModal = name => data => {
    setCurrentModal(null)
    getAssets({
      variables: { status: statusMap[tab] }
    })
    data?.id && setSelected(data.id)

    if (name === 'detach') {
      setSelected(null)
      setAsset(null)
    }
  }

  const handleOnClick = item => {
    setAsset(item.asset)
    setSelected(item.id)
  }

  const renderModal = () => {
    // TODO: refactor components to handle business logic from inventory
    switch (currentModal) {
      case 'create':
        return <CreateGS1AssetsForm open onClose={handleCloseModal('create')} />

      case 'vaccinate':
        return <Vaccinate open onClose={handleCloseModal('vaccinate')} />

      case 'claim':
        return (
          <ClaimOffer
            open
            assets={[asset.id]}
            onClose={handleCloseModal('claim')}
            title={`${t(asset?.category)} - #${getLastChars(asset?.key)}`}
          />
        )

      case 'detach':
        return (
          <DetachAssets
            open
            asset={asset.id}
            onClose={handleCloseModal('detach')}
          />
        )

      case 'offer':
        return (
          <CreateOffer
            open
            asset={asset.id}
            onClose={handleCloseModal('offer')}
            title={`${t(asset?.category)} #${getLastChars(asset?.key)}`}
          />
        )

      case 'update':
        return (
          <UpdateAssets
            open
            asset={asset}
            onClose={handleCloseModal('update')}
            title={`${t(asset?.category)} #${getLastChars(asset?.key)}`}
            lastUpdate={asset?.updated_at}
          />
        )

      case 'history':
        return (
          <AssetHistory
            open
            asset={asset}
            onClose={handleCloseModal('history')}
          />
        )

      default:
        return <></>
    }
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
    }

    setItems(
      (assetsResult || []).map(asset => {
        const { key, category } = asset
        const title = `${t(category)} #${getLastChars(key)}`

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
      label: t('active')
    },
    {
      label: t('delivered')
    }
  ]

  return (
    <MasterDetail
      onCloseDetailView={() => {
        setSelected(null)
        setAsset(null)
      }}
      showDetailView={!!asset?.id}
      detailViewTitle={`${t(asset?.category)} #${getLastChars(asset?.key)}`}
      detailViewContent={
        <AssetInfo
          assetId={asset?.id}
          user={state.user || {}}
          onAction={setCurrentModal}
        />
      }
      actionButton={
        <>
          {state.user.role === 'author' && (
            <Fab
              className={classes.styledFab}
              color="secondary"
              aria-label="add"
              onClick={() => handleOpenModal('create')}
            >
              <AddIcon />
            </Fab>
          )}
          {state.user.role === 'vaccinator' && (
            <Fab
              className={classes.styledFab}
              color="secondary"
              aria-label="add"
              onClick={() => handleOpenModal('vaccinate')}
            >
              <ExploreIcon />
            </Fab>
          )}
        </>
      }
    >
      <Tabs
        className={classes.styledTabs}
        value={tab}
        onChange={handleTabChange}
        options={tabs}
      >
        <Filter
          options={FILTERS}
          onClick={handleChangeFilter}
          filtersSelected={filter?.length}
        />
        {loading && <Loader />}
        {!loading && !assets?.length && <InfoBox text={t('emptyMessage')} />}
        <TabPanel current={tab} index={0}>
          <ListItems
            items={items}
            handleOnClick={handleOnClick}
            selected={selected}
          />
        </TabPanel>
        <TabPanel current={tab} index={1}>
          <ListItems items={items} handleOnClick={() => {}} />
        </TabPanel>
      </Tabs>
      {currentModal && renderModal()}
    </MasterDetail>
  )
}

export default memo(Inventory)
