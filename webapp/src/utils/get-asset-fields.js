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
        value: asset.idata?.manufacturer?.name
      })
      fields.push({ name: 'product', value: asset.idata?.product?.name })
      fields.push({ name: 'doses', value: asset.idata?.product?.doses })
      fields.push({ name: 'order', value: asset.idata.order })
      fields.push({ name: 'batch', value: asset.idata.batch })
      fields.push({ name: 'exp', value: formatDate(asset.idata.exp) })
      fields.push({ name: 'created_at', value: formatDate(asset.created_at) })
      fields.push({ name: 'updated_at', value: formatDate(asset.updated_at) })
      fields.push({ name: 'key', value: asset.key })
      break
    case 'case':
      fields.push({
        name: 'manufacturer',
        value: asset.asset.idata?.manufacturer?.name
      })
      fields.push({ name: 'product', value: asset.asset.idata?.product?.name })
      fields.push({ name: 'doses', value: asset.asset.idata?.product?.doses })
      fields.push({ name: 'order', value: asset.asset.idata.order })
      fields.push({ name: 'batch', value: asset.asset.idata.batch })
      fields.push({ name: 'exp', value: formatDate(asset.asset.idata.exp) })
      fields.push({ name: 'pallet', value: asset.idata.pallet })
      fields.push({ name: 'created_at', value: formatDate(asset.created_at) })
      fields.push({ name: 'updated_at', value: formatDate(asset.updated_at) })
      fields.push({ name: 'key', value: asset.key })
      break
    case 'vaccine':
      fields.push({
        name: 'manufacturer',
        value: asset.asset.asset.idata?.manufacturer?.name
      })
      fields.push({
        name: 'product',
        value: asset.asset.asset.idata?.product?.name
      })
      fields.push({
        name: 'doses',
        value: asset.asset.asset.idata?.product?.doses
      })
      fields.push({ name: 'order', value: asset.asset.asset.idata.order })
      fields.push({ name: 'batch', value: asset.asset.asset.idata.batch })
      fields.push({
        name: 'exp',
        value: formatDate(asset.asset.asset.idata.exp)
      })
      fields.push({ name: 'pallet', value: asset.asset.idata.pallet })
      fields.push({ name: 'case', value: asset.idata.case })
      fields.push({ name: 'created_at', value: formatDate(asset.created_at) })
      fields.push({ name: 'updated_at', value: formatDate(asset.updated_at) })
      fields.push({ name: 'key', value: asset.key })
      break
    default:
      console.log(`unsupported category ${asset.category}`)
  }

  return fields
}
