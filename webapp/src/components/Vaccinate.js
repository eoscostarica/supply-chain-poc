import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import CropFreeIcon from '@material-ui/icons/CropFree'
import Button from '@material-ui/core/Button'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { PERSON_QUERY, QUERY_BATCH_ASSET, VACCINATION_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'
import Loader from './Loader'

import Modal from './Modal'
import { InputAdornment, Typography } from '@material-ui/core'

const Form = styled.form`
  justify-content: space-between;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  & button {
    max-width: 122px;
  }
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  width: 100%;
  .MuiFormControl-root {
    width: 100%;
  }
`

const Vaccinate = ({ onClose, ...props }) => {
  const { t } = useTranslation('vaccinateForm')
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
              href={`https://jungle3.bloks.io/transaction/${data.vaccination.trxid}`}
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
    <Modal {...props} onClose={onClose} title={t('title')} useMaxSize>
      <Form>
        <Box width="100%">
          <Row>
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
          </Row>
          {batch?.length > 0 && (
            <Row>
              <Typography>
                {batch[0].order.idata.manufacturer.name} -{' '}
                {batch[0].order.idata.product.name}
              </Typography>
              <Typography>{batch[0].idata.lot}</Typography>
              <Typography>{batch[0].idata.exp}</Typography>
            </Row>
          )}
          <Row>
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
          </Row>
          {person?.length > 0 && (
            <Row>
              <Typography>{person[0].dni}</Typography>
              <Typography>{person[0].account}</Typography>
              <Typography>{person[0].name}</Typography>
            </Row>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOnSave}
          disabled={loading}
        >
          {loading && <Loader />}
          {!loading && t('confirm')}
        </Button>
      </Form>
    </Modal>
  )
}

Vaccinate.propTypes = {
  onClose: PropTypes.func
}

export default memo(Vaccinate)
