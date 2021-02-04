import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import MuiTabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

const useStyles = makeStyles(theme => ({
  root: {
    boxShadow: theme.shadows[4]
  }
}))

const Tabs = ({ options, value, onChange, children, ...props }) => {
  const classes = useStyles()

  return (
    <>
      <MuiTabs
        className={classes.root}
        value={value || 0}
        onChange={onChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        {...props}
      >
        {options.map((option, index) => (
          <Tab label={option.label} key={`tab-${index}`} />
        ))}
      </MuiTabs>
      {children}
    </>
  )
}

Tabs.propTypes = {
  children: PropTypes.node,
  options: PropTypes.array,
  value: PropTypes.number,
  onChange: PropTypes.func
}

export default Tabs
