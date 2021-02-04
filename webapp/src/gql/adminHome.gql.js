import gql from 'graphql-tag'

export const GET_HISTORY_ACTIONS = gql`
  query getHistoryActions($currentDate: timestamptz, $secondDate: timestamptz) {
    history(
      where: {
        _and: [
          { created_at: { _gte: $secondDate } }
          { created_at: { _lte: $currentDate } }
        ]
      }
      order_by: { created_at: asc }
    ) {
      action
      created_at
    }
  }
`
