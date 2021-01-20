import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

import ArrayTextField from './ArrayTextField'

const useStyles = makeStyles(theme => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%'
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: theme.spacing(2)
  },
  field: {
    width: '100%'
  }
}))

const ProductForm = ({ data, onSubmit, loading }) => {
  const classes = useStyles()
  const [product, setProduct] = useState()
  const { t } = useTranslation('ProductForm')

  const handleOnChange = field => event => {
    const value = event?.target?.value

    switch (field) {
      case 'types':
        setProduct(prev => ({ ...prev, [field]: event }))
        break
      default:
        setProduct(prev => ({ ...prev, [field]: value }))
        break
    }
  }

  const handleOnSubmit = () => {
    onSubmit(product)
  }

  useEffect(() => {
    setProduct(data)
  }, [data])

  return (
    <form className={classes.form} noValidate autoComplete="off">
      <Box>
        <Box className={classes.row}>
          <TextField
            id="name"
            label={t('name')}
            variant="filled"
            value={product?.name || ''}
            onChange={handleOnChange('name')}
            className={classes.field}
          />
        </Box>
        <Box className={classes.row}>
          <ArrayTextField
            id="type"
            label={t('type')}
            variant="filled"
            value={product?.types || []}
            onChange={handleOnChange('types')}
            className={classes.field}
          />
        </Box>
      </Box>
      <Box className={classes.row}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleOnSubmit}
          disabled={loading}
        >
          {loading && <CircularProgress color="secondary" size={20} />}
          {!loading && t('confirm')}
        </Button>
      </Box>
    </form>
  )
}

ProductForm.propTypes = {
  data: PropTypes.object,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool
}

export default memo(ProductForm)
