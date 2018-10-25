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
    address constant playbookContractAddress_ = 0x811128cf810016f805dad24c31AD19bC7537f8A1;

    PlayerBookInterface constant private PlayerBook = PlayerBookInterface(playbookContractAddress_);
    
    modifier isRegisteredUser
    {
        bytes32 userName = PlayerBook.getPlayerName(msg.sender);
        require(userName != "0", "user does not exist");
        _;
    }

    modifier meetDepositRequirement(uint256 _fee)
    {
        require(msg.value >= _fee, "fee does not meet requirement");
        _;
    }

    uint256 public keyPrice_ = 0.5 ether;
    uint256 public gameActivationFee_ = 1 ether;
    uint256 public totalGameCount_ = 0;
    uint256 public currentLottryPot_ = 0;
    uint256 public keyRevealFee_ = 0.2 ether;
    uint256 public snapshotWinnerFee_ = 5 ether;

    mapping (uint256 => Game) public games_;
    
    struct SnapshotKey {
        uint256 timestamp;
        uint256 count;
    }
    
    struct Game {
        address bankerAddress;
        uint256 totalAmount;
        uint gameTotalTime;
        uint startTime;
        uint endTime;
        bytes32 winnerName;
        address winnerAddress;
        uint256 winnerNumber;
        uint winnerTimestamp;
        bytes32[] participantes;
        mapping(uint256 => uint256) keys;
        mapping(uint256 => SnapshotKey) snapshotKeys;
        mapping(bytes32 => uint256[]) userKeys;
    }
    
    // Internal Function

    function min(uint256[] data)
        internal
        pure
        returns (uint256) 
    {
        uint256 minimal = data[0];
        for(uint256 i;i < data.length;i++){
            if(data[i] < minimal){
                minimal = data[i];
            }
        }
        return minimal;
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
    
    function moneyDistribution(
        uint256 _gameRound,
        uint256 _amount
    )
        internal
    {
        uint256 depositAmount = _amount;
        uint256 portionAmount = depositAmount.div(10);
        
        uint256 goOutAmount = portionAmount;
        uint256 gameLotteryPotAmount = portionAmount;
        uint256 gameWinningPotAmount = depositAmount.sub(portionAmount).sub(goOutAmount).sub(gameLotteryPotAmount);
        
        games_[_gameRound].totalAmount = games_[_gameRound].totalAmount + gameWinningPotAmount;
        currentLottryPot_ = currentLottryPot_ + gameLotteryPotAmount;
        PlayerBook.deposit.value(goOutAmount)();
    }
    
    function currentWinner(uint256 _gameRound)
        internal
        view
        returns (
            bytes32,
            uint256
        )
    {   
        bytes32 tempWinner;
        uint256 tempWinningNumber;
        Game storage currentGame = games_[_gameRound];
        bytes32[] memory participantes = currentGame.participantes;
        for (uint i = 0; i < participantes.length; i++) {
            uint256[] memory tempUserKeys = currentGame.userKeys[participantes[i]];
            for(uint o = 0; o < tempUserKeys.length; o++) {
                if(tempWinningNumber == 0 && min(tempUserKeys) != 0 && currentGame.keys[min(tempUserKeys)] <= 1) {
                    tempWinningNumber = min(tempUserKeys);
                    tempWinner = participantes[i];
                }
                if(tempWinningNumber != 0 && min(tempUserKeys) != 0 && currentGame.keys[min(tempUserKeys)] <= 1 && tempWinningNumber > min(tempUserKeys)) {
                    tempWinningNumber = min(tempUserKeys);
                    tempWinner = participantes[i];
                }
            }
        }
        return (
            tempWinner,
            tempWinningNumber
        );
    }
    
    function random() internal view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%100);
    }
    
    // Read Only Function

    function getCurrentFinishGameReward(uint256 _gameRound)
        public
        view
        returns (
            uint256
        )
    {
        Game memory targetGame = games_[_gameRound];
        
        return (
            targetGame.totalAmount.div(10)
        );
    }
    
    function getKeysSnapshotCount(uint256 _gameRound, uint256 _key)
        public
        view
        returns(
            uint256,
            uint256
        )
    {
        return (
            games_[_gameRound].snapshotKeys[_key].timestamp,
            games_[_gameRound].snapshotKeys[_key].count
        );
    }
    
    function getSnapshotWinner(uint256 _gameRound)
        public
        view
        returns (
            uint,
            bytes32,
            uint256
        )
    {
        Game storage currentGame = games_[_gameRound];
        return (
            currentGame.winnerTimestamp,
            currentGame.winnerName,
            currentGame.winnerNumber    
        );
    }   
    
    // Payable Function

    function finishGame(uint256 _gameRound)
        public
        isRegisteredUser
        payable
    {
        Game storage targetGame = games_[_gameRound];
        address defaultAddress;
        require(targetGame.endTime <= block.timestamp, "Game yet to be finished");
        require(targetGame.winnerAddress != defaultAddress, "Winner has been claimed");
        (uint256 rewardAmount) = getCurrentFinishGameReward(_gameRound);
        PlayerBook.deposit.value(rewardAmount)();
    }

    function startGame()
      public
      isRegisteredUser
      meetDepositRequirement(gameActivationFee_)
      payable
    {
        address bankerAddress = msg.sender;
        uint256 depositAmount = msg.value;

        totalGameCount_++;
        games_[totalGameCount_].bankerAddress = bankerAddress;
    
        moneyDistribution(totalGameCount_, depositAmount);
        
        games_[totalGameCount_].gameTotalTime = 12 hours;
        games_[totalGameCount_].startTime = now;
        games_[totalGameCount_].endTime = now + 12 hours;

        emit onGameStart(
            bankerAddress,
            PlayerBook.getPlayerName(bankerAddress),
            now,
            games_[totalGameCount_].totalAmount,
            totalGameCount_
        );
    }
    
    function snapshotKeys(uint256 _gameRound ,uint256[] _keys)
        public
        isRegisteredUser
        meetDepositRequirement(keyRevealFee_.mul(_keys.length))
        payable
    {
        Game storage currentGame = games_[_gameRound];
        uint256 depositAmount = msg.value;
        moneyDistribution(_gameRound, depositAmount);

        for (uint i = 0; i < _keys.length; i++) {
            currentGame.snapshotKeys[_keys[i]].count = currentGame.keys[_keys[i]];
            currentGame.snapshotKeys[_keys[i]].timestamp = block.timestamp;
        }
    }
    
    function buyKeys(uint256 _gameRound, uint256[] _keys)
      public
      isRegisteredUser
      meetDepositRequirement(keyPrice_.mul(_keys.length))
      payable
    {
        address playerAddress = msg.sender;
        Game storage currentGame = games_[_gameRound];
        bytes32 userName = PlayerBook.getPlayerName(playerAddress);
        
        uint256 lotteryMoney = msg.value.div(10);
        uint256 winningAmount = msg.value.div(10).mul(8);
        uint256 potPassingIncomeAmount = msg.value.div(10);
        PlayerBook.deposit.value(potPassingIncomeAmount)();
        currentLottryPot_ = currentLottryPot_.add(lotteryMoney);
        currentGame.totalAmount = currentGame.totalAmount.add(winningAmount);
        
        
        if(currentGame.userKeys[userName].length == 0) {
            currentGame.participantes.push(userName);
        }
        
        for (uint i = 0; i < _keys.length; i++) {
            currentGame.userKeys[userName].push(_keys[i]);
            uint256 keyCount = currentGame.keys[_keys[i]];

            
            if(keyCount == 0) {
                // Create Key if is not exist
                currentGame.keys[_keys[i]] = 1;
            } else {
                // Add Count if key exist
                currentGame.keys[_keys[i]] = keyCount + 1;
            }
            
            playLottry();
        }
    }
    
    function snapshotWinner(uint256 _gameRound)
        public
        isRegisteredUser
        meetDepositRequirement(snapshotWinnerFee_)
        payable
    {
        Game storage currentGame = games_[_gameRound];
        uint256 depositAmount = msg.value;
        moneyDistribution(_gameRound, depositAmount);

        (bytes32 winnerName, uint256 winningNumber) = currentWinner(_gameRound);

        currentGame.winnerName = winnerName;
        currentGame.winnerNumber = winningNumber;
        currentGame.winnerTimestamp = block.timestamp;
    }
    
}
