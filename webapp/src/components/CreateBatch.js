import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import { KeyboardDatePicker } from '@material-ui/pickers'
import AddIcon from '@material-ui/icons/Add'
import { useMutation } from '@apollo/react-hooks'

import { CREATE_BATCH_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  h6 {
    padding: ${props => props.theme.spacing(3, 0)};
  }
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  width: 100%;

  .MuiFormControl-root {
    width: 100%;
  }
`
const RowWrapper = styled(Box)`
  display: flex;
  justify-content: space-between;
  .MuiBox-root {
    width: 48%;
  }
`

const ButtonWrapper = styled(Box)`
  display: flex;
  justify-content: flex-end;
  .MuiButtonBase-root {
    margin-left: ${props => props.theme.spacing(2)}px;
  }
`

const InsertBatchBtn = styled(Button)`
  font-size: 14px;
  line-height: 16px;
  display: flex;
  align-items: center;
  text-align: center;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-feature-settings: 'liga' off;
  color: rgba(0, 0, 0, 0.6);
  flex: none;
  order: 1;
  flex-grow: 0;
  margin: 12px 0px;
`

const CreateBatchForm = ({
  t,
  batch,
  handleOnChange,
  handleOnSave,
  loading,
  handleShowBatchForm
}) => (
  <Form noValidate autoComplete="off">
    <Typography variant="h6">{t('title')}</Typography>
    <Row>
      <TextField
        id="lot"
        label={t('lot')}
        variant="outlined"
        value={batch?.lot || ''}
        onChange={event => handleOnChange('lot', event.target.value)}
      />
    </Row>
    <Row>
      <KeyboardDatePicker
        id="exp"
        label={t('exp')}
        variant="inline"
        value={batch?.exp || new Date()}
        onChange={value => handleOnChange('exp', value)}
        format="MM/dd/yyyy"
        inputVariant="outlined"
        KeyboardButtonProps={{
          'aria-label': 'change date'
        }}
        disableToolbar
      />
    </Row>
    <RowWrapper>
      <Row>
        <TextField
          id="boxes"
          label={t('boxes')}
          variant="outlined"
          value={batch?.boxes || ''}
          onChange={event => handleOnChange('boxes', event.target.value)}
        />
      </Row>
      <Row>
        <TextField
          id="wrappers"
          label={t('wrappers')}
          variant="outlined"
          value={batch?.wrappers || ''}
          onChange={event => handleOnChange('wrappers', event.target.value)}
        />
      </Row>
    </RowWrapper>
    <RowWrapper>
      <Row>
        <TextField
          id="containers"
          label={t('containers')}
          variant="outlined"
          value={batch?.containers || ''}
          onChange={event => handleOnChange('containers', event.target.value)}
        />
      </Row>
      <Row>
        <TextField
          id="vaccines"
          label={t('vaccines')}
          variant="outlined"
          value={batch?.vaccines || ''}
          onChange={event => handleOnChange('vaccines', event.target.value)}
        />
      </Row>
    </RowWrapper>
    <ButtonWrapper>
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
    </ButtonWrapper>
  </Form>
)

const CreateBatch = ({ onCreated, order }) => {
  const { t } = useTranslation('batchForm')
  const [, setState] = useSharedState()
  const [batch, setBatch] = useState()
  const [showBatchForm, setShowBatchForm] = useState()
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
        />
      ) : (
        <InsertBatchBtn
          size="small"
          startIcon={<AddIcon />}
          onClick={() => handleShowBatchForm()}
        >
          {t('insertBatch')}
        </InsertBatchBtn>
      )}
    </>
  )
}

CreateBatchForm.propTypes = {
  t: PropTypes.any,
  batch: PropTypes.object,
  handleOnChange: PropTypes.func,
  handleOnSave: PropTypes.func,
  loading: PropTypes.bool,
  handleShowBatchForm: PropTypes.func
}

CreateBatch.propTypes = {
  onCreated: PropTypes.func,
  order: PropTypes.string
}

export default memo(CreateBatch)
