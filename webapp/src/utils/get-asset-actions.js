import React from 'react'
import LocationOnIcon from '@material-ui/icons/LocationOn'
import HistoryIcon from '@material-ui/icons/History'
import AppsIcon from '@material-ui/icons/Apps'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import DoneAllIcon from '@material-ui/icons/DoneAll'

export const getAssetActions = (asset, user) => {
  const actions = []

  if (!asset || !user) {
    return actions
  }

  if (
    asset.status !== 'offer_created' &&
    (asset.author === user.orgAccount ||
      (user.role !== 'vaccinator' && asset.owner === user.orgAccount))
  ) {
    actions.push({ name: 'update', icon: <LocationOnIcon /> })
  }

  if (
    asset.assets.length > 0 &&
    asset.status !== 'offer_created' &&
    user.role !== 'vaccinator' &&
    asset.owner === user.orgAccount
  ) {
    actions.push({ name: 'detach', icon: <AppsIcon /> })
  }

  if (
    asset?.status !== 'offer_created' &&
    asset?.owner === user.orgAccount &&
    user.role !== 'vaccinator'
  ) {
    actions.push({ name: 'offer', icon: <ArrowForwardIcon /> })
  }

  if (
    asset?.status === 'offer_created' &&
    user.role !== 'vaccinator' &&
    asset.offered_to === user.orgAccount
  ) {
    actions.push({ name: 'claim', icon: <DoneAllIcon /> })
  }

  actions.push({ name: 'history', icon: <HistoryIcon /> })

  return actions
}
