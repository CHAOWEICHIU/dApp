pragma solidity ^0.4.23;

contract GameMushroom {

    struct Game {
        address[] participantesAddress;
    }


    modifier meetDepositRequirement(uint256 fee)
    {
        require(msg.value >= fee, "fee does not meet requirement");
        _;
    }

    uint256 public gameActivationFee_ = 0.001 ether;
    uint256 public gamesCount_;
    mapping(uint256 => Game) games_;

    function registerMushroomGame()
      public
      meetDepositRequirement(gameActivationFee_)
      payable
    {
        gamesCount_++;
        games_[gamesCount_];
    }

}
