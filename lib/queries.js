import gql from 'graphql-tag'

export const GET_WALLET_USER = gql`
  query GET_WALLET_USER($address: String!) {
    wallet(address: $address) {
      address
      balance
      user {
        image
        name
        claimable
        id
      }
    }
  }
`
