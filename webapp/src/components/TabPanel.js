import React from 'react'
import PropTypes from 'prop-types'
import Box from '@material-ui/core/Box'

const TabPanel = ({ children, current, index, ...props }) => {
  return (
    <div
      role="tabpanel"
      hidden={current !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...props}
    >
      {current === index && <Box>{children}</Box>}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  current: PropTypes.any.isRequired
}

export default TabPanel
