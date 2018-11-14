const Game = artifacts.require("./NumberGame.sol")
const Mushroom = artifacts.require("./Mushroom.sol")
const PlayerBookV2 = artifacts.require("./PlayerBookV2.sol")
const GameMushroom = artifacts.require("./GameMushroom.sol")

module.exports = function(deployer) {
  return deployer.deploy([Game, Mushroom, PlayerBookV2, GameMushroom])
}
