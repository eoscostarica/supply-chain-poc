import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { useSubscription } from '@apollo/react-hooks'

import { ASSET_BY_ID } from '../gql'
import { getAssetActions, getAssetFields } from '../utils'

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

const AssetFields = ({ t, classes, fields, category }) => (
  <Box className={classes.styledMasterBox}>
    <Typography className={classes.masterLegend}>
      {t(`${category}Legend`, '')}
    </Typography>
    {(fields || []).map(field => (
      <Box className={classes.row} key={field.name}>
        <Typography className={classes.masterLabel}>{t(field.name)}</Typography>
        <Typography className={classes.masterText}>
          {field.value || '-'}
        </Typography>
      </Box>
    ))}
  </Box>
)
const AssetActions = ({ t, classes, actions, onAction }) => (
  <>
    <Typography className={classes.availableActionLabel}>
      {t('actionAvailable')}
    </Typography>
    <Box className={classes.availableAction}>
      {(actions || []).map((action, index) => (
        <Button
          key={`action-${index}`}
          size="small"
          startIcon={action.icon}
          onClick={() => onAction(action.name)}
          className={classes.btnStyled}
        >
          {t(action.name)}
        </Button>
      ))}
    </Box>
  </>
)

const AssetInfo = ({ user, assetId, onAction }) => {
  const { t } = useTranslation('AssetInfo')
  const classes = useStyles()
  const [fields, setFields] = useState()
  const [actions, setActions] = useState()
  const { data: { asset } = {}, loading } = useSubscription(ASSET_BY_ID, {
    variables: { id: assetId }
  })

  useEffect(() => {
    if (!asset) {
      return
    }

    setActions(getAssetActions(asset, user))
    setFields(getAssetFields(asset))
  }, [asset, user])

  return (
    <Box>
      {loading && <Loader />}
      {!loading && !!asset && (
        <>
          <AssetFields
            t={t}
            classes={classes}
            fields={fields}
            category={asset.category}
          />
          <AccordionTreeView data={asset.assets} />
          <AssetActions
            t={t}
            classes={classes}
            actions={actions}
            onAction={onAction}
          />
        </>
      )}
    </Box>
  )
}

AssetFields.propTypes = {
  t: PropTypes.any,
  classes: PropTypes.any,
  fields: PropTypes.array,
  category: PropTypes.string
}

AssetActions.propTypes = {
  t: PropTypes.any,
  classes: PropTypes.any,
  actions: PropTypes.array,
  onAction: PropTypes.func
}

AssetInfo.propTypes = {
  user: PropTypes.object,
  assetId: PropTypes.string,
  onAction: PropTypes.func
}

export default memo(AssetInfo)
