import React from 'react'
import Web3 from 'web3'
import moment from 'moment'
import range from 'lodash/range'
import { div, mul } from '../utils/calculation'
import PlayerBookContract from '../build/contracts/PlayerBook.json'
import NumberGameContract from '../build/contracts/NumberGame.json'

const timestampFromUintToNumber = uint => Number(mul(uint, '1000'))

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
        PlayerBookContract.abi,
        PlayerBookContract.networks['5777'].address,
      )
      const numberGame = new web3.eth.Contract(
        NumberGameContract.abi,
        NumberGameContract.networks['5777'].address,
      )
      this.playerBook = playerBook
      this.numberGame = numberGame
      this.web3 = web3
    }

    getCurrentMetaAccount = () => this.web3.eth.getAccounts().then(([acc]) => acc)

    getSnapshotWinner = ({ round }) => {
      const { numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .getSnapshotWinner(round)
        .call()
        .then(data => ({
          timestamp: timestampFromUintToNumber(data['0']),
          name: utils.toUtf8(data['1']),
          number: data['2'],
        }))
    }

    /* eslint-disable no-underscore-dangle */
    getGameById = (id) => {
      const { getUserInformationWithAddress, numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .games_(id)
        .call()
        .then(game => getUserInformationWithAddress(game.bankerAddress)
          .then((banker) => {
            const data = ({
              startTime: timestampFromUintToNumber(game.startTime),
              endTime: timestampFromUintToNumber(game.endTime),
              banker,
              winningAmount: div(game.totalAmount, utils.unitMap.ether),
            })
            return data
          }))
    }

    getGameActivationFee = () => {
      const { web3: { utils } } = this
      return this.numberGame.methods.gameActivationFee_().call()
        .then(fee => div(fee, utils.unitMap.ether))
    }

    getSnapshotWinnerFee = () => {
      const { web3: { utils } } = this
      return this.numberGame.methods.snapshotWinnerFee_().call()
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
        .then(games => games.map((game, gameIndex) => Object.assign({}, game, { id: gameIndex + 1, status: (moment(game.endTime).diff(moment()) > 0) ? 'active' : 'finished' }))))

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
      if (!id) return Promise.resolve(null)
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

    getKeysSnapshotCount = ({ round, key }) => {
      const { numberGame } = this
      return numberGame
        .methods
        .getKeysSnapshotCount(round, key)
        .call()
        .then(data => ({
          timestamp: timestampFromUintToNumber(data['0']),
          count: data['1'],
        }))
    }

    getSnapshotKeyPrice = () => {
      const { numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .keyRevealFee_()
        .call()
        .then(keyPrice => div(keyPrice, utils.unitMap.ether))
    }

    buyKeys = ({ address, keys, round }) => {
      const { numberGame, web3: { utils } } = this
      return this
        .getKeyPrice()
        .then(price => numberGame
          .methods
          .buyKeys(round, keys)
          .send({
            from: address,
            value: mul(price, '1.1', utils.unitMap.ether, keys.length),
          }))
    }

    snapshotKeys = ({ address, keys, round }) => {
      const { numberGame, web3: { utils } } = this
      return this
        .getSnapshotKeyPrice()
        .then(price => numberGame
          .methods
          .snapshotKeys(round, keys)
          .send({
            from: address,
            value: mul(price, '1.1', utils.unitMap.ether, keys.length),
          }))
    }

    snapshotWinner = ({ address, round, price }) => {
      const { numberGame, web3: { utils } } = this
      return numberGame
        .methods
        .snapshotWinner(round)
        .send({
          from: address,
          value: mul(price, utils.unitMap.ether),
        })
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
        getSnapshotKeyPrice,
        buyKeys,
        snapshotKeys,
        snapshotWinner,
        getKeysSnapshotCount,
        getSnapshotWinner,
        getSnapshotWinnerFee,
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
            getSnapshotKeyPrice,
            getKeyPrice,
            buyKeys,
            snapshotKeys,
            snapshotWinner,
            getKeysSnapshotCount,
            getSnapshotWinner,
            getSnapshotWinnerFee,
          }}
          getCurrentMetaAccount={getCurrentMetaAccount}
        />
      )
    }
  }
}
export default withContracts
