const findItem = (dataArray = [], itemKey) =>
  dataArray.find(item => itemKey === item.key)

export const getHeaderOrderData = (
  data,
  isEdit = true,
  title,
  subTitle = null
) => {
  const { idata, manufacturer, product, vaccines, key, id } = data
  const companyName = isEdit ? idata.manufacturer.name : manufacturer.name
  const productName = isEdit ? idata.product.name : product.name
  const lastSixNumber = key.substr(key.length - 6)
  const vaccinesAmount = isEdit ? idata.product.vaccines : vaccines
  const newDate = new Date(data.updated_at)
  const dateFormat = newDate.toLocaleString({
    hour: 'numeric',
    hour12: true
  })

  return {
    id,
    companyName,
    productName,
    vaccinesAmount,
    dateFormat,
    title: subTitle ? title : `${title}${lastSixNumber}`,
    subTitle: subTitle ? `${subTitle}${lastSixNumber}` : subTitle
  }
}

export const getAssetsDataModeled = (category, data, itemInfo) => {
  switch (category) {
    case 'container': {
      const [
        {
          key: containerKey,
          asset: {
            key: wrapperKeyC,
            asset: {
              key: boxKeyC,
              asset: { key: batchKeyC }
            }
          }
        }
      ] = itemInfo
      const batchC = findItem(data, batchKeyC)
      const boxC = findItem(batchC.assets, boxKeyC)
      const wrapperC = findItem(boxC.assets, wrapperKeyC)
      const containerC = findItem(wrapperC.assets, containerKey)

      return {
        assets: [containerC],
        extraData: [
          { label: 'batch', value: `#${batchC.idata.lot}` },
          { label: 'box', value: `#${boxC.key}` },
          { label: 'wrapper', value: `#${wrapperC.key}` }
        ]
      }
    }

    case 'wrapper': {
      const [
        {
          key: wrapperKey,
          asset: {
            key: boxKeyW,
            asset: { key: batchKeyW }
          }
        }
      ] = itemInfo
      const batchW = findItem(data, batchKeyW)
      const boxW = findItem(batchW.assets, boxKeyW)
      const wrapperW = findItem(boxW.assets, wrapperKey)

      return {
        assets: [wrapperW],
        extraData: [
          { label: 'batch', value: `#${batchW.idata.lot}` },
          { label: 'box', value: `#${boxW.key}` }
        ]
      }
    }

    case 'box': {
      const [
        {
          key: boxKey,
          asset: { key: batchKeyB }
        }
      ] = itemInfo
      const batchB = findItem(data, batchKeyB)
      const boxB = findItem(batchB.assets, boxKey)

      return {
        assets: [boxB],
        extraData: [{ label: 'batch', value: `#${batchB.idata.lot}` }]
      }
    }

    default:
      break
  }
}
