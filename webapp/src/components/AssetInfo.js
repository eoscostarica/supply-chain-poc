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
import { useSubscription } from '@apollo/react-hooks'

import { ASSET_BY_ID } from '../gql'
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
    borderBottom: '1px solid #000000',
    width: '100%',
    marginBottom: theme.spacing(4)
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
    asset: 1,
    flexGrow: 0,
    margin: '18px 0px'
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
  availableAction: {
    width: '100%'
  }
}))

const AssetHeader = ({ headerDataInfo, classes, t }) => (
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
    {headerDataInfo.asset && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('asset')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.asset}
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
    {headerDataInfo.pallet && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('pallet')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.pallet}
        </Typography>
      </Box>
    )}
    {headerDataInfo.case && (
      <Box className={classes.row}>
        <Typography className={classes.masterLabel}>{t('case')}</Typography>
        <Typography className={classes.masterText}>
          {headerDataInfo.case}
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

const AssetInfo = ({
  asset = {},
  user = {},
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
  const {
    data: { asset: vaccineInfo } = {},
    loading
  } = useSubscription(ASSET_BY_ID, { variables: { id: asset.id } })

  useEffect(() => {
    setAssetInfo(getAssetInfo(vaccineInfo))
  }, [asset, vaccineInfo])

  return (
    <Box>
      {loading && <Loader />}
      {!loading && !!assetInfo && (
        <>
          <AssetHeader headerDataInfo={assetInfo} classes={classes} t={t} />
          <AccordionTreeView data={assetInfo?.assets || []} />
          <Typography className={classes.availableActionLabel}>
            {t('actionAvailable')}
          </Typography>
          <Box className={classes.availableAction}>
            {asset?.status === 'created' &&
              asset?.category === 'order' &&
              asset?.owner === user.orgAccount && (
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={onHandleCreateBatch}
                  className={classes.btnStyled}
                >
                  {t('insertBatch')}
                </Button>
              )}

            {asset?.status !== 'offer_created' &&
              (asset?.author === user.orgAccount ||
                (user.role !== 'vaccinator' &&
                  asset?.owner === user.orgAccount)) && (
                <Button
                  size="small"
                  startIcon={<LocationOnIcon />}
                  onClick={onHandleUpdate}
                  className={classes.btnStyled}
                >
                  {t('updateData')}
                </Button>
              )}

            {asset?.assets?.info?.count > 0 &&
              asset?.status !== 'offer_created' &&
              user.role !== 'vaccinator' &&
              asset?.owner === user.orgAccount && (
                <Button
                  size="small"
                  startIcon={<AppsIcon />}
                  onClick={onHandleDetach}
                  className={classes.btnStyled}
                >
                  {t('detachItems')}
                </Button>
              )}

            {asset?.status !== 'offer_created' &&
              asset?.owner === user.orgAccount &&
              user.role !== 'vaccinator' && (
                <Button
                  size="small"
                  startIcon={<ArrowForwardIcon />}
                  onClick={onHandleOffer}
                  className={classes.btnStyled}
                >
                  {t('offer')} {t(asset.category)}
                </Button>
              )}

            {asset?.status === 'offer_created' &&
              user.role !== 'vaccinator' &&
              asset.offered_to === user.orgAccount && (
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
      )}
    </Box>
  )
}

AssetHeader.propTypes = {
  headerDataInfo: PropTypes.object,
  classes: PropTypes.any,
  t: PropTypes.any
}

AssetInfo.propTypes = {
  asset: PropTypes.object,
  user: PropTypes.object,
  onHandleUpdate: PropTypes.func,
  onHandleDetach: PropTypes.func,
  onHandleOffer: PropTypes.func,
  onHandleClaimOffer: PropTypes.func,
  onHandleCreateBatch: PropTypes.func,
  onHandleHistory: PropTypes.func
}

export default memo(AssetInfo)
