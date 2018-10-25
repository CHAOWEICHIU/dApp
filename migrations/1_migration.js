/* eslint-disable */
const path = require('path')
const fs = require('fs')
const promisify = require('util-promisify')
const { toChecksumAddress } = require('ethereumjs-util')
const exec = promisify(require('child_process').exec)
const PlayerBook = artifacts.require("./PlayerBook.sol")
const testEnv = process.env.NODE_ENV === 'test'

const playerBookJSON = require(path.resolve(process.env.PWD, 'build','contracts', 'PlayerBook.json'))

module.exports = async (deployer) => {
  return deployer
    .deploy(
      testEnv
        ? [PlayerBook, artifacts.require("./TestContract.sol")]
        : PlayerBook
      )
    .then((instance) => {
      if(!testEnv) {
        const gamePath = path.resolve(process.env.PWD, 'contracts', 'NumberGame.sol')
        const data = fs.readFileSync(gamePath, 'utf8')
        const dataWithNewAddress = data.replace(new RegExp('(?<=address constant playbookContractAddress_ =)(.*)(?=;)'), ` ${toChecksumAddress(instance.address)}`)
        return fs.writeFileSync(gamePath, dataWithNewAddress, 'utf8')
      }
      return instance
    })
    .then((instance) => {
      if(!testEnv) {
        return exec('truffle compile')
      }
      return instance
    })
}

