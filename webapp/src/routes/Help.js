import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'
import HttpIcon from '@material-ui/icons/Http'
import TelegramIcon from '@material-ui/icons/Telegram'
import GitHubIcon from '@material-ui/icons/GitHub'

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(1),
    fontWeight: 400
  },
  boxLinks: {
    display: 'flex',
    marginTop: theme.spacing(3),
    '& a': {
      '&:hover': {
        textDecoration: 'none'
      }
    },
    '& svg': {
      marginRight: theme.spacing(3)
    },
    '& p': {
      marginTop: 0
    }
  }
}))

const Help = () => {
  const classes = useStyles()
  const { t } = useTranslation('helpRoute')

  return (
    <Box>
      <Grid container direction="column">
        <Grid item xs>
          <Grid container direction="column">
            <Typography variant="h3" className={classes.title}>
              {t('title')}
            </Typography>
            <Typography variant="body2" align="justify" paragraph>
              {t('paragraph')}
            </Typography>

            <Box className={classes.boxLinks}>
              <GitHubIcon />
              <Link
                href="https://github.com/eoscostarica"
                target="_blank"
                rel="noreferrer"
              >
                <Typography variant="body1">{t('githubEOSCR')}</Typography>
              </Link>
            </Box>
            <Box className={classes.boxLinks}>
              <TelegramIcon />
              <Link
                href="https://web.telegram.org/#/eoscr"
                target="_blank"
                rel="noreferrer"
              >
                <Typography variant="body1">{t('telegramChannel')}</Typography>
              </Link>
            </Box>
            <Box className={classes.boxLinks}>
              <HttpIcon />
              <Link
                href="https://eoscostarica.io/"
                target="_blank"
                rel="noreferrer"
              >
                <Typography variant="body1">{t('websiteEOSCR')}</Typography>
              </Link>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Help
