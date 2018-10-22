import React from 'react'
import Web3 from 'web3'
import moment from 'moment'
import range from 'lodash/range'
import omit from 'lodash/omit'
import { div, mul } from '../utils/calculation'
import { contractInterface, contractAddress } from '../contractsBuild/PlayerBook'
import {
  contractInterface as numberGameContractInterface,
  contractAddress as numberGameContractAddress,
} from '../contractsBuild/NumberGame'

const UserType = ({
  name,
  laff,
  claimable,
  address,
  balance,
  ...rest
}) => ({
  name: name || '',
  laff: laff || null,
  claimable: claimable || '0',
  address: address || '',
  balance: balance || '',
  ...rest,
})

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

    getGameActivationFee = () => {
      const { web3: { utils } } = this
      return this.numberGame.methods.gameAtivationFee_().call()
        .then(fee => div(fee, utils.unitMap.ether))
    }

    startNumberGame = ({ address, fee }) => {
      const { numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .startGame()
        .send({
          from: address,
          value: mul(fee, utils.unitMap.ether),
        })
    }

    /* eslint-disable no-underscore-dangle */
    getCurrentLotteryPotAmount = () => this.numberGame.methods
      .currentLottryPot_()
      .call()
      .then(amount => div(amount, this.web3.utils.unitMap.ether))

    getGameCount = () => {
      const { numberGame } = this
      return numberGame
        .methods
        .totalGameCount_()
        .call()
    }

    getGames = () => this.getGameCount()
      .then(gameCount => Promise.all(
        range(1, Number(gameCount) + 1).map(gameId => this.getGameById(gameId)),
      )
        .then(games => games.map((game, gameIndex) => omit(Object.assign({}, game, { id: gameIndex + 1, status: (moment(game.endTime).diff(moment()) > 0) ? 'active' : 'finished' }), 'winningAmount'))))

    /* eslint-disable no-underscore-dangle */
    getUserInformationWithAddress = (address) => {
      const { methods } = this.playerBook
      return methods.pIDxAddr_(address)
        .call()
        .then((id) => {
          if (id === '0' || id === 0) return this.getWalletInfoWithAddress(address)
          return this.getUserInformationWithId(id)
        })
    }

    /* eslint-disable no-underscore-dangle */
    getUserInformationWithId = (id) => {
      const { utils: { toUtf8, unitMap } } = this.web3
      return this.playerBook.methods.plyr_(id).call()
        .then(data => this
          .getWalletInfoWithAddress(data.addr)
          .then(({ balance }) => UserType({
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

    playerNameTaken = (name) => {
      const { web3: { utils }, playerBook } = this
      return playerBook
        .methods
        .pIDxName_(utils.toHex(name))
        .call()
        .then(id => id !== '0' || name === 'wayne')
    }

    playerIdExist = (id) => {
      const { playerBook } = this
      return playerBook
        .methods
        .plyr_(id)
        .call()
        .then(player => player.addr !== '0x0000000000000000000000000000000000000000')
    }

    registerUser = ({ name, laffId, accountAddress }) => {
      const { playerBook, web3: { utils } } = this
      return playerBook
        .methods
        .registrationFee_()
        .call()
        .then(fee => playerBook
          .methods
          .registerPlayer(
            utils.toHex(name),
            laffId,
          )
          .send({
            from: accountAddress,
            value: fee,
          }))
    }

    getKeyPrice = () => {
      const { numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .keyPrice_()
        .call()
        .then(keyPrice => div(keyPrice, utils.unitMap.ether))
    }

    buyKeys = ({ address, keys }) => {
      const { numberGame, web3: { utils } } = this
      return this
        .getKeyPrice()
        .then(price => numberGame
          .methods
          .buyKeys(keys)
          .send({
            from: address,
            value: mul(price, '1.1', utils.unitMap.ether, keys.length),
          }))
    }

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
        playerNameTaken,
        playerIdExist,
        registerUser,
        getGames,
        getGameCount,
        startNumberGame,
        getGameActivationFee,
        getKeyPrice,
        buyKeys,
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
            playerNameTaken,
            playerIdExist,
            registerUser,
            getGames,
            getGameCount,
            startNumberGame,
            getGameActivationFee,
            getKeyPrice,
            buyKeys,
          }}
          getCurrentMetaAccount={getCurrentMetaAccount}
        />
      )
    }
  }
}
export default withContracts
