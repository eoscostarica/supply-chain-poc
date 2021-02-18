const countChildren = (obj, path) => {
  let count = 0

  if (obj.assets && obj.assets.length) {
    count = obj.assets.length

    path[obj.category] = {
      ...path[obj.category],
      quantity: path[obj.category].quantity + count
    }

    for (let i = 0; i < obj.assets.length; i++) {
      countChildren(obj.assets[i], path)
    }
  }
}

const formatString = (category, path) => {
  const { pallet, case: box } = path

  switch (category) {
    case 'case':
      return `${box.quantity} ${box.name}`

    case 'pallet':
      return `${pallet.quantity} ${pallet.name}/${box.quantity} ${box.name}`

    default:
      return ''
  }
}

export const formatAsset = (data, t) => {
  const path = {
    order: { name: t('batchAbbr'), quantity: 0 },
    batch: { name: t('palletAbbr'), quantity: 0 },
    pallet: { name: t('caseAbbr'), quantity: 0 },
    case: { name: t('vaccineAbbr'), quantity: 0 },
    vaccine: { name: '', quantity: 0 }
  }

  
  countChildren(data, path)
  // console.log({ formatAsset: data, path})

  return formatString(data.category, path)
}

export const isPalletComplete = ({ mdata, assets, category }) => {
  if (category === 'vaccine') return true

  if (mdata?.childs === assets.length) {
    let result = false

    assets.forEach(item => {
      result = isPalletComplete(item)
    })

    return result
  }

  return false
}
