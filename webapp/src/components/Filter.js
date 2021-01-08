import React, { memo, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/styles'
import Chip from '@material-ui/core/Chip'
import Box from '@material-ui/core/Box'

const useStyles = makeStyles(theme => ({
  filterBox: {
    height: 70,
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.up('md')]: {
      height: 100
    }
  },
  chip: {
    margin: theme.spacing(0, 1),
    minWidth: 50,
    '&:hover': {
      backgroundColor: '#4DD5EA'
    }
  }
}))

const Filter = ({ onClick, options = [], filtersSelected = 0 }) => {
  const { t } = useTranslation('filter')
  const classes = useStyles()
  const [filters, setFilters] = useState()

  const handleOnClick = filter => () => {
    const filtersUpdated = filters.map(({ label, isSelected }) => {
      if (label === filter.label)
        return { ...filter, isSelected: !filter.isSelected }

      return { label, isSelected }
    })

    setFilters(filtersUpdated)
    onClick(
      filtersUpdated.filter(item => item.isSelected).map(item => item.label)
    )
  }

  const handleOnClickAll = () => {
    setFilters(
      options.map(item => ({
        label: item,
        isSelected: false
      }))
    )

    onClick([])
  }

  useEffect(() => {
    setFilters(
      options.map(item => ({
        label: item,
        isSelected: false
      }))
    )
  }, [options])

  return (
    <Box className={classes.filterBox}>
      <Chip
        onClick={handleOnClickAll}
        label={t('all')}
        className={classes.chip}
        color={!filtersSelected ? 'primary' : 'default'}
      />
      {(filters || []).map((item, index) => (
        <Chip
          onClick={handleOnClick(item)}
          key={`${item.label}-${index}`}
          label={t(item.label)}
          className={classes.chip}
          color={item.isSelected ? 'primary' : 'default'}
        />
      ))}
    </Box>
  )
}

Filter.propTypes = {
  onClick: PropTypes.func,
  options: PropTypes.array,
  filtersSelected: PropTypes.number
}

export default memo(Filter)
