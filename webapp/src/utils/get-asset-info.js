import { formatDate } from './format-date'

export const getAssetInfo = asset => {
  if (!asset) {
    return
  }

  let customFields = {}
  let order = {}

  switch (asset.category) {
    case 'order':
      order = asset
      break
    case 'batch':
      order = asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.idata.lot}`,
        exp: formatDate(asset.idata.exp)
      }
      break
    case 'pallet':
      order = asset.asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.asset.idata.lot}`,
        exp: formatDate(asset.asset.idata.exp)
      }
      break
    case 'case':
      order = asset.asset.asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.asset.asset.idata.lot}`,
        exp: formatDate(asset.asset.asset.idata.exp),
        pallet: `#${asset.idata.pallet}`
      }
      break
    case 'box':
      order = asset.asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.asset.idata.lot}`,
        exp: formatDate(asset.asset.idata.exp)
      }
      break
    case 'wrapper':
      order = asset.asset.asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.asset.asset.idata.lot}`,
        exp: formatDate(asset.asset.asset.idata.exp),
        box: `#${asset.idata.box}`
      }
      break
    case 'container':
      order = asset.asset.asset.asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.asset.asset.asset.idata.lot}`,
        exp: formatDate(asset.asset.asset.asset.idata.exp),
        box: `#${asset.asset.idata.box}`,
        wrapper: `#${asset.idata.wrapper}`,
        assets: [{ ...asset }]
      }
      break
    case 'vaccine':
      order = asset.asset.asset.asset.asset
      customFields = {
        order: `#${order.key}`,
        batch: `#${asset.asset.asset.asset.idata.lot}`,
        exp: formatDate(asset.asset.asset.asset.idata.exp),
        pallet: `#${asset.asset.idata.pallet}`,
        case: `#${asset.idata.case}`
      }
      break
    default:
      console.log(`unsupported category ${asset.category}`)
  }

  return {
    key: asset.key,
    assets: asset.assets,
    category: asset.category,
    companyName: order.idata?.manufacturer?.name,
    productName: order.idata?.product?.name,
    vaccinesAmount: order.idata?.product.quantity,
    doses: order.idata?.product.doses,
    createdAt: formatDate(asset.created_at),
    updatedAt: formatDate(asset.updated_at),
    ...customFields
  }
}
