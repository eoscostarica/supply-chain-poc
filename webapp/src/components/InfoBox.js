import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import InfoIcon from '@material-ui/icons/Info'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: 'inherit',
    '& svg': {
      width: 64,
      height: 64,
      color: 'rgba(0, 0, 0, 0.24)',
      marginBottom: 8
    },
    '& .MuiTypography-root': {
      fontSize: 24,
      lineHeight: '28px',
      color: 'rgba(0, 0, 0, 0.38)'
    }
  }
}))

const InfoBox = ({ text, icon }) => {
  const classes = useStyles()

  return (
    <Box className={classes.root}>
      {icon ? icon : <InfoIcon />}
      <Typography align="center">{text}</Typography>
    </Box>
  )
}

InfoBox.propTypes = {
  text: PropTypes.string,
  icon: PropTypes.node
}

export default memo(InfoBox)
