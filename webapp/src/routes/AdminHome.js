import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles, withStyles } from '@material-ui/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import clsx from 'clsx'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import { useSharedState } from '../context/state.context'
import Box from '@material-ui/core/Box'
import { useLazyQuery } from '@apollo/react-hooks'

import PieChart from '../components/PieChart'
import LineChart from '../components/LineChart'
import BarChart from '../components/BarChart'
import ListItems from '../components/ListItems'
import MapEditLocation from '../components/MapEditLocation'
import MapShowLocations from '../components/MapShowLocations'
import { mockData, getGraphicData } from '../utils'
import { GET_ORGANIZATIONS, GET_VACCINES } from '../gql'

const data2 = [
  { name: 'Mayores de 70 años', value: 3600, fill: '#147595' },
  { name: 'Personal médico', value: 1800, fill: '#2BBCDF' },
  { name: 'Entre 50-70 años', value: 600, fill: '#E0E0E0' }
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
  },
  openDataLabel: {
    margin: theme.spacing(2, 0)
  },
  boxOpenData: {
    marginBottom: theme.spacing(2),
    '& .MuiTypography-root': {
      margin: '16px 41px 16px 36px',
      fontSize: 18,
      fontWeight: '500',
      lineHeight: 1.94,
      letterSpacing: '0.02px',
      color: '#000000'
    }
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
  const [state] = useSharedState()
  const { t } = useTranslation('')
  const classes = useStyles()
  const [graphicData, setGraphicData] = useState()
  const [getOrganizations, { data: { organizations } = {} }] = useLazyQuery(
    GET_ORGANIZATIONS,
    {
      fetchPolicy: 'network-only'
    }
  )
  const [getVaccines, { data: { asset: vaccines } = {} }] = useLazyQuery(
    GET_VACCINES,
    {
      fetchPolicy: 'network-only'
    }
  )

  useEffect(() => {
    getOrganizations()
    getVaccines()
  }, [getOrganizations, getVaccines, state.user])

  useEffect(() => {
    setGraphicData(getGraphicData(vaccines, organizations))
  }, [organizations, vaccines])

  return (
    <Box p={2} className={classes.wrapper}>
      <Grid container spacing={2}>
        {state?.user?.role === 'author' ? (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">{t('alerts')}</Typography>
                <ListItems
                  items={mockData.batches}
                  handleOnClick={() => {}}
                  selected="none"
                />
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6">{t('openData')}</Typography>
                <Typography className={classes.openDataLabel}>
                  Bienvenido(a) a Datos Abiertos de InmuTrust. Siguiendo los
                  lineamientos establecidos por la Ley de Transparencia, hemos
                  habilitado la capacidad de darle seguimiento a las
                  transacciones y datos no privados referentes a el proceso de
                  distribución y aplicación de vacunas en Costa Rica. Por medio
                  de este portal podrá darle seguimiento a:
                </Typography>
                <Box className={classes.boxOpenData}>
                  <Typography>- Estado general de vacunación</Typography>
                  <Typography>
                    - Distribución geográfica de las vacunas
                  </Typography>
                  <Typography>
                    - Distribución demográfica de la vacunación
                  </Typography>
                  <Typography>- Transporte y distribución</Typography>
                  <Typography>- Certificados de vacunación</Typography>
                </Box>
                <Typography>
                  Para más información ingrese a la sección de ayuda.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('activity')}</Typography>
              <Typography className={classes.openDataLabel}>
                Las acciones ejecutadas en la cadena de distribución representan
                avances en el proceso global de vacunación.
              </Typography>
              <BarChart />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('vaccineTitle')}</Typography>
              <PieChart
                data={graphicData?.vaccinesCounter}
                total={vaccines?.length || 0}
              />
              <Box className={clsx(classes.row, classes.lineBottom)}>
                <Typography className={classes.tableHeaderLabel}>
                  {t('vaccines')}
                </Typography>
                <Typography className={classes.tableHeaderLabel}>
                  Total
                </Typography>
              </Box>
              {(graphicData?.vaccinesCounter || []).map(distributionItem => (
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
                      bgcolor={distributionItem.fill}
                    />
                    <Typography>{t(distributionItem.name)}</Typography>
                  </Box>
                  <Typography>{distributionItem.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('secondVaccineTitle')}</Typography>
              <PieChart data={data2} total={6000} />
              <Box className={clsx(classes.row, classes.lineBottom)}>
                <Typography className={classes.tableHeaderLabel}>
                  {t('people')}
                </Typography>
                <Typography className={classes.tableHeaderLabel}>
                  Total
                </Typography>
              </Box>
              {(data2 || []).map(distributionItem => (
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
                      bgcolor={distributionItem.fill}
                    />
                    <Typography>{t(distributionItem.name)}</Typography>
                  </Box>
                  <Typography>{distributionItem.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">{t('map')}</Typography>
              <Box className={classes.mapList}>
                <MapShowLocations
                  width="100%"
                  // width={600}
                  height={350}
                  // usuControls={false}
                  // initialZoom={7}
                />

                {/* <MapEditLocation
                  onGeolocationChange={() => {}}
                  markerLocation={{ longitude: -84.100789, latitude: 9.934725 }}
                  width="100%"
                  height={350}
                  usuControls={false}
                  initialZoom={7}
                /> */}
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
                  {(graphicData?.regions || []).map(region => (
                    <Box
                      className={clsx(classes.row, classes.lineBottom)}
                      key={region.key}
                    >
                      <Box className={clsx(classes.row, classes.rowWidth)}>
                        <Typography>{region.key}</Typography>
                        <Typography>{region.value}</Typography>
                      </Box>
                      <BorderLinearProgress variant="determinate" value={10} />
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {t('vaccineHistoryTemperature')}
              </Typography>
              <LineChart />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default memo(AdminHome)
