import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import { useMutation } from '@apollo/react-hooks'

import { CLAIM_OFFER_MUTATION } from '../gql'
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

const ClaimOffer = ({ onClose, assets, ...props }) => {
  const { t } = useTranslation('claimForm')
  const [, setState] = useSharedState()
  const [claimOffer, { loading }] = useMutation(CLAIM_OFFER_MUTATION)

  const handleOnSave = async () => {
    try {
      const { data } = await claimOffer({
        variables: {
          assets
        }
      })
      console.log('data', data)
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.claim.trxid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.claim.trxid}
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
        <Button variant="contained" color="primary" onClick={handleOnSave}>
          {t('confirm')}
        </Button>
        <Button onClick={onClose}>{t('cancel')}</Button>
        {loading && <Loader />}
      </Wrapper>
    </Modal>
  )
}

ClaimOffer.propTypes = {
  onClose: PropTypes.func,
  assets: PropTypes.array
}

export default memo(ClaimOffer)
