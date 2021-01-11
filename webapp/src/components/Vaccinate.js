import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import CircularProgress from '@material-ui/core/CircularProgress'
import CropFreeIcon from '@material-ui/icons/CropFree'
import Button from '@material-ui/core/Button'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { PERSON_QUERY, QUERY_BATCH_ASSET, VACCINATION_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import { InputAdornment, Typography } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  form: {
    justifyContent: 'space-between',
    minHeight: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& button': {
      maxWidth: 122
    }
  },
  row: {
    paddingBottom: theme.spacing(2),
    width: '100%',
    '& .MuiFormControl-root': {
      width: '100%'
    }
  }
}))

const Vaccinate = ({ onClose, ...props }) => {
  const { t } = useTranslation('vaccinateForm')
  const classes = useStyles()
  const [payload, setPayload] = useState()
  const [state, setState] = useSharedState()
  const [loadPerson, { data: { person } = {} }] = useLazyQuery(PERSON_QUERY)
  const [loadBatch, { data: { batch } = {} }] = useLazyQuery(QUERY_BATCH_ASSET)
  const [executeVaccinate, { loading }] = useMutation(VACCINATION_MUTATION)

  const handleOnChange = (field, value) => {
    setPayload(prev => ({
      ...(prev || {}),
      [field]: value
    }))

    if (field === 'person' && value.length > 6) {
      loadPerson({ variables: { dni: value } })
    }

    if (field === 'batch' && value.length > 2) {
      loadBatch({
        variables: { owner: state.user.orgAccount, idata: { lot: value } }
      })
    }
  }

  const handleOnSave = async () => {
    if (!person || !batch) {
      return
    }

    try {
      const { data } = await executeVaccinate({
        variables: {
          ...payload
        }
      })
      setState({
        message: {
          content: (
            <a
              href={`${window.location.origin}/certificate?account=${data.vaccination.account}&asset=${data.vaccination.key}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.vaccination.trxid}
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
    <Modal {...props} onClose={onClose} title={t('title')}>
      <form className={classes.form}>
        <Box width="100%">
          <Box className={classes.row}>
            <TextField
              id="batch"
              label={t('batch')}
              variant="filled"
              value={payload?.batch || ''}
              onChange={event => handleOnChange('batch', event.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CropFreeIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          {batch?.length > 0 && (
            <Box className={classes.row}>
              <Typography>
                {batch[0].order.idata.manufacturer.name} -{' '}
                {batch[0].order.idata.product.name}
              </Typography>
              <Typography>{batch[0].idata.lot}</Typography>
              <Typography>{batch[0].idata.exp}</Typography>
            </Box>
          )}
          <Box className={classes.row}>
            <TextField
              id="person"
              label={t('person')}
              variant="filled"
              value={payload?.person || ''}
              onChange={event => handleOnChange('person', event.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CropFreeIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          {person?.length > 0 && (
            <Box className={classes.row}>
              <Typography>{person[0].dni}</Typography>
              <Typography>{person[0].account}</Typography>
              <Typography>{person[0].name}</Typography>
            </Box>
          )}
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
    </Modal>
  )
}

Vaccinate.propTypes = {
  onClose: PropTypes.func
}

export default memo(Vaccinate)
