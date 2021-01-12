import React, { memo, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { makeStyles } from '@material-ui/core/styles'
import Timeline from '@material-ui/lab/Timeline'
import TimelineItem from '@material-ui/lab/TimelineItem'
import TimelineSeparator from '@material-ui/lab/TimelineSeparator'
import TimelineConnector from '@material-ui/lab/TimelineConnector'
import TimelineContent from '@material-ui/lab/TimelineContent'
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent'
import TimelineDot from '@material-ui/lab/TimelineDot'
import AddIcon from '@material-ui/icons/Add'
import ThumbUpIcon from '@material-ui/icons/ThumbUp'
import AppsIcon from '@material-ui/icons/Apps'
import AcUnitIcon from '@material-ui/icons/AcUnit'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import EditLocationIcon from '@material-ui/icons/EditLocation'
import DoneAllIcon from '@material-ui/icons/DoneAll'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useLazyQuery } from '@apollo/react-hooks'

import Modal from './Modal'
import Loader from './Loader'
import { HISTORY_QUERY } from '../gql'
import { formatDate } from '../utils'
import { mainConfig } from '../config'

const useStyles = makeStyles(theme => ({
  paper: {
    padding: theme.spacing(1, 2)
  },
  secondaryTail: {
    backgroundColor: theme.palette.secondary.main
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  timeline: {
    padding: 0,
    margin: 0,
    maxHeight: '80vh',
    overflow: 'scroll',
    paddingBottom: theme.spacing(2),
    display: 'block',
    width: '100%',
    maxWidth: 480,
    '& .MuiTimelineItem-root': {
      flexWrap: 'wrap'
    },
    '& .MuiTimelineSeparator-root': {
      flex: 1,
      minWidth: '50%'
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: 480,
      maxWidth: 'fit-content',
      '& .MuiTimelineSeparator-root': {
        flex: 0,
        minWidth: 'auto'
      }
    }
  },
  timelineDot: {
    color: 'rgba(0, 0, 0, 0.6)',
    borderColor: 'rgba(0, 0, 0, 0.6)',
    backgroundColor: 'transparent'
  },
  timelineConnector: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)'
  }
}))

const AssetHistory = ({ onClose, asset, ...props }) => {
  const classes = useStyles()
  const { t } = useTranslation('assetHistory')
  const theme = useTheme()
  const isUpSm = useMediaQuery(theme.breakpoints.up('sm'), {
    defaultMatches: true
  })
  const [getHistory, { data, loading }] = useLazyQuery(HISTORY_QUERY, {
    fetchPolicy: 'network-only'
  })

  const getItemText = item => {
    switch (item.action) {
      case 'create':
        return `${t(item.asset.category)} - ${t('createdBy')} ${
          item.data.user.name
        }`

      case 'detach':
        return `${t(item.asset.category)} - ${t('detachedBy')} ${
          item.data.user.name
        }`

      case 'offer':
        return `${t(item.asset.category)} - ${t('offerCreated')} ${
          item.data.user.name
        }`

      case 'claim_offer':
        return `${t(item.asset.category)} - ${t('claimed')} ${
          item.data.user.name
        }`

      case 'temperature':
        return `${t(item.asset.category)} - ${t('temperatureUpdated')} ${
          item.data.user.name
        } - ${item.data.temperature}°C`

      case 'location':
        return `${t(item.asset.category)} - ${t('locationUpdated')} ${
          item.data.user.name
        } - ${item.data.location}`

      case 'vaccination':
        return `${t(item.asset.category)} - ${t('vaccinationBy')} ${
          item.data.user.name
        }`

      default:
        return `${item.action}`
    }
  }

  const getItemIcon = item => {
    switch (item.action) {
      case 'create':
        return <AddIcon />
      case 'detach':
        return <AppsIcon />
      case 'offer':
        return <ArrowForwardIosIcon />
      case 'claim_offer':
        return <ThumbUpIcon />
      case 'location':
        return <EditLocationIcon />
      case 'temperature':
        return <AcUnitIcon />
      case 'vaccination':
        return <DoneAllIcon />
      default:
        return <ThumbUpIcon />
    }
  }

  useEffect(() => {
    getHistory({ variables: { id: asset.id } })
  }, [asset, getHistory])

  return (
    <Modal
      {...props}
      onClose={onClose}
      title={`${t('title')} ${t(asset.category)} #${asset.key.substr(
        asset.key.length - 6,
        6
      )}`}
    >
      <Box className={classes.wrapper}>
        {loading && <Loader />}
        <Timeline
          align={isUpSm ? 'alternate' : 'left'}
          className={classes.timeline}
        >
          {(data?.asset_history || []).map((item, index) => (
            <TimelineItem key={`item-${index}`}>
              <TimelineOppositeContent>
                <Typography variant="body2" color="textSecondary">
                  {formatDate(item.created_at)}
                </Typography>

                <Link
                  href={mainConfig.blockExplorer.replace(
                    '{transaction}',
                    item.trxid
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Typography variant="body2" color="textSecondary">
                    trxid: {item.trxid?.substr(0, 8)}
                  </Typography>
                </Link>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot className={classes.timelineDot}>
                  {getItemIcon(item)}
                </TimelineDot>
                <TimelineConnector className={classes.timelineConnector} />
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={3} className={classes.paper}>
                  <Typography>{getItemText(item)}</Typography>
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </Box>
    </Modal>
  )
}

AssetHistory.propTypes = {
  onClose: PropTypes.func,
  assets: PropTypes.array,
  asset: PropTypes.any
}

export default memo(AssetHistory)
