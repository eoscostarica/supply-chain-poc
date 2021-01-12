import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { useMutation } from '@apollo/react-hooks'

import { UPDATE_ASSETS_MUTATION } from '../gql'
import { mainConfig } from '../config'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import MapEditLocation from './MapEditLocation'

const useStyles = makeStyles(theme => ({
  wrapper: {
    paddingTop: 16,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  form: {
    marginTop: '1rem',
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
  title: {
    fontSize: 20,
    lineHeight: '23px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.15px',
    color: '#000000',
    marginBottom: '1rem'
  },
  locationIcon: {
    color: 'rgba(0, 0, 0, 0.6)'
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

  const formatDate = date => {
    return new Date(date).toLocaleString({
      hour: 'numeric',
      hour12: true
    })
  }

  const handleOnSave = async () => {
    try {
      const { data } = await updateAssets({
        variables: {
          assets,
          data: {
            temperature: payload.temperature
          },
          data2: {
            location: payload.location
          }
        }
      })

      if (data?.temperature) {
        setState({
          message: {
            content: (
              <a
                href={mainConfig.blockExplorer.replace(
                  '{transaction}',
                  data.temperature.trxid
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('successMessage')} {data.temperature.trxid}
              </a>
            ),
            type: 'success'
          }
        })
      }

      if (data?.location) {
        setState({
          message: {
            content: (
              <a
                href={mainConfig.blockExplorer.replace(
                  '{transaction}',
                  data.location.trxid
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('successMessage')} {data.location.trxid}
              </a>
            ),
            type: 'success'
          }
        })
      }

      onClose()
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <Modal {...props} onClose={onClose} title={title || ''}>
      <Box className={classes.wrapper}>
        <Typography className={classes.title}>{t('title')}</Typography>
        <Typography>{t('legend')}</Typography>
        <form noValidate autoComplete="off" className={classes.form}>
          <Box>
            <Typography className={classes.lastUpdateLabel}>
              Seleccione la ubicación
            </Typography>
            <MapEditLocation
              onGeolocationChange={data => handleOnChange('location', data)}
              markerLocation={{ longitude: -84.100789, latitude: 9.934725 }}
              width="100%"
              height={300}
              mb={2}
              mt={1}
            />
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
            <Box className={classes.row}>
              <Typography className={classes.lastUpdateLabel}>
                {t('lastUpdate')}
              </Typography>
              <Typography className={classes.lastUpdateText}>
                {formatDate(lastUpdate)}
              </Typography>
            </Box>
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
