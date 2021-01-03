import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Hidden from '@material-ui/core/Hidden'
import Box from '@material-ui/core/Box'

import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Footer from '../components/Footer'
import img from '../assets/logoBG.png'

const drawerWidth = 260

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`

const Drawer = styled.div`
  ${props => props.theme.breakpoints.up('md')} {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  overflow: hidden;
  background-image: url(${img});
  background-repeat: no-repeat;
  background-position: right;
  height: 100vh;

  ${props => props.theme.breakpoints.up('md')} {
    background-size: 300px;
  }
`

const ChildContent = styled(Box)`
  flex: 1;
  height: 100%;
`

const Dashboard = ({ children, routes }) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Root>
      <Drawer>
        <Hidden mdUp implementation="js">
          <Sidebar
            PaperProps={{ style: { width: drawerWidth } }}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            routes={routes}
          />
        </Hidden>
        <Hidden smDown implementation="css">
          <Sidebar
            PaperProps={{ style: { width: drawerWidth } }}
            variant="permanent"
            routes={routes}
          />
        </Hidden>
      </Drawer>
      <MainContent>
        <Header onDrawerToggle={handleDrawerToggle} />
        <ChildContent>{children}</ChildContent>
        <Footer />
      </MainContent>
    </Root>
  )
}

Dashboard.propTypes = {
  children: PropTypes.node,
  routes: PropTypes.array
}

export default Dashboard
