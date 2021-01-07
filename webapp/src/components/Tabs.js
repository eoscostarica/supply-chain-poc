import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import MuiTabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Box from '@material-ui/core/Box'

const TabPanel = ({ children, value, index, ...props }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...props}
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

const StyledTabs = styled(MuiTabs)`
  box-shadow: ${props => props.theme.shadows[4]};
`

const Tabs = ({ items, value, onChange, children, ...props }) => {
  return (
    <>
      <StyledTabs
        value={value || 0}
        onChange={onChange}
        indicatorColor="secondary"
        textColor="inherit"
        variant="fullWidth"
        {...props}
      >
        {items.map((tab, index) => (
          <Tab label={tab.label} key={`tab-${index}`} />
        ))}
      </StyledTabs>

      {children}

      {items.map((tab, index) => (
        <TabPanel value={value} index={index} key={`panel-${index}`}>
          {tab.content}
        </TabPanel>
      ))}
    </>
  )
}

Tabs.propTypes = {
  children: PropTypes.node,
  items: PropTypes.array,
  value: PropTypes.number,
  onChange: PropTypes.func
}

export default Tabs
