const Web3 = require('web3')

const deploy = async({
  contractInterface,
  contractBytecode,
  provider,
}) => {
  const web3 = new Web3(provider)
  const accounts = await web3.eth.getAccounts()
  
  const deployment = await new web3
    .eth
    .Contract(JSON.parse(contractInterface))
    .deploy({ data: contractBytecode, arguments: [] })
    .send({
      from: accounts[0],
      gas: 1000000000,
      gasPrice: 100000000000,
    })
  
  return Promise.resolve(deployment)

}

module.exports = deploy
