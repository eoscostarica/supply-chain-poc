export const formatDate = date =>
  new Date(date).toLocaleString({
    hour: 'numeric',
    hour12: true
  })
