/* eslint-disable */
const path = require('path')
const PlayerBook = artifacts.require("./PlayerBook.sol")

const playerBookJSON = require(path.resolve(process.env.PWD, 'build','contracts', 'PlayerBook.json'))

module.exports = async (deployer) => {
  await deployer.deploy(PlayerBook)
  const playerBookDeployedAddress = playerBookJSON.networks['5777'].address
  const gamePath = path.resolve(process.env.PWD, 'contracts', 'Game.sol')
  const data = fs.readFileSync(gamePath, 'utf8')
  const dataWithNewAddress = data.replace(new RegExp('(?<=address constant playbookContractAddress_ =)(.*)(?=;)'), playerBookDeployedAddress)
  fs.writeFileSync(gamePath, dataWithNewAddress, 'utf8')
  const Game = artifacts.require("./Game.sol")
  await deployer.deploy(Game)
  console.log('done');
}
