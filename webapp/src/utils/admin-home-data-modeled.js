export const getGraphicData = (vaccines = [], organizations = []) => {
  const vaccinesData = vaccines.reduce(
    (acc, current) => {
      let status = current.status

      if (status === 'offer_claimed' || status === 'unwrapped') {
        status = 'unwrapped'
      }

      const item = acc[status]

      return { ...acc, [status]: { ...item, value: item.value + 1 } }
    },
    {
      unwrapped: { name: 'inProcess', value: 0, fill: '#2BBCDF' },
      wrapped: { name: 'inStock', value: 0, fill: '#E0E0E0' },
      destroyed: { name: 'destroyed', value: 0, fill: '#444' },
      burned: { name: 'applied', value: 0, fill: '#147595' }
    }
  )


  const regions = organizations.map(({ account, state, name }) => {
    const totalVaccine = vaccines.filter(({ owner }) => owner === account)

    return { key: state, value: totalVaccine?.length }
  })
  const vaccinesCounter = vaccinesData ? Object.values(vaccinesData) : []

  return { vaccinesCounter, regions }
}
