import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { CREATE_OFFER_MUTATION, ORGANIZATION_QUERY } from '../gql'
import { mainConfig } from '../config'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import ComboBox from './ComboBox'

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
    flexDirection: 'column',
    '& .MuiFormLabel-root.Mui-focused': {
      color: '#000000'
    }
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

const CreateOffer = ({ onClose, asset, title, ...props }) => {
  const { t } = useTranslation('offerForm')
  const classes = useStyles()
  const [, setState] = useSharedState()
  const [offer, setOffer] = useState()
  const [loadOrganizations, { data: { organizations } = {} }] = useLazyQuery(
    ORGANIZATION_QUERY
  )
  const [createOffer, { loading }] = useMutation(CREATE_OFFER_MUTATION)

  const handleOnChange = (field, value) => {
    setOffer(prev => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleOnSave = async () => {
    if (!offer?.organization) {
      return
    }

    try {
      const { data } = await createOffer({
        variables: {
          ...offer,
          organization: offer.organization.id,
          assets: [asset]
        }
      })
      setState({
        message: {
          content: (
            <a
              href={mainConfig.blockExplorer.replace(
                '{transaction}',
                data.offer.trxid
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.offer.trxid}
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

  useEffect(() => {
    loadOrganizations()
    setOffer({})
  }, [loadOrganizations])

  return (
    <Modal {...props} onClose={onClose} title={`${t('title')} ${title}`}>
      <Box className={classes.wrapper}>
        <Typography>{t('legend')}</Typography>
        <form noValidate autoComplete="off" className={classes.form}>
          <Box>
            <Box className={classes.row}>
              <ComboBox
                id="organization"
                label={t('organization')}
                variant="filled"
                value={offer?.organization || ''}
                onChange={(event, value) =>
                  handleOnChange('organization', value)
                }
                options={organizations || []}
                optionLabel="name"
              />
            </Box>
            <Box className={classes.row}>
              <TextField
                id="memo"
                multiline
                rows={4}
                label={t('memo')}
                variant="filled"
                value={offer?.memo || ''}
                onChange={event => handleOnChange('memo', event.target.value)}
              />
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

CreateOffer.propTypes = {
  onClose: PropTypes.func,
  asset: PropTypes.string,
  title: PropTypes.string
}

export default memo(CreateOffer)
