import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles, withStyles } from '@material-ui/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import clsx from 'clsx'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Box from '@material-ui/core/Box'

import PieChart from '../components/PieChart'
import ListItems from '../components/ListItems'
import MapEditLocation from '../components/MapEditLocation'

const BATCHES = [
  {
    title: 'Pfizer - Lote #00125225',
    summary: 'Actualizado - 07:12:45 12/03/20',
    caption: 'Lote Expirado'
  },
  {
    title: 'Pfizer - Paquete #00125834',
    summary: 'Actualizado - 07:12:45 12/03/20',
    caption: 'Alta Temperatura'
  },
  {
    title: 'Pfizer - Paquete #00125824',
    summary: 'Actualizado - 07:12:45 12/03/20',
    caption: 'Rechazado'
  },
  {
    title: 'Pfizer - Vial #00125824',
    summary: 'Actualizado - 07:12:45 12/03/20',
    caption: 'Destruído'
  },
  {
    title: 'Pfizer - Vial #00125825',
    summary: 'Actualizado - 07:12:45 12/03/20',
    caption: 'Destruído'
  },
  {
    title: 'Pfizer - Vial #00125826',
    summary: 'Actualizado - 07:12:45 12/03/20',
    caption: 'Destruído'
  }
]

const useStyles = makeStyles(theme => ({
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0'
  },
  lineBottom: {
    borderBottom: '1px solid #E0E0E0'
  },
  tableHeaderLabel: {
    fontSize: 16,
    lineHeight: '24px',
    letterSpacing: '0.15px',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '500'
  },
  wrapper: {
    height: '95%',
    overflow: 'scroll',
    paddingBottom: 100
  },
  mapList: {
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row'
    }
  },
  vaccinationInfo: {
    width: '100%',
    paddingTop: 10,
    [theme.breakpoints.up('md')]: {
      paddingLeft: 10
    }
  },
  rowWidth: {
    width: '40%'
  }
}))

const BorderLinearProgress = withStyles(theme => ({
  root: {
    height: 10,
    borderRadius: 5,
    width: '50%'
  },
  colorPrimary: {
    backgroundColor: '#2bbcdf6b'
  },
  bar: {
    borderRadius: 5,
    backgroundColor: '#167D9E'
  }
}))(LinearProgress)

const AdminHome = () => {
  const { t } = useTranslation('')
  const classes = useStyles()

  return (
    <Box p={2} className={classes.wrapper}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography component="p" variant="h6">
                {t('vaccines')}
              </Typography>
              <PieChart />
              <Box className={clsx(classes.row, classes.lineBottom)}>
                <Typography className={classes.tableHeaderLabel} component="p">
                  {t('vaccines')}
                </Typography>
                <Typography className={classes.tableHeaderLabel} component="p">
                  Total
                </Typography>
              </Box>
              <Box className={clsx(classes.row, classes.lineBottom)}>
                <Box className={classes.row}>
                  <Box
                    width={25}
                    height={25}
                    borderRadius={20}
                    marginRight={1}
                    bgcolor="#147595"
                  />
                  <Typography component="p">{t('applied')}</Typography>
                </Box>
                <Typography component="p">6,000</Typography>
              </Box>
              <Box className={clsx(classes.row, classes.lineBottom)}>
                <Box className={classes.row}>
                  <Box
                    width={25}
                    height={25}
                    borderRadius={20}
                    marginRight={1}
                    bgcolor="#2BBCDF"
                  />
                  <Typography component="p">{t('inProcess')}</Typography>
                </Box>
                <Typography component="p">3,000</Typography>
              </Box>
              <Box className={clsx(classes.row, classes.lineBottom)}>
                <Box className={classes.row}>
                  <Box
                    width={25}
                    height={25}
                    borderRadius={20}
                    marginRight={1}
                    bgcolor="#E0E0E0"
                  />
                  <Typography component="p">{t('destroyed')}</Typography>
                </Box>
                <Typography component="p">1,000</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography component="p" variant="h6">
                {t('alerts')}
              </Typography>
              <ListItems
                items={BATCHES}
                handleOnClick={() => {}}
                selected="none"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Typography component="p" variant="h6">
                {t('map')}
              </Typography>

              <Box className={classes.mapList}>
                <MapEditLocation
                  onGeolocationChange={() => {}}
                  markerLocation={{ longitude: -84.100789, latitude: 9.934725 }}
                  width="100%"
                  height={350}
                  usuControls={false}
                  initialZoom={7}
                />
                <Box className={classes.vaccinationInfo}>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography className={classes.tableHeaderLabel}>
                        {t('vaccines')}
                      </Typography>
                      <Typography className={classes.tableHeaderLabel}>
                        Total
                      </Typography>
                    </Box>
                    <Typography className={classes.tableHeaderLabel}>
                      {`${t('inProcess')} / ${t('applied')}`}
                    </Typography>
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>San José</Typography>
                      <Typography>865</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>Alajuela</Typography>
                      <Typography>654</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>Heredia</Typography>
                      <Typography>220</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>Cartago</Typography>
                      <Typography>108</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>Puntarenas</Typography>
                      <Typography>86</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>Limón</Typography>
                      <Typography>32</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography>Guanacaste</Typography>
                      <Typography>32</Typography>
                    </Box>
                    <BorderLinearProgress variant="determinate" value={50} />
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default memo(AdminHome)
