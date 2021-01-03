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
    case 'container':
      console.log('WIP!!!!', { category, data, itemInfo })
      break

    case 'wrapper':
      console.log('WIP!!!!', { category, data, itemInfo })
      break

    case 'box':
      console.log('WIP!!!!', { category, data, itemInfo })
      break

    case 'batch':
      console.log('WIP!!!!', { category, data, itemInfo })
      break

    case 'order':
      console.log('WIP!!!!', { category, data, itemInfo })
      break

    default:
      break
  }
}
