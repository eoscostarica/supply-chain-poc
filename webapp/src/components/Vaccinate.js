import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import CropFreeIcon from '@material-ui/icons/CropFree'
import { useLazyQuery } from '@apollo/react-hooks'

import { PERSON_QUERY, QUERY_BATCH_ASSET } from '../gql'

import Modal from './Modal'
import { InputAdornment, Typography } from '@material-ui/core'

const Wrapper = styled(Box)`
  padding-top: 32px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
`

const Form = styled.form`
  justify-content: space-between;
  height: 100%;
  width: 100%;
  ${props => props.theme.breakpoints.up('sm')} {
    max-width: 360px;
  }
  display: flex;
  flex-direction: column;
`

const Row = styled(Box)`
  padding-bottom: ${props => props.theme.spacing(2)}px;
  width: 100%;
  .MuiFormControl-root {
    width: 100%;
  }
`

const Vaccinate = ({ onClose, orderInfo = {}, isEdit, ...props }) => {
  const { t } = useTranslation('vaccinateForm')
  const [payload, setPayload] = useState()
  const [loadPerson, { data: { person } = {} }] = useLazyQuery(PERSON_QUERY)
  const [loadBatch, { data: { batch } = {} }] = useLazyQuery(QUERY_BATCH_ASSET)

  const handleOnChange = (field, value) => {
    setPayload(prev => ({
      ...(prev || {}),
      [field]: value
    }))

    if (field === 'person' && value.length > 6) {
      loadPerson({ variables: { dni: value } })
    }

    if (field === 'batch' && value.length > 2) {
      loadBatch({ variables: { where: { lot: value } } })
    }
  }

  return (
    <Modal {...props} onClose={onClose} title={t('title')} useMaxSize>
      <Wrapper>
        <Form>
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
            <>
              <Typography>
                {batch[0].order.idata.manufacturer.name} -{' '}
                {batch[0].order.idata.product.name}
              </Typography>
              <Typography>{batch[0].idata.lot}</Typography>
              <Typography>{batch[0].idata.exp}</Typography>
            </>
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
            <>
              <Typography>{person[0].dni}</Typography>
              <Typography>{person[0].account}</Typography>
              <Typography>{person[0].name}</Typography>
            </>
          )}
        </Form>
      </Wrapper>
    </Modal>
  )
}

Vaccinate.propTypes = {
  onClose: PropTypes.func,
  orderInfo: PropTypes.object,
  isEdit: PropTypes.bool
}

export default memo(Vaccinate)
