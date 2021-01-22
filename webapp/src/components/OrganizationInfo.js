import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'
import EditIcon from '@material-ui/icons/Edit'
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

const OrganizationInfo = ({ data, onClickAction, loading }) => {
  const classes = useStyles()
  const { t } = useTranslation('organizationInfo')
  const [organization, setOrganization] = useState()

  const handleOnClick = action => () => {
    onClickAction(action)
  }

  useEffect(() => {
    setOrganization(data)
  }, [data])

  return (
    <Box>
      {loading && <Loader />}
      {!loading && organization && (
        <>
          <Typography variant="overline">{t('name')}</Typography>
          <Typography variant="body1">{organization.name}</Typography>
          <Typography variant="overline">{t('gln')}</Typography>
          <Typography variant="body1">
            {organization.data?.gln || '22532694'}
          </Typography>
          <Typography variant="overline">{t('updatedAt')}</Typography>
          <Typography variant="body1">
            {formatDate(organization.updated_at)}
          </Typography>
          <Divider className={classes.divider} />
          <Typography variant="h6">{t('actionAvailable')}</Typography>
          <Box display="flex" flexDirection="column" alignItems="start">
            <Button
              startIcon={<EditIcon />}
              className={classes.btn}
              onClick={handleOnClick('edit')}
            >
              {t('edit')}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}

OrganizationInfo.propTypes = {
  data: PropTypes.object,
  onClickAction: PropTypes.func,
  loading: PropTypes.bool
}

export default memo(OrganizationInfo)
