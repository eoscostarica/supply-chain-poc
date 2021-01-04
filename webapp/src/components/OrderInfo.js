import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import AppsIcon from '@material-ui/icons/Apps'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import Typography from '@material-ui/core/Typography'
import { useLazyQuery } from '@apollo/react-hooks'

import {
  ASSETS_BY_ORDER_ID,
  BATCH_ASSETS_BY_ID,
  CONTAINER_ASSETS_BY_ID,
  WRAPPER_ASSETS_BY_ID,
  BOX_ASSETS_BY_ID
} from '../gql'
import { getHeaderOrderData, getAssetsDataModeled } from '../utils'

import CreateBatch from './CreateBatch'
import AccordionTreeView from './AccordionTreeView'

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
    fontSize: 16,
    lineHeight: '28px',
    letterSpacing: 0.44,
    color: '#000000',
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
    margin: '12px 0px'
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
  },
  subTitle: {
    fontSize: 24,
    lineHeight: '23px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.15px',
    margin: theme.spacing(2, 0)
  }
}))

const OrderMaster = ({ headerDataInfo, classes, t }) => (
  <Box className={classes.styledMasterBox}>
    <Typography className={classes.masterTitle}>
      {headerDataInfo.title}
    </Typography>
    {headerDataInfo?.subTitle && (
      <Typography className={classes.subTitle}>
        {headerDataInfo.subTitle}
      </Typography>
    )}
    <Typography className={classes.masterLegend}>{t('orderLegend')}</Typography>
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
      <Typography className={classes.masterLabel}>{t('date')}</Typography>
      <Typography className={classes.masterText}>
        {headerDataInfo.dateFormat || '-'}
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
  isEdit,
  onHandleUpdate,
  onHandleDetach,
  onHandleOffer
}) => {
  const { t } = useTranslation('orderForm')
  const classes = useStyles()
  const [showBatchForm, setShowBatchForm] = useState()
  const [orderInfo, setOrderInfo] = useState()
  const [assetInfo, setAssetInfo] = useState([])
  const [loadItemAssets, { data: { asset } = {} }] = useLazyQuery(
    ASSETS_BY_ORDER_ID
  )
  const [getBatchInfo, { data: { asset: batchInfo } = {} }] = useLazyQuery(
    BATCH_ASSETS_BY_ID
  )
  const [getWrapperInfo, { data: { asset: wrapperInfo } = {} }] = useLazyQuery(
    WRAPPER_ASSETS_BY_ID
  )
  const [getBoxInfo, { data: { asset: boxInfo } = {} }] = useLazyQuery(
    BOX_ASSETS_BY_ID
  )
  const [
    getContainerInfo,
    { data: { asset: containerInfo } = {} }
  ] = useLazyQuery(CONTAINER_ASSETS_BY_ID)

  useEffect(() => {
    if (order && order?.id) {
      switch (order.category) {
        case 'container':
          getContainerInfo({
            variables: { id: order.id }
          })
          break

        case 'wrapper':
          getWrapperInfo({
            variables: { id: order.id }
          })
          break

        case 'box':
          getBoxInfo({
            variables: { id: order.id }
          })
          break

        case 'batch':
          getBatchInfo({
            variables: { id: order.id }
          })
          break

        case 'order':
          loadItemAssets({
            variables: { orderId: order.id }
          })
          setOrderInfo(getHeaderOrderData(order, isEdit))

          break

        default:
          break
      }
    }
  }, [
    order,
    isEdit,
    loadItemAssets,
    getBatchInfo,
    getBoxInfo,
    getWrapperInfo,
    getContainerInfo
  ])

  useEffect(() => {
    switch (order.category) {
      case 'container':
        if (containerInfo && containerInfo.length) {
          const [
            {
              key,
              asset: {
                asset: {
                  asset: { asset: containerOrderParent }
                }
              }
            }
          ] = containerInfo
          const containerKey = key.substr(key.length - 6)

          const assetsPerContainer = getAssetsDataModeled(
            order.category,
            containerOrderParent.assets,
            containerInfo
          )
          const objectOrderInfo = getHeaderOrderData(
            containerOrderParent,
            isEdit,
            `${t('container')} #${containerKey}`,
            `${t('order')} #`
          )

          setOrderInfo({
            ...objectOrderInfo,
            extraFields: assetsPerContainer.extraData
          })
          setAssetInfo(assetsPerContainer.assets)
        }
        break

      case 'wrapper':
        if (wrapperInfo && wrapperInfo.length) {
          const [
            {
              key,
              asset: {
                asset: { asset: wrapperOrderParent }
              }
            }
          ] = wrapperInfo
          const wrapperKey = key.substr(key.length - 6)

          const assetsPerWrapper = getAssetsDataModeled(
            order.category,
            wrapperOrderParent.assets,
            wrapperInfo
          )
          const objectOrderInfo = getHeaderOrderData(
            wrapperOrderParent,
            isEdit,
            `${t('wrapper')} #${wrapperKey}`,
            `${t('order')} #`
          )

          setOrderInfo({
            ...objectOrderInfo,
            extraFields: assetsPerWrapper.extraData
          })
          setAssetInfo(assetsPerWrapper.assets)
        }
        break

      case 'box':
        if (boxInfo && boxInfo.length) {
          const [
            {
              key,
              asset: { asset: boxOrderParent }
            }
          ] = boxInfo
          const boxKey = key.substr(key.length - 6)

          const assetsPerBox = getAssetsDataModeled(
            order.category,
            boxOrderParent.assets,
            boxInfo
          )
          const objectOrderInfo = getHeaderOrderData(
            boxOrderParent,
            isEdit,
            `${t('box')} #${boxKey}`,
            `${t('order')} #`
          )

          setOrderInfo({
            ...objectOrderInfo,
            extraFields: assetsPerBox.extraData
          })
          setAssetInfo(assetsPerBox.assets)
        }
        break

      case 'batch':
        if (batchInfo && batchInfo.length) {
          const [
            {
              idata: { lot },
              asset: batchOrderParent
            }
          ] = batchInfo

          setOrderInfo(
            getHeaderOrderData(
              batchOrderParent,
              isEdit,
              `${t('batch')} #${lot}`,
              `${t('order')} #`
            )
          )
          setAssetInfo(batchOrderParent.assets)
        }
        break

      case 'order':
        if (asset) {
          setOrderInfo(getHeaderOrderData(order, isEdit, `${t('order')} #`))

          setAssetInfo(asset[0]?.assets.length ? asset[0].assets : [])
        }
        break

      default:
        break
    }
  }, [asset, batchInfo, boxInfo, containerInfo, wrapperInfo, isEdit, order, t])

  return (
    <>
      {!!orderInfo && (
        <OrderMaster
          headerDataInfo={orderInfo}
          isEdit={isEdit}
          classes={classes}
          t={t}
        />
      )}
      {!!assetInfo && (
        <AccordionTreeView
          data={assetInfo || []}
          isBatch={order?.category === 'order'}
        />
      )}
      <CreateBatch
        order={orderInfo?.id}
        showBatchForm={showBatchForm}
        setShowBatchForm={setShowBatchForm}
      />
      <Typography className={classes.availableActionLabel}>
        {t('actionAvailable')}
      </Typography>
      <Box className={classes.availableAction}>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setShowBatchForm(true)}
          className={classes.btnStyled}
        >
          {t('insertBatch')}
        </Button>
        <Button
          size="small"
          startIcon={<LocationOnIcon />}
          onClick={onHandleUpdate}
          className={classes.btnStyled}
        >
          {t('updateData')}
        </Button>
        <Button
          size="small"
          startIcon={<AppsIcon />}
          onClick={onHandleDetach}
          className={classes.btnStyled}
        >
          {t('detachItems')}
        </Button>
        <Button
          size="small"
          startIcon={<ArrowForwardIcon />}
          onClick={onHandleOffer}
          className={classes.btnStyled}
        >
          {t('offerOrder')}
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
  isEdit: PropTypes.bool,
  onHandleUpdate: PropTypes.func,
  onHandleDetach: PropTypes.func,
  onHandleOffer: PropTypes.func
}

export default memo(OrderInfo)
