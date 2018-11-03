import React from 'react'
import { compose } from 'recompose'
import forEach from 'lodash/forEach'
import {
  GET_WALLET_USER,
  GET_GAME_INFORMATION,
} from './queries'
import withApolloProvider from './withApolloProvider'
import withContracts from './withContracts'

let observables = []

const withSubscription = (WrappedComponent) => {
  // ...and returns another component...
  return class extends React.Component {
    static getInitialProps(ctx) {
      return WrappedComponent.getInitialProps
        ? WrappedComponent.getInitialProps(ctx)
        : WrappedComponent
    }

    constructor(props) {
      super(props)
      this.state = {
        address: '',
      }
    }

    componentDidMount() {
      this.pollingMetaMaskAccount = setInterval(() => {
        this.pollingUserWallet()
      }, 1000)
    }

    componentWillUnmount() {
      if (this.pollingMetaMaskAccount) {
        clearInterval(this.pollingMetaMaskAccount)
      }
    }

    pollingUserWallet = () => {
      const {
        getCurrentMetaAccount,
        apolloClient: {
          watchQuery,
        },
      } = this.props

      const { address } = this.state

      getCurrentMetaAccount()
        .then((newAddress) => {
          this.setState({
            address: newAddress,
          }, () => {
            if (observables.length !== 0) {
              forEach(observables, async (observable) => {
                observable.unsubscribe()
              })
              observables = []
            }
            if (newAddress !== address) {
              const walletPooling = watchQuery({
                query: GET_WALLET_USER,
                variables: { address: newAddress },
                pollInterval: 2000,
                ssr: false,
              }).subscribe()

              const gamePooling = watchQuery({
                query: GET_GAME_INFORMATION,
                pollInterval: 2000,
                ssr: false,
              }).subscribe()
              observables.push(walletPooling)
              observables.push(gamePooling)
            }
          })
        })
    }

    render() {
      // ... and renders the wrapped component with the fresh data!
      // Notice that we pass through any additional props
      const { address } = this.state
      return <WrappedComponent {...this.props} walletAddress={address} />
    }
  }
}

export default compose(
  withApolloProvider,
  withContracts,
  withSubscription,
)
