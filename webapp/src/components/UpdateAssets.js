import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { useMutation } from '@apollo/react-hooks'

import { UPDATE_ASSETS_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import Loader from './Loader'

const Wrapper = styled(Box)`
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Form = styled.form`
  width: 100%;
  ${props => props.theme.breakpoints.up('sm')} {
    max-width: 360px;
  }
  display: flex;
  flex-direction: column;
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  .MuiFormControl-root {
    width: 100%;
  }
`

const UpdateAssets = ({ onClose, assets, ...props }) => {
  const { t } = useTranslation('updateForm')
  const [, setState] = useSharedState()
  const [payload, setPayload] = useState()
  const [updateAssets, { loading }] = useMutation(UPDATE_ASSETS_MUTATION)

  const handleOnChange = (field, value) => {
    setPayload(prev => ({
      ...(prev || {}),
      [field]: value
    }))
  }

  const handleOnSave = type => async () => {
    try {
      const { data } = await updateAssets({
        variables: {
          type,
          assets,
          data: {
            [type]: payload[type]
          }
        }
      })
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.update.trxid}`}
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
    <Modal {...props} onClose={onClose} title={t('title')}>
      <Wrapper>
        <Form noValidate autoComplete="off">
          <Row>
            <TextField
              id="location"
              label={t('location')}
              variant="outlined"
              value={payload?.location || ''}
              onChange={event => handleOnChange('location', event.target.value)}
            />
          </Row>
          <Row>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOnSave('location')}
            >
              {t('confirm')}
            </Button>
          </Row>
          <Row>
            <TextField
              id="temperature"
              label={t('temperature')}
              variant="outlined"
              value={payload?.temperature || ''}
              onChange={event =>
                handleOnChange('temperature', event.target.value)
              }
            />
          </Row>
          <Row>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOnSave('temperature')}
            >
              {t('confirm')}
            </Button>
          </Row>
          {loading && <Loader />}
        </Form>
      </Wrapper>
    </Modal>
  )
}

UpdateAssets.propTypes = {
  onClose: PropTypes.func,
  asset: PropTypes.string
}

export default memo(UpdateAssets)
