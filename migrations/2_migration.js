const Game = artifacts.require("./NumberGame.sol")

module.exports = function(deployer) {
  return deployer.deploy(Game)
}
