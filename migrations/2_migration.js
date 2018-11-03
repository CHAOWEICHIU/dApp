const Game = artifacts.require("./NumberGame.sol")
const Mushroom = artifacts.require("./Mushroom.sol")


module.exports = function(deployer) {
  return deployer.deploy([Game, Mushroom])
}
