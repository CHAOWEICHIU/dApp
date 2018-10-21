pragma solidity ^0.4.19;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that revert on error
 */
library SafeMath {

  /**
  * @dev Multiplies two numbers, reverts on overflow.
  */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
      // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
      // benefit is lost if 'b' is also tested.
      // See: https://github.com/OpenZeppelin/openzeppelin-solidity/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b);

        return c;
    }

  /**
  * @dev Integer division of two numbers truncating the quotient, reverts on division by zero.
  */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0); // Solidity only automatically asserts when dividing by 0
        uint256 c = a / b;
      // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

  /**
  * @dev Subtracts two numbers, reverts on overflow (i.e. if subtrahend is greater than minuend).
  */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a);
        uint256 c = a - b;

        return c;
    }

  /**
  * @dev Adds two numbers, reverts on overflow.
  */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a);

        return c;
    }

  /**
  * @dev Divides two numbers and returns the remainder (unsigned integer modulo),
  * reverts when dividing by zero.
  */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b != 0);
        return a % b;
    }
}


interface PlayerBookInterface {
    function getPlayerName(address _addr) external view returns(bytes32);
    function deposit() external payable returns(bool);
}

contract GameEvents {
    event onLotteryWin
    (
        address indexed playerAddress,
        bytes32 indexed playerName,
        uint256 timeStamp,
        uint256 winningAmount
    );
    event onGameStart
    (
        address indexed bankerAddress,
        bytes32 indexed bankerName,
        uint256 timeStamp,
        uint256 initialAmount,
        uint256 round
    );
    
}


contract NumberGame is GameEvents {
    using SafeMath for uint256;
    address constant playbookContractAddress_ = 0x36D0c69bbe0b92617CEC03364e55cA44D8918614;

    PlayerBookInterface constant private PlayerBook = PlayerBookInterface(playbookContractAddress_);

    uint256 public keyPrice_ = 0.1 ether;
    uint256 public gameAtivationFee_ = 1 ether;
    uint256 public totalGameCount_ = 0;
    uint256 public currentLottryPot_ = 0;

    uint256 private rand_;

    mapping (uint256 => Game) public games_;

    struct Game {
        address bankerAddress;
        address winnerAddress;
        uint256 rand;
        uint256 totalAmount;
        uint gameTotalTime;
        uint startTime;
        uint endTime;
        mapping(bytes32 => bytes32[]) userKeys;
    }

    function hashHelper(uint _value, uint _rand) public pure returns(bytes32) {
        return keccak256(abi.encodePacked(_value, _rand));
    }
    
    function random() public view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%100);
    }

    function startGame()
      public
      payable
      returns (bool)
    {
        address bankerAddress = msg.sender;
        uint256 depositAmount = msg.value;
        require (depositAmount >= gameAtivationFee_, "umm.....  you have to pay the name fee");
        totalGameCount_++;
        require(games_[totalGameCount_].endTime < now, "game in progress");
        games_[totalGameCount_].bankerAddress = bankerAddress;


        currentLottryPot_ = depositAmount.sub(10);
        uint256 goOutAmount = depositAmount.sub(10);
        PlayerBook.deposit.value(goOutAmount)();

        games_[totalGameCount_].totalAmount = games_[totalGameCount_].totalAmount + depositAmount.sub(10).mul(8);
        
        games_[totalGameCount_].gameTotalTime = 12 hours;
        games_[totalGameCount_].startTime = now;
        games_[totalGameCount_].endTime = now + 12 hours;

        // change rand key
        rand_ = now % block.number;
        emit onGameStart(
            bankerAddress,
            PlayerBook.getPlayerName(bankerAddress),
            now,
            games_[totalGameCount_].totalAmount,
            totalGameCount_
        );
        return (true);
    }
    
    function getKeys()
        public
        view
        returns(bytes32[])
    {
        Game storage currentGame = games_[totalGameCount_];
        address playerAddress = msg.sender;
        bytes32 userName = PlayerBook.getPlayerName(playerAddress);
        return currentGame.userKeys[userName];
    }

    function buyKeys(uint256[] _keys)
      public
      payable
    {
        address playerAddress = msg.sender;
        Game storage currentGame = games_[totalGameCount_];
        bytes32 userName = PlayerBook.getPlayerName(playerAddress);
        uint256 costTotalKeys = keyPrice_.mul(_keys.length);

        require(msg.value > costTotalKeys, "Not enough money");
        
        uint256 lotteryMoney = msg.value.sub(10);
        uint256 winningAmount = msg.value.sub(10).mul(8);
        uint256 potPassingIncomeAmount = msg.value.sub(10);
        PlayerBook.deposit.value(potPassingIncomeAmount)();
        currentLottryPot_ = currentLottryPot_.add(lotteryMoney);
        currentGame.totalAmount = currentGame.totalAmount.add(winningAmount);
        
        for (uint i = 0; i < _keys.length; i++) {
            currentGame.userKeys[userName].push(hashHelper(_keys[i], rand_));
            playLottry();
        }
    }
    
    function playLottry()
        internal
        returns(bool)
    {
        if(random() > 50) {
            PlayerBook.deposit.value(currentLottryPot_)();
            currentLottryPot_ = 0;
            return (true);
            emit onLotteryWin(
                msg.sender,
                PlayerBook.getPlayerName(msg.sender),
                now,
                currentLottryPot_
            );
        }
        return (false);
    }
}
