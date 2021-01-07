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
  const { batch, box, wrapper, container, order } = path

  switch (category) {
    case 'order':
      return `${order.quantity} ${order.name}/${batch.quantity} ${batch.name}/${box.quantity} ${box.name}/${wrapper.quantity} ${wrapper.name}/${container.quantity} ${container.name}`

    case 'batch':
      return `${batch.quantity} ${batch.name}/${box.quantity} ${box.name}/${wrapper.quantity} ${wrapper.name}/${container.quantity} ${container.name}`

    case 'box':
      return `${box.quantity} ${box.name}/${wrapper.quantity} ${wrapper.name}/${container.quantity} ${container.name}`

    case 'wrapper':
      return `${wrapper.quantity} ${wrapper.name}/${container.quantity} ${container.name}`

    case 'container':
      return `${container.quantity} ${container.name}`

    default:
      return ''
  }
}

export const formatAsset = (data, t) => {
  const path = {
    order: { name: 'Lotes', quantity: 0 },
    batch: { name: 'cajas', quantity: 0 },
    box: { name: t('wrapperAbbr'), quantity: 0 },
    wrapper: { name: t('containerAbbr'), quantity: 0 },
    container: { name: t('vaccineAbbr'), quantity: 0 },
    vaccine: { name: '', quantity: 0 }
  }

  countChildren(data, path)

  return formatString(data.category, path)
}
