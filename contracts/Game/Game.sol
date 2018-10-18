pragma solidity ^0.4.19;

import "../Math/SafeMath.sol";

contract NumberGame {
    using SafeMath for uint256;

    uint256 public gameAtivationFee_ = 1 ether;
    uint256 public totalGameCount_ = 0;
    uint256 public currentLottryPot_ = 0;
    mapping (uint256 => Game) public games_;

    struct Game {
        address bankerAddress;
        address winnerAddress;
        uint256 totalAmount;
        uint gameTotalTime;
        uint startTime;
        uint endTime;
    }

    function startGame()
      public
      payable
    {
        address bankerAddress = msg.sender;
        uint256 depositAmount = msg.value;
        require (depositAmount >= gameAtivationFee_, "umm.....  you have to pay the name fee");
        totalGameCount_++;
        require(games_[totalGameCount_].endTime < now, "game in progress");
        games_[totalGameCount_].bankerAddress = bankerAddress;


        currentLottryPot_ = depositAmount.sub(10).div(1);
        // uint256 goOutAmount = depositAmount.sub(10).div(1);
        // call PlayBook deposit function

        games_[totalGameCount_].totalAmount = games_[totalGameCount_].totalAmount + depositAmount.sub(10).div(8);
        
        games_[totalGameCount_].gameTotalTime = 12 hours;
        games_[totalGameCount_].startTime = now;
        games_[totalGameCount_].endTime = now + 12 hours;
    }

}
