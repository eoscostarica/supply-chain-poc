import React from 'react'
// import { makeStyles } from '@material-ui/core/styles'
import styled from 'styled-components'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

const StyledList = styled(List)`
  width: 100%;
`

const StyledListItem = styled(ListItem)`
  display: flex;
  align-items: flex-start;
`

const StyledSecondaryBox = styled(Box)`
  display: flex;
  flex-direction: column;
  margin-top: 6px;
  margin-bottom: 6px;
  height: 100%;
`

const StyledTypography = styled(Typography)`
  color: rgba(0, 0, 0, 0.6);
`

const ListItems = ({ items = [] }) => {
  return (
    <StyledList>
      {items.map(item => (
        <>
          <StyledListItem>
            <ListItemText primary={item.title} secondary={item.summary} />
            <StyledSecondaryBox>
              <StyledTypography variant="body2" color="secondary">
                {item.date}
              </StyledTypography>
            </StyledSecondaryBox>
          </StyledListItem>
          <Divider />
        </>
      ))}
    </StyledList>
  )
}

export default ListItems
