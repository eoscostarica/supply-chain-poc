import React, { memo } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import { ListItemSecondaryAction } from '@material-ui/core'

const StyledList = styled(List)`
  width: 100%;
`

const StyledListItem = styled(ListItem)`
  border-bottom: ${props => `1px solid ${props.theme.palette.divider}`};
`

const StyledTypography = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
`

const StyledTitle = styled(Typography)`
  font-weight: 600;
  text-transform: capitalize;
`

const ListItems = ({ items = [] }) => {
  return (
    <StyledList>
      {items.map((item, index) => (
        <StyledListItem key={`list-item-${index}`}>
          <ListItemText
            primary={<StyledTitle>{item.title}</StyledTitle>}
            secondary={item.summary}
          />
          <ListItemSecondaryAction>
            <StyledTypography variant="body2">{item.caption}</StyledTypography>
            {item.action}
          </ListItemSecondaryAction>
        </StyledListItem>
      ))}
    </StyledList>
  )
}

ListItems.propTypes = {
  items: PropTypes.array
}

export default memo(ListItems)
