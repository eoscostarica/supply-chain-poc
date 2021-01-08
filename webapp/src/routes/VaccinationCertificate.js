import React, { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'
import Link from '@material-ui/core/Link'
import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import QRCode from 'qrcode.react'
import { useLocation } from 'react-router-dom'
import queryString from 'query-string'
import { useLazyQuery } from '@apollo/react-hooks'

import { eosApi, formatDate, onImgError } from '../utils'
import { VACCINATION_QUERY } from '../gql'
import { mainConfig } from '../config'

const useStyles = makeStyles(theme => ({
  root: {
    paddingBottom: theme.spacing(10),
    overflow: 'scroll',
    height: '100%'
  },
  wrapper: {
    paddingLeft: theme.spacing(2)
  },
  section: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row'
    }
  },
  imgWrapper: {
    display: 'flex',
    justifyContent: 'space-space-evenly',
    alignItems: 'end',
    flexDirection: 'column',
    [theme.breakpoints.up('xs')]: {
      flexDirection: 'row'
    }
  },
  img: {
    padding: theme.spacing(2)
  }
}))

const VaccinationCertificate = () => {
  const location = useLocation()
  const [assets, setAssets] = useState([])
  const [account, setAccount] = useState()
  const classes = useStyles()
  const fieldtypes = {
    manufacturer: 'object',
    product: 'object',
    exp: 'date',
    url: 'link'
  }
  const dappinfo = {
    name: 'Hospital Rafael Ángel Calderón Guardia',
    company: 'Ministerio de Salud',
    info:
      'El Ministerio de Salud de Costa Rica en su rol de Rector de Salud coloca a disposición de la población nacional e internacional',
    logo:
      'https://www.ministeriodesalud.go.cr/index.php/sobre-ministerio/logos/4048-logos-ministerio-de-salud/file',
    url: 'https://www.ministeriodesalud.go.cr/'
  }

  useEffect(() => {
    const params = queryString.parse(location.search)
    const getAssets = async () => {
      const { rows } = await eosApi.getTableRows({
        json: true,
        code: mainConfig.simpleAssetsAccount,
        scope: params.account,
        table: 'snttassets',
        lower_bound: params.asset,
        upper_bound: params.asset
      })

      setAssets(rows)
      setAccount(params.account)
    }
    getAssets()
  }, [location.search])

  return (
    <Box className={classes.root} p={2}>
      <Typography variant="h4">{account}</Typography>
      {assets.map((asset, index) => (
        <Certificate
          key={`cer-${index}`}
          asset={asset}
          dappinfo={dappinfo}
          fieldtypes={fieldtypes}
        />
      ))}
    </Box>
  )
}

const Certificate = ({ asset, dappinfo = {}, fieldtypes = {} }) => {
  const location = useLocation()
  const { t } = useTranslation('certificate')
  const classes = useStyles()
  const [getVaccination, { data: { vaccination } = {} }] = useLazyQuery(
    VACCINATION_QUERY
  )

  const { name, ...idata } = getData(asset.idata)
  const { img, ...mdata } = getData(asset.mdata)
  const { logo, ...author } = dappinfo

  const renderField = (key, value) => {
    let children

    switch (fieldtypes[key]) {
      case 'date':
        children = <Typography component="dd">{formatDate(value)}</Typography>
        break
      case 'link':
        children = (
          <Link href={value} target="_blank" rel="noreferrer">
            {value}
          </Link>
        )
        break
      case 'img':
        children = (
          <img width="200px" src={value} alt={value} className={classes.img} />
        )
        break
      case 'object':
        children = Object.keys(value).map((key, index) => (
          <Box className={classes.wrapper} key={`field-${index}`}>
            {renderField(key, value[key])}
          </Box>
        ))
        break
      default:
        children = <Typography component="dd">{t(value)}</Typography>
    }

    return (
      <>
        <Typography component="dt" variant="overline">
          {t(key)}
        </Typography>
        {children}
      </>
    )
  }

  useEffect(() => {
    getVaccination({ variables: { id: idata.internal_id } })
    // eslint-disable-next-line
  }, [])

  return (
    <Box>
      <Box className={classes.section}>
        <Box component="dl">
          <Typography component="dt" variant="overline">
            {t('account')}
          </Typography>
          <Typography component="dd">{asset.author}</Typography>
          {Object.keys(author).map((key, index) => (
            <Box key={`field-${index}`}>{renderField(key, dappinfo[key])}</Box>
          ))}
        </Box>
        {logo && (
          <img
            height="160px"
            src={logo}
            onError={onImgError('/ntt.png')}
            alt="author"
            className={classes.img}
          />
        )}
      </Box>
      <Divider />
      <Box className={classes.section}>
        <Box component="dl">
          <Typography variant="h6">{t(name)}</Typography>
          <Typography component="dt" variant="overline">
            {t('vaccinated_id')}
          </Typography>
          <Typography component="dd">{vaccination?.person?.name}</Typography>
          {Object.keys(idata).map((key, index) => (
            <Box key={`field-${index}`}>{renderField(key, idata[key])}</Box>
          ))}
          <Typography component="dt" variant="overline">
            {t('vaccination_date')}
          </Typography>
          <Typography component="dd">
            {formatDate(vaccination?.created_at)}
          </Typography>
          <Typography component="dt" variant="overline">
            {t('id')}
          </Typography>
          <Typography component="dd">{asset.id}</Typography>
          {Object.keys(mdata).map((key, index) => (
            <Box key={`field-${index}`}>{renderField(key, mdata[key])}</Box>
          ))}
        </Box>
        <Box className={classes.imgWrapper}>
          {img && (
            <img
              width="220px"
              src={img}
              onError={onImgError('/nft.png')}
              alt="certificate"
              className={classes.img}
            />
          )}
          <QRCode
            value={`${window.location.origin}${location.pathname}?account=${asset.owner}&asset=${asset.id}`}
            size={220}
            className={classes.img}
          />
        </Box>
      </Box>
      <Divider />
    </Box>
  )
}

Certificate.propTypes = {
  asset: PropTypes.any,
  dappinfo: PropTypes.any,
  fieldtypes: PropTypes.any
}

const getData = jsonb => {
  let data = {}

  try {
    data = JSON.parse(jsonb)
  } catch (error) {}

  return data
}

export default memo(VaccinationCertificate)
