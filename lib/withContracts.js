import React from 'react'
import Web3 from 'web3'
import { div, mul } from '../utils/calculation'
import { contractInterface, contractAddress } from '../contractsBuild/PlayerBook'
import {
  contractInterface as numberGameContractInterface,
  contractAddress as numberGameContractAddress,
} from '../contractsBuild/NumberGame'

function withContracts(WrappedComponent) {
  return class extends React.Component {
    static getInitialProps(ctx) {
      return WrappedComponent.getInitialProps
        ? WrappedComponent.getInitialProps(ctx)
        : WrappedComponent
    }

    constructor(props) {
      super(props)
      const web3 = !process.browser
        ? new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'))
        : new Web3(window.web3.currentProvider) /* eslint-disable-line */
      const playerBook = new web3.eth.Contract(
        contractInterface,
        contractAddress,
      )
      const numberGame = new web3.eth.Contract(
        numberGameContractInterface,
        numberGameContractAddress,
      )
      this.playerBook = playerBook
      this.numberGame = numberGame
      this.web3 = web3
    }

    getCurrentMetaAccount = () => this.web3.eth.getAccounts().then(([acc]) => acc)

    /* eslint-disable no-underscore-dangle */
    getGameById = (id) => {
      const { getUserInformationWithAddress, numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .games_(id)
        .call()
        .then(game => getUserInformationWithAddress(game.bankerAddress)
          .then((banker) => {
            const startTime = mul(game.startTime, '1000')
            const endTime = mul(game.endTime, '1000')
            const data = ({
              startTime: Number(startTime),
              endTime: Number(endTime),
              banker,
              winningAmount: div(game.totalAmount, utils.unitMap.ether),
            })
            return data
          }))
    }

    /* eslint-disable no-underscore-dangle */
    getCurrentLotteryPotAmount = () => this.numberGame.methods
      .currentLottryPot_()
      .call()
      .then(amount => div(amount, this.web3.utils.unitMap.ether))

    /* eslint-disable no-underscore-dangle */
    getUserInformationWithAddress = (address) => {
      const { methods } = this.playerBook
      return methods.pIDxAddr_(address)
        .call()
        .then(id => this.getUserInformationWithId(id))
    }

    /* eslint-disable no-underscore-dangle */
    getUserInformationWithId = (id) => {
      const { utils: { toUtf8, unitMap } } = this.web3
      return this.playerBook.methods.plyr_(id).call()
        .then(data => this
          .getWalletInfoWithAddress(data.addr)
          .then(({ balance }) => ({
            name: toUtf8(data.name),
            laff: data.laff,
            claimable: div(data.claimable, unitMap.ether),
            address: data.addr,
            balance,
          })))
    }

    getWalletInfoWithAddress = address => this.web3.eth.getBalance(address)
      .then(balance => ({
        balance: div(balance, this.web3.utils.unitMap.ether),
        address,
      }))

    render() {
      const {
        web3,
        playerBook,
        numberGame,
        getUserInformationWithId,
        getUserInformationWithAddress,
        getCurrentMetaAccount,
        getCurrentLotteryPotAmount,
        getGameById,
      } = this
      return (
        <WrappedComponent
          {...this.props}
          web3={web3}
          contracts={{ playerBook, numberGame }}
          contractMethods={{
            getUserInformationWithId,
            getUserInformationWithAddress,
            getCurrentLotteryPotAmount,
            getGameById,
          }}
          getCurrentMetaAccount={getCurrentMetaAccount}
        />
      )
    }
  }
}
export default withContracts
