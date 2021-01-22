import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import InputAdornment from '@material-ui/core/InputAdornment'
import CropFreeIcon from '@material-ui/icons/CropFree'

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

const OrganizationForm = ({ data, onSubmit, loading }) => {
  const classes = useStyles()
  const [organization, setOrganization] = useState()
  const { t } = useTranslation('organizationForm')

  const handleOnChange = field => event => {
    const value = event.target.value

    if (field.includes('.')) {
      const parts = field.split('.')
      setOrganization(prev => ({
        ...prev,
        [parts[0]]: { ...prev[parts[0]], [parts[1]]: value }
      }))
    } else {
      setOrganization(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleOnSubmit = () => {
    onSubmit(organization)
  }

  useEffect(() => {
    setOrganization(data)
  }, [data])

  return (
    <form className={classes.form} noValidate autoComplete="off">
      <Box>
        <Box className={classes.row}>
          <TextField
            id="name"
            label={t('name')}
            variant="filled"
            value={organization?.name || ''}
            onChange={handleOnChange('name')}
            className={classes.field}
          />
        </Box>
        <Box className={classes.row}>
          <TextField
            id="account"
            label={t('account')}
            variant="filled"
            value={organization?.account || ''}
            onChange={handleOnChange('account')}
            className={classes.field}
          />
        </Box>
        <Box className={classes.row}>
          <TextField
            id="gln"
            label={t('GLN')}
            variant="filled"
            value={organization?.data?.gln || ''}
            onChange={handleOnChange('data.gln')}
            className={classes.field}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <CropFreeIcon />
                </InputAdornment>
              )
            }}
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

OrganizationForm.propTypes = {
  data: PropTypes.object,
  onSubmit: PropTypes.func,
  loading: PropTypes.bool
}

export default memo(OrganizationForm)
