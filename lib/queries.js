import gql from 'graphql-tag'

export const GET_WALLET_USER = gql`
  query GET_WALLET_USER($address: String!) {
    wallet(address: $address) {
      address
      balance
      user {
        image
        imageMushroom
        mushroomCoin
        name
        claimable
        id
        affiliate {
          address
          balance
          user {
            name
            claimable
            image
          }
        }
      }
    }
  }
`

export const GET_PLAYERBOOK_PLAYER = gql`
  query GET_PLAYERBOOK_PLAYER($name: String, $id: Int) {
    playerBook {
      player(name: $name, id: $id) {
        name
        claimable
      }
    }
  }
`

export const GET_GAME_INFORMATION = gql`
  query GET_GAME_INFORMATION {
    gameInformation {
      count
      potAmountLottery
      feeGameActivation
      games {
        id
        potAmountWinning
        startTime
        endTime
        feeKeyPurchasing
        feeKeyRevealing
        feeSnapshotWinner
        status
        bankerWallet {
          address
          balance
          user {
            image
          }
        }
      } 
    }
  }
`

export const GET_GAMES = gql`
  query GET_GAME_INFORMATION($gameIds: [Int]) {
    gameInformation {
      potAmountLottery
      games(gameIds: $gameIds) {
        id
        potAmountWinning
        startTime
        endTime
        feeKeyPurchasing
        feeKeyRevealing
        feeSnapshotWinner
        status
        winner {
          wallet {
            address
            balance
            user {
              name
              image
            }
          }
          timestamp
          winningNumber
        }
        bankerWallet {
          address
          balance
          user {
            image
          }
        }
      } 
    }
  }
`
