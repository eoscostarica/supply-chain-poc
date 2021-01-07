import React, { memo } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import MuiModal from '@material-ui/core/Modal'
import Paper from '@material-ui/core/Paper'
import Box from '@material-ui/core/Box'
import { Typography } from '@material-ui/core'
import ClearIcon from '@material-ui/icons/Clear'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const useStyles = makeStyles(theme => ({
  body: {
    padding: theme.spacing(2),
    height: '90%',
    overflow: 'scroll',
    display: 'flex',
    flexDirection: 'column'
  },
  secondaryTitle: {
    marginLeft: theme.spacing(1),
    fontSize: 18
  },
  header: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  secondaryHeader: {
    boxShadow: theme.shadows[4],
    borderBottom: `1px solid ${theme.palette.divider}`,
    width: '100%',
    height: 60,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'start',
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2)
  },
  styledModal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  styledPaper: {
    minWidth: 320,
    width: '100%',
    height: '100vh',
    maxHeight: '100%',
    outline: 'none',
    [theme.breakpoints.up('sm')]: {
      height: 'auto',
      width: 'auto'
    }
  },
  maxWithHeight: {
    width: '100%',
    height: '100%'
  }
}))

const Modal = ({
  children,
  onClose,
  title,
  useSecondaryHeader,
  useMaxSize,
  ...props
}) => {
  const classes = useStyles()

  const handleOnClose = () => {
    onClose && onClose()
  }

  return (
    <MuiModal
      className={classes.styledModal}
      onClose={handleOnClose}
      {...props}
    >
      <Paper
        className={clsx(classes.styledPaper, {
          [classes.maxWithHeight]: useMaxSize
        })}
        variant="outlined"
      >
        {useSecondaryHeader ? (
          <Box className={classes.secondaryHeader}>
            <ArrowBackIcon onClick={handleOnClose} />
            <Typography variant="h6" className={classes.secondaryTitle}>
              {title}
            </Typography>
          </Box>
        ) : (
          <Box className={classes.header}>
            {onClose && <ClearIcon onClick={handleOnClose} />}
            {title && <Typography variant="h6">{title}</Typography>}
          </Box>
        )}
        <Box className={classes.body}>{children}</Box>
      </Paper>
    </MuiModal>
  )
}

Modal.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  onClose: PropTypes.func,
  useSecondaryHeader: PropTypes.bool,
  useMaxSize: PropTypes.bool
}

export default memo(Modal)
