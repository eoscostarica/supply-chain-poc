import React from 'react'
import PropTypes from 'prop-types'
import SwipeableViews from 'react-swipeable-views'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

const FullTabs = ({
  className,
  contentTab1,
  contentTab2,
  laberTab1 = 'tab 1',
  laberTab2 = 'tab 2'
}) => {
  const [value, setValue] = React.useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleChangeIndex = index => {
    setValue(index)
  }

  return (
    <div className={className}>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label={laberTab1} id="full-width-tab-1" />
        <Tab label={laberTab2} id="full-width-tab-2" />
      </Tabs>
      <SwipeableViews axis="x" index={value} onChangeIndex={handleChangeIndex}>
        <TabPanel value={value} index={0} dir="x">
          {contentTab1}
        </TabPanel>
        <TabPanel value={value} index={1} dir="x">
          {contentTab2}
        </TabPanel>
      </SwipeableViews>
    </div>
  )
}

FullTabs.propTypes = {
  className: PropTypes.any,
  contentTab1: PropTypes.any,
  contentTab2: PropTypes.any,
  laberTab1: PropTypes.string,
  laberTab2: PropTypes.string
}

export default FullTabs
