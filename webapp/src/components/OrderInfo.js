import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import AppsIcon from '@material-ui/icons/Apps'
import HistoryIcon from '@material-ui/icons/History'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Typography from '@material-ui/core/Typography'
import { useLazyQuery } from '@apollo/react-hooks'

import {
  ORDER_ASSETS_BY_ID,
  BATCH_ASSETS_BY_ID,
  BOX_ASSETS_BY_ID,
  WRAPPER_ASSETS_BY_ID,
  CONTAINER_ASSETS_BY_ID,
  VACCINE_ASSETS_BY_ID
} from '../gql'
import { getAssetInfo } from '../utils'

import AccordionTreeView from './AccordionTreeView'
import Loader from './Loader'

const useStyles = makeStyles(theme => ({
  row: {
    paddingBottom: theme.spacing(2),
    width: '100%',
    '.MuiFormControl-root': {
      width: '100%'
    }
  },
  styledMasterBox: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: '100%'
  },
  masterLegend: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2)
  },
  masterLabel: {
    fontSize: 10,
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#000000'
  },
  masterText: {
    fontSize: 16,
    lineHeight: '28px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 0.44,
    color: '#000000'
  },
  btnStyled: {
    fontSize: 14,
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFeatureSettings: `'liga' off`,
    color: 'rgba(0, 0, 0, 0.6)',
    flex: 'none',
    order: 1,
    flexGrow: 0,
    margin: '18px 0px'
  },
  availableAction: {
    width: '100%'
  },
  availableActionLabel: {
    fontSize: 20,
    lineHeight: '23px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.15px'
  },
  masterTitle: {
    fontSize: 34,
    lineHeight: '40px',
    display: 'none',
    alignItems: 'flex-end',
    letterSpacing: '0.25px',
    color: '#000000',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      marginBottom: theme.spacing(1)
    }
  }
}))

const OrderMaster = ({ headerDataInfo, classes, t }) => (
  <Box className={classes.styledMasterBox}>
    <Typography className={classes.masterLegend}>
      {t(`${headerDataInfo.category}Legend`, '')}
    </Typography>
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>
        {t('manufacturer')}
      </Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.companyName || '-'}
      </Typography>
    </Box>
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>{t('product')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.productName || '-'}
      </Typography>
    </Box>
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>{t('doseAmount')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.vaccinesAmount || '-'}
      </Typography>
    </Box>
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>{t('doses')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.doses || '-'}
      </Typography>
    </Box>
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>{t('createdAt')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.createdAt || '-'}
      </Typography>
    </Box>
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>{t('updatedAt')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.updatedAt || '-'}
      </Typography>
    </Box>
    {headerDataInfo.order && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('order')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.order}
        </Typography>
      </Box>
    )}
    {headerDataInfo.batch && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('batch')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.batch}
        </Typography>
      </Box>
    )}
    {headerDataInfo.exp && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('exp')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.exp}
        </Typography>
      </Box>
    )}
    {headerDataInfo.box && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('box')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.box}
        </Typography>
      </Box>
    )}
    {headerDataInfo.wrapper && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('wrapper')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.wrapper}
        </Typography>
      </Box>
    )}
    {headerDataInfo.container && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>
          {t('container')}
        </Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.container}
        </Typography>
      </Box>
    )}
    <Box className={classes.row}>
      <Typography className={classes.masterLabel}>{t('key')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.key || '-'}
      </Typography>
    </Box>
    {(headerDataInfo.extraFields || []).map(field => (
      <Box className={classes.row} key={field.label}>
        <Typography className={classes.masterLabel}>
          {t(field.label)}
        </Typography>
        <Typography className={classes.masterText}>
          {field.value || '-'}
        </Typography>
      </Box>
    ))}
  </Box>
)

