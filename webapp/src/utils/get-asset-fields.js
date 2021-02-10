import React from 'react'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'

import { formatDate } from './format-date'

export const getAssetFields = asset => {
  const fields = []

  if (!asset) {
    return fields
  }

  switch (asset.category) {
    case 'pallet':
      fields.push({
        name: 'manufacturer',
        value: <Typography>{asset.idata?.manufacturer?.name}</Typography>
      })
      fields.push({
        name: 'product',
        value: <Typography>{asset.idata?.product?.name}</Typography>
      })
      fields.push({
        name: 'doses',
        value: <Typography>{asset.idata?.product?.doses}</Typography>
      })
      fields.push({
        name: 'order',
        value: <Typography>{asset.idata.order}</Typography>
      })
      fields.push({
        name: 'lot',
        value: <Typography>{asset.idata.lot}</Typography>
      })
      fields.push({
        name: 'exp',
        value: <Typography>{formatDate(asset.idata.exp)}</Typography>
      })
      fields.push({
        name: 'created_at',
        value: <Typography>{formatDate(asset.created_at)}</Typography>
      })
      fields.push({
        name: 'updated_at',
        value: <Typography>{formatDate(asset.updated_at)}</Typography>
      })
      fields.push({ name: 'key', value: <Typography>{asset.key}</Typography> })
      break
    case 'case':
      fields.push({
        name: 'manufacturer',
        value: <Typography>{asset.asset.idata?.manufacturer?.name}</Typography>
      })
      fields.push({
        name: 'product',
        value: <Typography>{asset.asset.idata?.product?.name}</Typography>
      })
      fields.push({
        name: 'doses',
        value: <Typography>{asset.asset.idata?.product?.doses}</Typography>
      })
      fields.push({
        name: 'order',
        value: <Typography>{asset.asset.idata.order}</Typography>
      })
      fields.push({
        name: 'lot',
        value: <Typography>{asset.asset.idata.lot}</Typography>
      })
      fields.push({
        name: 'exp',
        value: <Typography>{formatDate(asset.asset.idata.exp)}</Typography>
      })
      fields.push({
        name: 'pallet',
        value: <Typography>{asset.idata.pallet}</Typography>
      })
      fields.push({
        name: 'created_at',
        value: <Typography>{formatDate(asset.created_at)}</Typography>
      })
      fields.push({
        name: 'updated_at',
        value: <Typography>{formatDate(asset.updated_at)}</Typography>
      })
      fields.push({ name: 'key', value: <Typography>{asset.key}</Typography> })
      break
    case 'vaccine':
      fields.push({
        name: 'manufacturer',
        value: (
          <Typography>{asset.asset.asset.idata?.manufacturer?.name}</Typography>
        )
      })
      fields.push({
        name: 'product',
        value: <Typography>{asset.asset.asset.idata?.product?.name}</Typography>
      })
      fields.push({
        name: 'doses',
        value: (
          <Typography>{asset.asset.asset.idata?.product?.doses}</Typography>
        )
      })
      fields.push({
        name: 'order',
        value: <Typography>{asset.asset.asset.idata.order}</Typography>
      })
      fields.push({
        name: 'lot',
        value: <Typography>{asset.asset.asset.idata.lot}</Typography>
      })
      fields.push({
        name: 'exp',
        value: (
          <Typography>{formatDate(asset.asset.asset.idata.exp)}</Typography>
        )
      })
      fields.push({
        name: 'pallet',
        value: <Typography>{asset.asset.idata.pallet}</Typography>
      })
      fields.push({
        name: 'case',
        value: <Typography>{asset.idata.case}</Typography>
      })
      fields.push({
        name: 'created_at',
        value: <Typography>{formatDate(asset.created_at)}</Typography>
      })
      fields.push({
        name: 'updated_at',
        value: <Typography>{formatDate(asset.updated_at)}</Typography>
      })
      fields.push({ name: 'key', value: <Typography>{asset.key}</Typography> })
      break
    default:
      console.log(`unsupported category ${asset.category}`)
  }

  if (asset?.assets?.length < asset?.mdata?.childs) {
    fields.push({
      name: 'itemCreationStatus',
      value: (
        <>
          <Typography>
            {asset?.assets?.length} of {asset?.mdata.childs}
          </Typography>
          <LinearProgress />
        </>
      )
    })
  }

  return fields
}
