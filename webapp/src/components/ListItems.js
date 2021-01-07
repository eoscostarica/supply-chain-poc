import React, { memo } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Typography from '@material-ui/core/Typography'
import { ListItemSecondaryAction } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  styledList: {
    width: '100%'
  },
  styledListItem: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up('md')]: {
      '&:hover': {
        backgroundColor: '#4DD5EA40',
        cursor: 'pointer'
      }
    }
  },
  styledTypography: {
    color: `${theme.palette.text.secondary}`
  },
  styledTitle: {
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  rowSeleted: {
    backgroundColor: '#4DD5EA40'
  },
  mobileMenu: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  }
}))

const ListItems = ({ items = [], handleOnClick, selected }) => {
  const classes = useStyles()

  return (
    <List className={classes.styledList}>
      {items.map((item, index) => (
        <ListItem
          className={clsx(classes.styledListItem, {
            [classes.rowSeleted]: item.id === selected
          })}
          key={`list-item-${index}`}
          onClick={() => handleOnClick(item)}
        >
          <ListItemText
            primary={
              <Typography className={classes.styledTitle}>
                {item.title}
              </Typography>
            }
            secondary={item.summary}
          />
          <ListItemSecondaryAction className={classes.mobileMenu}>
            <Typography className={classes.styledTypography} variant="body2">
              {item.caption}
            </Typography>
            {item.action}
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  )
}

ListItems.propTypes = {
  items: PropTypes.array,
  handleOnClick: PropTypes.func,
  selected: PropTypes.string
}

export default memo(ListItems)
