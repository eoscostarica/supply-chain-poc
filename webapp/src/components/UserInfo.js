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
  btn: {
    letterSpacing: '1px',
    color: 'rgba(0, 0, 0, 0.6)'
  }
}))

const UserInfo = ({ data, onClickAction, loading }) => {
  const classes = useStyles()
  const { t } = useTranslation('userInfo')
  const [user, setUser] = useState()

  const handleOnClick = (type, payload) => () => {
    onClickAction({ type, payload })
  }

  useEffect(() => {
    setUser(data)
  }, [data])

  return (
    <Box>
      {loading && <Loader />}
      {!loading && user && (
        <>
          <Typography variant="overline">{t('name')}</Typography>
          <Typography variant="body1">{user.name}</Typography>
          <Typography variant="overline">{t('email')}</Typography>
          <Typography variant="body1">{user.email}</Typography>
          <Typography variant="overline">{t('username')}</Typography>
          <Typography variant="body1">{user.username}</Typography>
          <Typography variant="overline">{t('role')}</Typography>
          <Typography variant="body1">{t(user.role)}</Typography>
          <Typography variant="overline">{t('checkpoint')}</Typography>
          <Typography variant="body1">{t(user.organization.name)}</Typography>
          <Typography variant="overline">{t('updatedAt')}</Typography>
          <Typography variant="body1">{formatDate(user.updated_at)}</Typography>
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

UserInfo.propTypes = {
  data: PropTypes.object,
  onClickAction: PropTypes.func,
  loading: PropTypes.bool
}

export default memo(UserInfo)
