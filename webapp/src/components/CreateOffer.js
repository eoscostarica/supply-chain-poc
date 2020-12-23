import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { useLazyQuery, useMutation } from '@apollo/react-hooks'

import { CREATE_OFFER_MUTATION, ORGANIZATION_QUERY } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'
import Loader from './Loader'
import ComboBox from './ComboBox'

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

const CreateOffer = ({ onClose, asset, ...props }) => {
  const { t } = useTranslation('offerForm')
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
          asset
        }
      })
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.offer.trxid}`}
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
    <Modal {...props} onClose={onClose} title={t('title')}>
      <Wrapper>
        <Form noValidate autoComplete="off">
          <Row>
            <ComboBox
              id="organization"
              label={t('organization')}
              variant="outlined"
              value={offer?.organization || ''}
              onChange={(event, value) => handleOnChange('organization', value)}
              options={organizations || []}
              optionLabel="name"
            />
          </Row>
          <Row>
            <TextField
              id="memo"
              label={t('memo')}
              variant="outlined"
              value={offer?.memo || ''}
              onChange={event => handleOnChange('memo', event.target.value)}
            />
          </Row>
          <Button variant="contained" color="primary" onClick={handleOnSave}>
            {t('confirm')}
          </Button>
          {loading && <Loader />}
        </Form>
      </Wrapper>
    </Modal>
  )
}

CreateOffer.propTypes = {
  onClose: PropTypes.func,
  asset: PropTypes.string
}

export default memo(CreateOffer)
