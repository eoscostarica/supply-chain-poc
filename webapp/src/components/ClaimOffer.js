import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { useMutation } from '@apollo/react-hooks'

import { CLAIM_OFFER_MUTATION } from '../gql'
import { mainConfig } from '../config'
import { useSharedState } from '../context/state.context'

import Modal from './Modal'

const useStyles = makeStyles(theme => ({
  wrapper: {
    paddingTop: 16,
    display: 'flex',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%'
  },
  title: {
    fontSize: 20,
    lineHeight: '23px',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.15px',
    color: '#000000',
    marginBottom: '1rem'
  }
}))

const ClaimOffer = ({ onClose, assets, title, ...props }) => {
  const { t } = useTranslation('claimForm')
  const classes = useStyles()
  const [, setState] = useSharedState()
  const [claimOffer, { loading }] = useMutation(CLAIM_OFFER_MUTATION)

  const handleOnSave = async () => {
    try {
      const { data } = await claimOffer({
        variables: {
          assets
        }
      })
      setState({
        message: {
          content: (
            <a
              href={mainConfig.blockExplorer.replace(
                '{transaction}',
                data.claim.trxid
              )}
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
    <Modal {...props} onClose={onClose} title={`${t('title')} ${title}`}>
      <Typography className={classes.title}>{t('subtitle')}</Typography>
      <Box className={classes.wrapper}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOnSave}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress color="secondary" size={20} />
          ) : (
            t('confirm')
          )}
        </Button>
        <Button variant="outlined" onClick={onClose}>
          {t('cancel')}
        </Button>
      </Box>
    </Modal>
  )
}

ClaimOffer.propTypes = {
  onClose: PropTypes.func,
  assets: PropTypes.array,
  title: PropTypes.string
}

export default memo(ClaimOffer)
