import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import { useMutation } from '@apollo/react-hooks'

import { UPDATE_ASSETS_MUTATION } from '../gql'
import { mainConfig } from '../config'
import { useSharedState } from '../context/state.context'
import { formatDate } from '../utils'

import Modal from './Modal'
import MapEditLocation from './MapEditLocation'

const actions = ['temperature', 'location', 'gln', 'sscc']

const useStyles = makeStyles(theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  form: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    [theme.breakpoints.up('sm')]: {
      maxWidth: 360
    },
    display: 'flex',
    flexDirection: 'column'
  },
  row: {
    paddingBottom: theme.spacing(2),
    '& .MuiFormControl-root': {
      width: '100%'
    }
  },
  locationIcon: {
    color: 'rgba(0, 0, 0, 0.6)'
  },
  lastUpdateBox: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  lastUpdateLabel: {
    fontSize: 10,
    lineHeight: '16px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#000000'
  },
  lastUpdateText: {
    fontSize: 16,
    lineHeight: '28px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: 0.44,
    color: '#000000'
  }
}))

const UpdateAssets = ({ onClose, assets, title, lastUpdate, ...props }) => {
  const classes = useStyles()
  const { t } = useTranslation('updateForm')
  const [, setState] = useSharedState()
  const [action, setAction] = useState()
  const [payload, setPayload] = useState()
  const [updateAssets, { loading }] = useMutation(UPDATE_ASSETS_MUTATION)

  const handleOnChange = (field, value) => {
    let fieldValue = value

    if (field === 'location') {
      fieldValue = `${value.latitude},${value.longitude}`
    }

    setPayload(prev => ({
      ...(prev || {}),
      [field]: fieldValue
    }))
  }

  const handleOnSave = async () => {
    try {
      const { data } = await updateAssets({
        variables: {
          assets,
          action,
          payload
        }
      })

      setState({
        message: {
          content: (
            <a
              href={mainConfig.blockExplorer.replace(
                '{transaction}',
                data.update.trxid
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.update.trxid}
            </a>
          ),
          type: 'success'
        }
      })

      onClose()
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <Modal {...props} onClose={onClose} title={title || ''}>
      <Box className={classes.wrapper}>
        <Typography variant="h6">{t('title')}</Typography>
        <Typography>{t('legend')}</Typography>
        <Box className={classes.lastUpdateBox}>
          <Typography className={classes.lastUpdateLabel}>
            {t('lastUpdate')}
          </Typography>
          <Typography className={classes.lastUpdateText}>
            {formatDate(lastUpdate)}
          </Typography>
        </Box>
        <form noValidate autoComplete="off" className={classes.form}>
          <Box>
            <Box className={classes.row}>
              <FormControl variant="filled" className={classes.formControl}>
                <InputLabel id="actionLabel">{t('action')}</InputLabel>
                <Select
                  labelId="actionLabel"
                  id="actionField"
                  value={action || ''}
                  onChange={event => setAction(event.target.value)}
                >
                  {actions.map((option, index) => (
                    <MenuItem key={`option-${index}`} value={option}>
                      {t(option)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {action === 'temperature' && (
              <Box className={classes.row}>
                <TextField
                  id="temperature"
                  label={t('temperature')}
                  variant="filled"
                  value={payload?.temperature || ''}
                  onChange={event =>
                    handleOnChange('temperature', event.target.value)
                  }
                />
              </Box>
            )}
            {action === 'location' && (
              <Box className={classes.row}>
                <MapEditLocation
                  onGeolocationChange={data => handleOnChange('location', data)}
                  markerLocation={{ longitude: -84.100789, latitude: 9.934725 }}
                  width="100%"
                  height={300}
                  mb={2}
                  mt={1}
                />
              </Box>
            )}
            {action === 'gln' && (
              <Box className={classes.row}>
                <TextField
                  id="gln"
                  label={t('gln')}
                  variant="filled"
                  value={payload?.gln || ''}
                  onChange={event => handleOnChange('gln', event.target.value)}
                />
              </Box>
            )}
            {action === 'sscc' && (
              <Box className={classes.row}>
                <TextField
                  id="sscc"
                  label={t('sscc')}
                  variant="filled"
                  value={payload?.sscc || ''}
                  onChange={event => handleOnChange('sscc', event.target.value)}
                />
              </Box>
            )}
            {/* <Typography className={classes.lastUpdateLabel}>
              Seleccione la ubicación
            </Typography>
            
            */}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOnSave}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress color="secondary" size={20} />
            ) : (
              t('confirm')
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  )
}

UpdateAssets.propTypes = {
  onClose: PropTypes.func,
  assets: PropTypes.array,
  title: PropTypes.string,
  lastUpdate: PropTypes.any
}

export default memo(UpdateAssets)
