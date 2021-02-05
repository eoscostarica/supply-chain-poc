import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/styles'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { CREATE_GS1_ASSETS_MUTATION, MANUFACTURERS_QUERY } from '../gql'
import { useSharedState } from '../context/state.context'
import { mainConfig } from '../config'
import { getLastChars } from '../utils'

import Modal from './Modal'
import ComboBox from './ComboBox'

const useStyles = makeStyles(theme => ({
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    '& h6': {
      padding: theme.spacing(3, 0)
    }
  },
  row: {
    paddingBottom: theme.spacing(2),
    width: '100%',
    '& .MuiFormControl-root': {
      width: '100%'
    }
  },
  rowWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    '& .MuiBox-root': {
      width: '48%',
      '& .MuiFormControl-root': {
        width: '100%'
      }
    }
  },
  wrapper: {
    paddingTop: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
}))

const CreateGS1AssetsForm = ({ onCreated, onClose, ...props }) => {
  const classes = useStyles()
  const { t } = useTranslation('CreateGS1AssetsForm')
  const [, setState] = useSharedState()
  const [payload, setPayload] = useState({ exp: new Date() })
  const [createAssets, { loading }] = useMutation(CREATE_GS1_ASSETS_MUTATION)
  const [loadManufacturer, { data: { manufacturers } = {} }] = useLazyQuery(
    MANUFACTURERS_QUERY
  )

  const handleOnChange = (field, value) => {
    setPayload(prev => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleOnSave = async () => {
    try {
      console.log({
        ...payload,
        manufacturer: payload.manufacturer?.id,
        product: payload.product?.id
      })
      const { data } = await createAssets({
        variables: {
          ...payload,
          manufacturer: payload.manufacturer?.id,
          product: payload.product?.id
        }
      })

      setState({
        message: {
          content: (
            <a
              href={mainConfig.blockExplorer.replace(
                '{transaction}',
                data.asset.trxid
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {getLastChars(data.asset.trxid)}
            </a>
          ),
          type: 'success'
        }
      })
      onClose({ id: data.asset.id })
    } catch (error) {
      console.log('error', error)
      setState({
        message: {
          content: error.message,
          type: 'error'
        }
      })
    }
  }

  useEffect(() => {
    loadManufacturer()
  }, [loadManufacturer, payload])

  return (
    <Modal {...props} onClose={onClose} title={t('title')}>
      <form className={classes.form} noValidate autoComplete="off">
        <Box className={classes.row}>
          <ComboBox
            id="manufacturer"
            label={t('manufacturer')}
            variant="filled"
            value={payload?.manufacturer || ''}
            onChange={(event, value) => handleOnChange('manufacturer', value)}
            options={manufacturers || []}
            optionLabel="name"
          />
        </Box>
        <Box className={classes.row}>
          <ComboBox
            id="product"
            label={t('product')}
            variant="filled"
            value={payload?.product || ''}
            onChange={(event, value) => handleOnChange('product', value)}
            options={payload?.manufacturer?.products || []}
            optionLabel="name"
          />
        </Box>
        <Box className={classes.row}>
          <ComboBox
            id="doses"
            label={t('doses')}
            variant="filled"
            value={payload?.doses || ''}
            onChange={(event, value) => handleOnChange('doses', value)}
            options={payload?.product?.types || []}
          />
        </Box>
        <Box className={classes.rowWrapper}>
          <Box className={classes.row}>
            <TextField
              id="order"
              label={t('order')}
              variant="filled"
              value={payload?.order || ''}
              onChange={event => handleOnChange('order', event.target.value)}
            />
          </Box>
          <Box className={classes.row}>
            <TextField
              id="lot"
              label={t('lot')}
              variant="filled"
              value={payload?.lot || ''}
              onChange={event => handleOnChange('lot', event.target.value)}
            />
          </Box>
        </Box>
        <Box className={classes.row}>
          <KeyboardDatePicker
            id="exp"
            label={t('exp')}
            variant="inline"
            value={payload?.exp || new Date()}
            onChange={value => handleOnChange('exp', value)}
            format="MM/dd/yyyy"
            inputVariant="filled"
            KeyboardButtonProps={{
              'aria-label': 'change date'
            }}
            disableToolbar
          />
        </Box>
        <Box className={classes.rowWrapper}>
          <Box className={classes.row}>
            <TextField
              id="cases"
              label={t('cases')}
              type="number"
              variant="filled"
              value={payload?.cases || ''}
              onChange={event => handleOnChange('cases', event.target.value)}
            />
          </Box>
          <Box className={classes.row}>
            <TextField
              id="vaccines"
              label={t('vaccines')}
              type="number"
              variant="filled"
              value={payload?.vaccines || ''}
              onChange={event => handleOnChange('vaccines', event.target.value)}
            />
          </Box>
        </Box>
        <Box p={2} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOnSave}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress color="secondary" size={20} />
            ) : (
              t('add')
            )}
          </Button>
        </Box>
      </form>
    </Modal>
  )
}

CreateGS1AssetsForm.propTypes = {
  onCreated: PropTypes.func,
  onClose: PropTypes.func
}

export default memo(CreateGS1AssetsForm)
