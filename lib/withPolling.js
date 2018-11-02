import React from 'react'
import { compose } from 'recompose'
import forEach from 'lodash/forEach'
import { GET_WALLET_USER } from './queries'
import withApolloProvider from './withApolloProvider'
import withContracts from './withContracts'

const observables = []

function withSubscription(WrappedComponent) {
  // ...and returns another component...
  return class extends React.Component {
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
          if (newAddress !== address) {
            this.setState({ address: newAddress })
            const newPooling = watchQuery({
              query: GET_WALLET_USER,
              variables: { address: newAddress },
              pollInterval: 1000,
              ssr: false,
            }).subscribe()
            if (observables.length > 0) {
              forEach(observables, (observable) => {
                observable.unsubscribe()
                observables.shift()
              })
            }
            observables.push(newPooling)
          }
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