const OrderInfo = ({
  order = {},
  user = {},
  isEdit,
  onHandleUpdate,
  onHandleDetach,
  onHandleOffer,
  onHandleClaimOffer,
  onHandleCreateBatch,
  onHandleHistory
}) => {
  const { t } = useTranslation('orderForm')
  const classes = useStyles()
  const [assetInfo, setAssetInfo] = useState()
  const [
    getOrderInfo,
    { data: { asset: orderInfo } = {} }
  ] = useLazyQuery(ORDER_ASSETS_BY_ID, { fetchPolicy: 'network-only' })
  const [
    getBatchInfo,
    { data: { asset: batchInfo } = {} }
  ] = useLazyQuery(BATCH_ASSETS_BY_ID, { fetchPolicy: 'network-only' })
  const [
    getBoxInfo,
    { data: { asset: boxInfo } = {} }
  ] = useLazyQuery(BOX_ASSETS_BY_ID, { fetchPolicy: 'network-only' })
  const [
    getWrapperInfo,
    { data: { asset: wrapperInfo } = {} }
  ] = useLazyQuery(WRAPPER_ASSETS_BY_ID, { fetchPolicy: 'network-only' })
  const [
    getContainerInfo,
    { data: { asset: containerInfo } = {} }
  ] = useLazyQuery(CONTAINER_ASSETS_BY_ID, { fetchPolicy: 'network-only' })
  const [
    getVaccineInfo,
    { data: { asset: vaccineInfo } = {} }
  ] = useLazyQuery(VACCINE_ASSETS_BY_ID, { fetchPolicy: 'network-only' })

  useEffect(() => {
    if (!order?.id) {
      return
    }

    const get = {
      vaccine: getVaccineInfo,
      container: getContainerInfo,
      wrapper: getWrapperInfo,
      box: getBoxInfo,
      batch: getBatchInfo,
      order: getOrderInfo
    }

    get[order.category]({ variables: { id: order.id } })
  }, [
    order,
    getOrderInfo,
    getBatchInfo,
    getBoxInfo,
    getWrapperInfo,
    getContainerInfo,
    getVaccineInfo
  ])

  useEffect(() => {
    const info = {
      vaccine: vaccineInfo?.[0],
      container: containerInfo?.[0],
      wrapper: wrapperInfo?.[0],
      box: boxInfo?.[0],
      batch: batchInfo?.[0],
      order: orderInfo?.[0]
    }
    setAssetInfo(getAssetInfo(info[order.category]))
  }, [
    order,
    orderInfo,
    batchInfo,
    boxInfo,
    wrapperInfo,
    containerInfo,
    vaccineInfo
  ])

  return (
    <>
      {!!assetInfo && (
        <>
          <OrderMaster
            headerDataInfo={assetInfo}
            isEdit={isEdit}
            classes={classes}
            t={t}
          />
          <AccordionTreeView
            data={assetInfo?.assets || []}
            isBatch={order?.category === 'order'}
          />
        </>
      )}
      {!assetInfo && <Loader />}
      <Typography className={classes.availableActionLabel}>
        {t('actionAvailable')}
      </Typography>
      <Box className={classes.availableAction}>
        {order?.status === 'created' &&
          order?.category === 'order' &&
          order?.owner === user.orgAccount && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onHandleCreateBatch}
              className={classes.btnStyled}
            >
              {t('insertBatch')}
            </Button>
          )}

        {order?.status !== 'offer_created' &&
          (order?.author === user.orgAccount ||
            (user.role !== 'vaccinator' &&
              order?.owner === user.orgAccount)) && (
            <Button
              size="small"
              startIcon={<LocationOnIcon />}
              onClick={onHandleUpdate}
              className={classes.btnStyled}
            >
              {t('updateData')}
            </Button>
          )}

        {order?.assets?.info?.count > 0 &&
          order?.status !== 'offer_created' &&
          user.role !== 'vaccinator' &&
          order?.owner === user.orgAccount && (
            <Button
              size="small"
              startIcon={<AppsIcon />}
              onClick={onHandleDetach}
              className={classes.btnStyled}
            >
              {t('detachItems')}
            </Button>
          )}

        {order?.status !== 'offer_created' &&
          order?.owner === user.orgAccount &&
          user.role !== 'vaccinator' && (
            <Button
              size="small"
              startIcon={<ArrowForwardIcon />}
              onClick={onHandleOffer}
              className={classes.btnStyled}
            >
              {t('offer')} {t(order.category)}
            </Button>
          )}

        {order?.status === 'offer_created' &&
          user.role !== 'vaccinator' &&
          order.offered_to === user.orgAccount && (
            <Button
              size="small"
              startIcon={<DoneAllIcon />}
              onClick={onHandleClaimOffer}
              className={classes.btnStyled}
            >
              {t('claimOffer')}
            </Button>
          )}

        <Button
          size="small"
          startIcon={<HistoryIcon />}
          onClick={onHandleHistory}
          className={classes.btnStyled}
        >
          {t('history')}
        </Button>
      </Box>
    </>
  )
}

OrderMaster.propTypes = {
  headerDataInfo: PropTypes.object,
  classes: PropTypes.any,
  t: PropTypes.any
}

OrderInfo.propTypes = {
  order: PropTypes.object,
  user: PropTypes.object,
  isEdit: PropTypes.bool,
  onHandleUpdate: PropTypes.func,
  onHandleDetach: PropTypes.func,
  onHandleOffer: PropTypes.func,
  onHandleClaimOffer: PropTypes.func,
  onHandleCreateBatch: PropTypes.func,
  onHandleHistory: PropTypes.func
}

export default memo(OrderInfo)
