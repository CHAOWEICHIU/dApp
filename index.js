const ganache = require('ganache-cli')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')

const compile = require('./scripts/compile')
const { systemLogger } = require('./utils/logger')
const deploy = require('./scripts/deploy')

require('dotenv').config()

const {
  META_MASK_MNEMONIC,
  INFURA_RINKEBY_ENDPOINT,
} = process.env


const start = (async() => {
  const provider = new HDWalletProvider('oil wife tourist entire wealth actress stumble miracle rebel program hello stairs', 'http://127.0.0.1:7545')
  // const provider = ganache.provider()
  
  const { contracts } = await compile({ contractPathFromRoot: 'contracts/Token/WeiCobToken.sol' })

  const inboxContract = contracts[':ERC20']
  

  const result = await deploy({
    contractInterface: inboxContract.interface,
    contractBytecode: inboxContract.bytecode,
    provider,
  })

})
start()




