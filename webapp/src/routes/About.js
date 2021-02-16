import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/styles'
import { useTranslation } from 'react-i18next'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(1),
    fontWeight: 400
  },
  openDataLabel: {
    margin: theme.spacing(2)
  }
}))

const About = () => {
  const classes = useStyles()
  const { t } = useTranslation('about')

  return (
    <Box margin={1}>
      <Grid container direction="column">
        <Grid item xs>
          <Grid container direction="column">
            <Typography variant="h4">{t('title1')}</Typography>
            <Typography className={classes.openDataLabel}>
              {t('content1')}
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs>
          <Grid container direction="column">
            <Typography variant="h4">{t('title2')}</Typography>
            <Typography className={classes.openDataLabel}>
              {t('content2')}
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs>
          <Grid container direction="column">
            <Typography variant="h4">{t('title3')}</Typography>
            <Typography className={classes.openDataLabel}>
              {t('content3')}
            </Typography>
          </Grid>
        </Grid>

        <Grid item xs>
          <Grid container direction="column">
            <Typography variant="h4">{t('title4')}</Typography>
            <Typography className={classes.openDataLabel}>
              {t('content4')}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  )
}

export default About
