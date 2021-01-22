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
import { mockData } from '../utils'

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
    fontWeight: '600'
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
              {mockData.distribution.map(distributionItem => (
                <Box
                  className={clsx(classes.row, classes.lineBottom)}
                  key={distributionItem.name}
                >
                  <Box className={classes.row}>
                    <Box
                      width={25}
                      height={25}
                      borderRadius={20}
                      marginRight={1}
                      bgcolor={distributionItem.color}
                    />
                    <Typography component="p">
                      {t(distributionItem.name)}
                    </Typography>
                  </Box>
                  <Typography component="p">
                    {distributionItem.amount}
                  </Typography>
                </Box>
              ))}
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
                items={mockData.batches}
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
                  height={450}
                  usuControls={false}
                  initialZoom={7}
                />
                <Box className={classes.vaccinationInfo}>
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={clsx(classes.row, classes.rowWidth)}>
                      <Typography className={classes.tableHeaderLabel}>
                        {t('regions')}
                      </Typography>
                      <Typography className={classes.tableHeaderLabel}>
                        Total
                      </Typography>
                    </Box>
                    <Typography className={classes.tableHeaderLabel}>
                      {`${t('inProcess')} / ${t('applied')}`}
                    </Typography>
                  </Box>
                  {mockData.regions.map(region => (
                    <Box
                      className={clsx(classes.row, classes.lineBottom)}
                      key={region.name}
                    >
                      <Box className={clsx(classes.row, classes.rowWidth)}>
                        <Typography>{region.name}</Typography>
                        <Typography>{region.total}</Typography>
                      </Box>
                      <BorderLinearProgress
                        variant="determinate"
                        value={region.progress}
                      />
                    </Box>
                  ))}
                  <Box className={clsx(classes.row, classes.lineBottom)}>
                    <Box className={classes.row}>
                      <Typography className={classes.tableHeaderLabel}>
                        {t('hospitalVaccines')}
                      </Typography>
                    </Box>
                    <Typography className={classes.tableHeaderLabel}>
                      {t('applied')}
                    </Typography>
                  </Box>
                  {mockData.hospitals.map(hospital => (
                    <Box
                      className={clsx(classes.row, classes.lineBottom)}
                      key={hospital.name}
                    >
                      <Typography>{hospital.name}</Typography>
                      <Typography>{hospital.total}</Typography>
                    </Box>
                  ))}
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
