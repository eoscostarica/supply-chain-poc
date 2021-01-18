import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { useMutation } from '@apollo/react-hooks'

import { CREATE_BATCH_MUTATION } from '../gql'

import Modal from './Modal'

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

const CreateBatchForm = ({
  t,
  batch,
  handleOnChange,
  handleOnSave,
  loading,
  classes
}) => (
  <form className={classes.form} noValidate autoComplete="off">
    <Box className={classes.row}>
      <TextField
        id="lot"
        label={t('lot')}
        variant="filled"
        value={batch?.lot || ''}
        onChange={event => handleOnChange('lot', event.target.value)}
      />
    </Box>
    <Box className={classes.row}>
      <KeyboardDatePicker
        id="exp"
        label={t('exp')}
        variant="inline"
        value={batch?.exp || new Date()}
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
      <Box className={classes.box}>
        <TextField
          id="boxes"
          label={t('boxes')}
          type="number"
          variant="filled"
          value={batch?.boxes || ''}
          onChange={event => handleOnChange('boxes', event.target.value)}
        />
      </Box>
      <Box className={classes.row}>
        <TextField
          id="wrappers"
          label={t('wrappers')}
          type="number"
          variant="filled"
          value={batch?.wrappers || ''}
          onChange={event => handleOnChange('wrappers', event.target.value)}
        />
      </Box>
    </Box>
    <Box className={classes.rowWrapper}>
      <Box className={classes.row}>
        <TextField
          id="containers"
          label={t('containers')}
          type="number"
          variant="filled"
          value={batch?.containers || ''}
          onChange={event => handleOnChange('containers', event.target.value)}
        />
      </Box>
      <Box className={classes.box}>
        <TextField
          id="vaccines"
          label={t('vaccines')}
          type="number"
          variant="filled"
          value={batch?.vaccines || ''}
          onChange={event => handleOnChange('vaccines', event.target.value)}
        />
      </Box>
    </Box>
    <Button
      variant="contained"
      color="primary"
      onClick={handleOnSave}
      disabled={loading}
    >
      {loading ? <CircularProgress color="secondary" size={20} /> : t('add')}
    </Button>
  </form>
)

const CreateBatch = ({ onCreated, asset, onClose, ...props }) => {
  const { t } = useTranslation('batchForm')
  const classes = useStyles()
  const [batch, setBatch] = useState()
  const [createBatch, { loading }] = useMutation(CREATE_BATCH_MUTATION)

  const handleOnChange = (field, value) => {
    setBatch(prev => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleOnSave = async () => {
    try {
      const { data } = await createBatch({
        variables: batch
      })

      onClose({
        trxid: data.batch.trxid,
        message: `${t('successMessage')} ${data.batch.trxid}`
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    handleOnChange('order', asset)
    handleOnChange('exp', new Date())
  }, [asset])

  return (
    <Modal {...props} onClose={onClose} title={t('title')}>
      <Box className={classes.wrapper}>
        <CreateBatchForm
          t={t}
          batch={batch}
          handleOnChange={handleOnChange}
          handleOnSave={handleOnSave}
          loading={loading}
          classes={classes}
        />
      </Box>
    </Modal>
  )
}

CreateBatchForm.propTypes = {
  t: PropTypes.any,
  batch: PropTypes.object,
  handleOnChange: PropTypes.func,
  handleOnSave: PropTypes.func,
  loading: PropTypes.bool,
  classes: PropTypes.any
}

CreateBatch.propTypes = {
  onCreated: PropTypes.func,
  onClose: PropTypes.func,
  asset: PropTypes.string
}

export default memo(CreateBatch)
