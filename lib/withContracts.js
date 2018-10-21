import React from 'react'
import Web3 from 'web3'
import { contractInterface, contractAddress } from '../contractsBuild/PlayerBook'
import {
  contractInterface as numberGameContractInterface,
  contractAddress as numberGameContractAddress,
} from '../contractsBuild/NumberGame'

function withContracts(WrappedComponent) {
  return class extends React.Component {
    static getInitialProps(ctx) {
			return WrappedComponent.getInitialProps(ctx)
		}
    render() {
      const web3 = !process.browser
        ? new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
        : new Web3(window.web3.currentProvider)
      
      const playerBook = new web3.eth.Contract(contractInterface, contractAddress)
      const numberGame = new web3.eth.Contract(numberGameContractInterface, numberGameContractAddress)
      return (
        <WrappedComponent
          {...this.props}
          web3={web3}
          contracts={{ playerBook, numberGame }}
        />
      )
    }
  }
}
export default withContracts
