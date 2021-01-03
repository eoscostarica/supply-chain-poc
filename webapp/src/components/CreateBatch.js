import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { useMutation } from '@apollo/react-hooks'

import { CREATE_BATCH_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

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
  buttonWrapper: {
    display: 'flex',
    justifyContent: 'flex-end',
    '& .MuiButtonBase-root': {
      marginLeft: theme.spacing(2)
    }
  },
  insertBatchBtn: {
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
  }
}))

const CreateBatchForm = ({
  t,
  batch,
  handleOnChange,
  handleOnSave,
  loading,
  handleShowBatchForm,
  classes
}) => (
  <form className={classes.form} noValidate autoComplete="off">
    <Typography variant="h6">{t('title')}</Typography>
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
          variant="filled"
          value={batch?.boxes || ''}
          onChange={event => handleOnChange('boxes', event.target.value)}
        />
      </Box>
      <Box className={classes.row}>
        <TextField
          id="wrappers"
          label={t('wrappers')}
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
          variant="filled"
          value={batch?.containers || ''}
          onChange={event => handleOnChange('containers', event.target.value)}
        />
      </Box>
      <Box className={classes.box}>
        <TextField
          id="vaccines"
          label={t('vaccines')}
          variant="filled"
          value={batch?.vaccines || ''}
          onChange={event => handleOnChange('vaccines', event.target.value)}
        />
      </Box>
    </Box>
    <Box className={classes.buttonWrapper}>
      <Button color="primary" variant="outlined" onClick={handleOnSave}>
        {loading ? <CircularProgress color="secondary" size={20} /> : t('add')}
      </Button>
      <Button
        color="secondary"
        variant="outlined"
        onClick={handleShowBatchForm}
      >
        {t('cancel')}
      </Button>
    </Box>
  </form>
)

const CreateBatch = ({ onCreated, order, showBatchForm, setShowBatchForm }) => {
  const { t } = useTranslation('batchForm')
  const classes = useStyles()
  const [, setState] = useSharedState()
  const [batch, setBatch] = useState()
  const [createBatch, { loading }] = useMutation(CREATE_BATCH_MUTATION)

  const handleOnChange = (field, value) => {
    setBatch(prev => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleShowBatchForm = () => setShowBatchForm(!showBatchForm)

  const handleOnSave = async () => {
    try {
      const { data } = await createBatch({
        variables: batch
      })
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.batch.trxid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.batch.trxid}
            </a>
          ),
          type: 'success'
        }
      })
      setBatch(prev => ({ order: prev.order }))
      setShowBatchForm(false)
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    handleOnChange('order', order)
  }, [order])

  return (
    <>
      {showBatchForm ? (
        <CreateBatchForm
          t={t}
          batch={batch}
          handleOnChange={handleOnChange}
          handleOnSave={handleOnSave}
          loading={loading}
          handleShowBatchForm={handleShowBatchForm}
          classes={classes}
        />
      ) : null}
    </>
  )
}

CreateBatchForm.propTypes = {
  t: PropTypes.any,
  batch: PropTypes.object,
  handleOnChange: PropTypes.func,
  handleOnSave: PropTypes.func,
  loading: PropTypes.bool,
  handleShowBatchForm: PropTypes.func,
  classes: PropTypes.any
}

CreateBatch.propTypes = {
  onCreated: PropTypes.func,
  order: PropTypes.string,
  showBatchForm: PropTypes.bool,
  setShowBatchForm: PropTypes.func
}

export default memo(CreateBatch)
