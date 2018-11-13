/* global artifacts it contract assert */

const Web3 = require('web3')
const { toChecksumAddress } = require('ethereumjs-util')

const PlayerBookV2 = artifacts.require('./PlayerBookV2.sol')
const {
  div,
  mul,
  sub,
} = require('../utils/calculation')

const { utils } = Web3

contract('PlayerBookV2', async (accounts) => {
  const [
    account1,
    account2,
    account3,
    account4,
  ] = accounts
  const playerBookV2 = await PlayerBookV2.deployed()

  const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
  const playerBook = new web3.eth.Contract(
    playerBookV2.abi,
    playerBookV2.address,
  )

  const {
    totalUserCount,
    registerUser,
    registrationFee_,
    user_,
    uIdWallet_,
    deposit,
  } = playerBook.methods

  it('can register user, and will match user init state', async () => {
    const registrationFee = await registrationFee_().call()
    const registerName = 'Q__Q'
    const registerAffiliateId = 1
    await registerUser(
      utils.toHex(registerName),
      registerAffiliateId,
    )
      .send({
        from: account2,
        value: registrationFee,
        gas: 3500000,
      })
    const userCount = await totalUserCount().call()
    const user = await user_(userCount).call()
    assert.isTrue(userCount === '2')
    assert.isTrue(
      toChecksumAddress(user.wallet) === toChecksumAddress(account2),
      'registered wallet is not the one who registered',
    )
    assert.isTrue(
      utils.toUtf8(user.name) === registerName,
      'name is different',
    )
    assert.isTrue(
      user.affiliateId === registerAffiliateId.toString(),
      'affiliateId is different',
    )
    assert.isTrue(
      user.claimable === '0',
      'not matching to init claimable',
    )
    assert.isTrue(
      user.level === '1',
      'not matching to init level',
    )
  })
  it('will throw error if a user use the same name', async () => {
    const registrationFee = await registrationFee_().call()
    try {
      await registerUser(
        utils.toHex('Q__Q'),
        1,
      )
        .send({
          from: account2,
          value: registrationFee,
          gas: 3500000,
        })
    } catch (error) {
      return
    }
    const userCount = await totalUserCount().call()
    assert.isTrue(userCount === '2')
    assert.fail('Expected throw not received')
  })
  it('will throw error if a user use the same address', async () => {
    const registrationFee = await registrationFee_().call()
    try {
      await registerUser(
        utils.toHex('Q_Q'),
        1,
      )
        .send({
          from: account2,
          value: registrationFee,
          gas: 3500000,
        })
    } catch (error) {
      return
    }
    const userCount = await totalUserCount().call()
    assert.isTrue(userCount === '2')
    assert.fail('Expected throw not received')
  })

  it('affiliate id cannot be self when registering', async () => {
    const registrationFee = await registrationFee_().call()
    const userCount = await totalUserCount().call()
    try {
      await registerUser(
        utils.toHex('Q___Q'),
        Number(userCount) + 1,
      )
        .send({
          from: account3,
          value: registrationFee,
          gas: 3500000,
        })
    } catch (error) {
      return
    }
    assert.isTrue(userCount === '2')
    assert.fail('Expected throw not received')
  })
  it('can register if id has decimal, solidity will fall back to integer', async () => {
    const registrationFee = await registrationFee_().call()

    await registerUser(
      utils.toHex('Q___Q'),
      2.9999999999999,
    )
      .send({
        from: account3,
        value: registrationFee,
        gas: 3500000,
      })

    const userCount = await totalUserCount().call()
    const user = await user_(userCount).call()

    assert.isTrue(
      userCount === '3',
      'has 3 users',
    )
    assert.isTrue(
      user.affiliateId === '2',
      'will fall back to if decimal is provided',
    )
    assert.isTrue(
      toChecksumAddress(user.wallet) === toChecksumAddress(account3),
    )
  })

  it('85% will goes to second user, and 15% will goes to affiliate', async () => {
    const depositAmount = utils.toWei('1', 'ether')
    const registrationFee = await registrationFee_().call()
    const snapshotUserCount = await totalUserCount().call()

    await registerUser(
      utils.toHex('Q____Q'),
      snapshotUserCount,
    )
      .send({
        from: account4,
        value: registrationFee,
        gas: 3500000,
      })

    await deposit(
      account4,
    ).send({
      from: account4,
      value: depositAmount,
      gas: 3500000,
    })
    const userCount = await totalUserCount().call()
    assert.isTrue(
      userCount === (Number(snapshotUserCount) + 1).toString(),
      `user count should be ${Number(snapshotUserCount) + 1}`,
    )

    const user4 = await user_(Number(snapshotUserCount) + 1).call()
    const affiliateUser = await user_(user4.affiliateId).call()

    assert.isTrue(
      mul(div(depositAmount, '100'), '85') === user4.claimable,
      'user should have 85%',
    )
    assert.isTrue(
      mul(div(depositAmount, '100'), '15') === affiliateUser.claimable,
      'affiliate should have 10%',
    )
  })
})
