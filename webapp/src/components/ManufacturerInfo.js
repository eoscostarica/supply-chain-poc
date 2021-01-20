import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import Button from '@material-ui/core/Button'

import Loader from './Loader'
import { formatDate } from '../utils'

const useStyles = makeStyles(theme => ({
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  list: {
    padding: 0,
    '& li': {
      paddingTop: 0,
      paddingBottom: 0
    }
  },
  btn: {
    letterSpacing: '1px',
    color: 'rgba(0, 0, 0, 0.6)'
  }
}))

const ManufacturerInfo = ({ data, onClickAction, loading }) => {
  const classes = useStyles()
  const { t } = useTranslation('manufacturerInfo')
  const [manufacturer, setManufacturer] = useState()

  const handleOnClick = action => () => {
    onClickAction(action)
  }

  useEffect(() => {
    setManufacturer(data)
  }, [data])

  return (
    <Box>
      {loading && <Loader />}
      {!loading && manufacturer && (
        <>
          <Typography variant="overline">{t('name')}</Typography>
          <Typography variant="body1">{manufacturer.name}</Typography>
          <Typography variant="overline">{t('gln')}</Typography>
          <Typography variant="body1">
            {manufacturer.data?.gln || '22532694'}
          </Typography>
          <Typography variant="overline">{t('updatedAt')}</Typography>
          <Typography variant="body1">
            {formatDate(manufacturer.updated_at)}
          </Typography>
          <Divider className={classes.divider} />

          <Typography variant="h6">{t('products')}</Typography>
          <List className={classes.list} dense>
            {manufacturer.products.map((item, index) => (
              <ListItem key={`product-${index}`}>
                <ListItemText primary={item.name} />
              </ListItem>
            ))}
          </List>

          <Typography variant="h6">{t('actionAvailable')}</Typography>
          <Box display="flex" flexDirection="column" alignItems="start">
            <Button
              startIcon={<EditIcon />}
              className={classes.btn}
              onClick={handleOnClick('edit')}
            >
              {t('edit')}
            </Button>
            <Button
              startIcon={<AddIcon />}
              className={classes.btn}
              onClick={handleOnClick('addProduct')}
            >
              {t('addProduct')}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}

ManufacturerInfo.propTypes = {
  data: PropTypes.object,
  onClickAction: PropTypes.func,
  loading: PropTypes.bool
}

export default memo(ManufacturerInfo)
