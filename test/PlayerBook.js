/* eslint-disable */
const Web3 = require('web3')
const { toChecksumAddress } = require('ethereumjs-util')
const PlayerBookV2 = artifacts.require("./PlayerBookV2.sol")

const { utils } = Web3


contract('PlayerBookV2', async (accounts) => {
    const [ firstAccount, secondAccount ] = accounts
    const playerBookV2 = await PlayerBookV2.deployed();

    const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
    const playerBook = new web3.eth.Contract(
      playerBookV2.abi,
      playerBookV2.address
    )

    const {
      totalUserCount,
      registerUser,
      registrationFee_,
      user_,
    } = playerBook.methods

    it('can register user, and will match user init state', async () => {
      const registerName = 'Q__Q'
      const registerAffiliateId = 1
      const fee = await registrationFee_().call()
      await registerUser(
        utils.toHex(registerName),
        registerAffiliateId
      )
      .send({
        from: firstAccount,
        value: fee,
        gas: 3500000,
      })
      const userCount = await totalUserCount().call()
      assert.isTrue(userCount === '2')

      const user = await user_(userCount).call()
      
      assert.isTrue(
        toChecksumAddress(user.wallet) === toChecksumAddress(firstAccount),
        'registered wallet is not the one who registered',
      )
      assert.isTrue(
        utils.toUtf8(user.name) === registerName,
        'name is different',
      )
      assert.isTrue(
        user.affiliateId == registerAffiliateId,
        'affiliateId is different',
      )
      assert.isTrue(
        user.claimable === '0',
        'not matching to init claimable',
      )
      assert.isTrue(
        user.level === '1',
        'not matching to init level'
      )
    })
    it('will throw error if a user use the same name', async () => {
      try {
        await registerUser(
          utils.toHex('Q__Q'),
          1
        )
        .send({
          from: firstAccount,
          value: fee,
          gas: 3500000,
        })
      } catch(error) {
        return
      }
      assert.fail('Expected throw not received')
    })
    
})
