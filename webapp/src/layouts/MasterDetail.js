import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles, useTheme } from '@material-ui/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import ClearIcon from '@material-ui/icons/Clear'

import InfoBox from '../components/InfoBox'
import Modal from '../components/Modal'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    paddingBottom: theme.spacing(7)
  },
  wrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'scroll'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2),
    alignItems: 'center',
    '& svg': {
      cursor: 'pointer'
    }
  },
  actionButton: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 1
  }
}))

const MasterDetail = ({
  children,
  actionButton,
  onCloseDetailView,
  showDetailView,
  detailViewTitle,
  detailViewContent
}) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const theme = useTheme()
  const isUpMd = useMediaQuery(theme.breakpoints.up('md'), {
    defaultMatches: true
  })

  useEffect(() => {
    setShowModal(showDetailView)
  }, [showDetailView])

  return (
    <Grid container className={classes.root}>
      <Grid item xs={12} md={6} className={classes.wrapper}>
        {children}
      </Grid>
      {isUpMd && (
        <Grid item md={6} className={classes.wrapper}>
          {showDetailView && (
            <Box p={3}>
              <Box className={classes.header}>
                <Typography variant="h4">{detailViewTitle}</Typography>
                <ClearIcon onClick={onCloseDetailView} />
              </Box>
              {detailViewContent}
            </Box>
          )}
          {!showDetailView && <InfoBox text={t('pickAnItem')} />}
        </Grid>
      )}
      {!isUpMd && (
        <Modal
          open={showModal}
          onClose={onCloseDetailView}
          title={detailViewTitle}
          className={classes.secondaryView}
          useSecondaryHeader
          useMaxSize
        >
          {detailViewContent}
        </Modal>
      )}
      <Box className={classes.actionButton}>{actionButton}</Box>
    </Grid>
  )
}

MasterDetail.propTypes = {
  children: PropTypes.node,
  actionButton: PropTypes.node,
  onCloseDetailView: PropTypes.func,
  showDetailView: PropTypes.bool,
  detailViewTitle: PropTypes.string,
  detailViewContent: PropTypes.node
}

export default memo(MasterDetail)
