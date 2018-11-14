/* global artifacts it contract assert */

const Web3 = require('web3')
// const { toChecksumAddress } = require('ethereumjs-util')

const GameMushroom = artifacts.require('./GameMushroom.sol')
// const {
//   div,
//   mul,
//   add,
//   sub,
//   lt,
// } = require('../utils/calculation')

// const { utils } = Web3

contract('GameMushroom', async (accounts) => {
  const [
    account1,
  ] = accounts
  const gameMushroom = await GameMushroom.deployed()
  const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  const mushroom = new web3.eth.Contract(
    gameMushroom.abi,
    gameMushroom.address,
  )

  // const { eth: { getBalance } } = web3

  const {
    registerMushroomGame,
    gameActivationFee_,
    gamesCount_,
  } = mushroom.methods

  it('pass', async () => {
    const registrationFee = await gameActivationFee_().call()
    await registerMushroomGame()
      .send({
        from: account1,
        value: registrationFee,
        gas: 3500000,
      })
    const gameCount = await gamesCount_().call()
    assert.isTrue(gameCount === '1')
  })
})
