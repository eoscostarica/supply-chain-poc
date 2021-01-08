import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import Button from '@material-ui/core/Button'
import { useMutation } from '@apollo/react-hooks'

import { DETACH_ASSETS_MUTATION } from '../gql'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'

const useStyles = makeStyles(theme => ({
  wrapper: {
    paddingTop: 32,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  }
}))

const CreateOffer = ({ onClose, asset, ...props }) => {
  const { t } = useTranslation('detachForm')
  const classes = useStyles()
  const [, setState] = useSharedState()
  const [detachAssets, { loading }] = useMutation(DETACH_ASSETS_MUTATION)

  const handleOnSave = async () => {
    try {
      const { data } = await detachAssets({
        variables: {
          parent: asset
        }
      })
      setState({
        message: {
          content: (
            <a
              href={`https://jungle3.bloks.io/transaction/${data.detach.trxid}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('successMessage')} {data.detach.trxid}
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
      <Box className={classes.wrapper}>
        <Button variant="contained" color="primary" onClick={handleOnSave}>
          {loading ? (
            <CircularProgress color="secondary" size={20} />
          ) : (
            t('confirm')
          )}
        </Button>
        <Button onClick={onClose}>{t('cancel')}</Button>
      </Box>
    </Modal>
  )
}

CreateOffer.propTypes = {
  onClose: PropTypes.func,
  asset: PropTypes.string
}

export default memo(CreateOffer)
