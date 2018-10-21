const solc = require('solc')
const path = require('path')
const fs = require('fs')
const mapKeys = require('lodash/mapKeys')
const forEach = require('lodash/forEach')
const { systemLogger } = require('../utils/logger')

const contracts = [
  {
    contractFilePath: path.resolve(process.env.PWD, 'contracts', 'Game', 'PlayerBook.sol'),
  },
  {
    contractFilePath: path.resolve(process.env.PWD, 'contracts', 'Game', 'Game.sol'),
  },
]


const compile = ({ filePath }) => {
  const source = fs.readFileSync(filePath, 'utf8')
  return solc.compile(source, 1)
}

const startCompile = (async () => {
  const compliedContracts = await contracts
    .map(contract => compile({ filePath: contract.contractFilePath }))

  forEach(compliedContracts, (compliedContract) => {
    mapKeys(compliedContract.contracts, (value, key) => {
      systemLogger({ message: `${key} complied` })

      fs.writeFileSync(
        path.resolve(process.env.PWD, '.contracts', `${key.slice(1, key.length)}.js`),
        `
const contractInterface = ${value.interface}

const contractInterfaceBytecode = '${value.bytecode}'

module.exports = {
  contractInterface,
  contractInterfaceBytecode,
}
        `,
      )
    })
  })
})

startCompile()
