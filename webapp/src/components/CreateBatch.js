import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { useMutation } from '@apollo/react-hooks'

import { CREATE_BATCH_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Loader from './Loader'

const Form = styled.form`
  width: 100%;
  ${props => props.theme.breakpoints.up('sm')} {
    max-width: 360px;
  }
  display: flex;
  flex-direction: column;
  h6 {
    padding: ${props => props.theme.spacing(3, 0)};
  }
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  .MuiFormControl-root {
    width: 100%;
  }
`

const CreateBatch = ({ onCreated, order }) => {
  const { t } = useTranslation('batchForm')
  const [, setState] = useSharedState()
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
      onCreated({
        id: data.batch.id,
        ...batch
      })
      setBatch(prev => ({ order: prev.order }))
    } catch (error) {
      console.log('error', error)
    }
  }

  useEffect(() => {
    handleOnChange('order', order)
  }, [order])

  return (
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

      <Button color="primary" onClick={handleOnSave}>
        {t('add')}
      </Button>

      {loading && <Loader />}
    </Form>
  )
}

CreateBatch.propTypes = {
  onCreated: PropTypes.func,
  order: PropTypes.string
}

export default memo(CreateBatch)
