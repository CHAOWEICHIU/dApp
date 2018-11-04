pragma solidity ^0.4.23;

import "./SafeMath.sol";

interface PlayerBookInterface {
    function getPlayerName(address _addr) external view returns(bytes32);
    function deposit(address _addr) external payable returns(bool);
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
    address constant playbookContractAddress_ = 0xebd389b4267E23102F885b96f012c0eD38749E6A;

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

    modifier areIntegers(uint256[] _num)
    {
        for(uint256 i;i < _num.length;i++){
            require(returnTrueIfIsInterger(_num[i]), "number must be integer");
        }
        _;
    }

    modifier isInteger(uint256 _num)
    {
        require(returnTrueIfIsInterger(_num), "number must be integer");
        _;
    }

    uint256 public keyPrice_ = 0.5 ether;
    uint256 public gameActivationFee_ = 1 ether;
    uint256 public totalGameCount_ = 0;
    uint256 public currentLotteryPot_ = 0;
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
        address[] participantesAddress;
        mapping(uint256 => uint256) keys;
        mapping(uint256 => SnapshotKey) snapshotKeys;
        mapping(bytes32 => uint256[]) userKeys;
    }

    // Internal Function

    function returnTrueIfIsInterger(uint256 num)
        internal
        pure
        returns (bool)
    {
        // Todo
        if(num != 0) {
            return (true);
        }
        return (false);
    }

    function min(uint256[] data)
        internal
        pure
        returns (uint256) 
    {
        if(data.length == 0) {
            return 0;
        }
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
        address depositPerson = msg.sender;
        if(random() > 50) {
            PlayerBook.deposit.value(currentLotteryPot_)(depositPerson);
            currentLotteryPot_ = 0;
            return (true);
            emit onLotteryWin(
                depositPerson,
                PlayerBook.getPlayerName(depositPerson),
                block.timestamp,
                currentLotteryPot_
            );
        }
        return (false);
    }
    
    function moneyDistribution(
        uint256 _gameRound,
        uint256 _amount,
        address _personAddress
    )
        internal
    {
        uint256 depositAmount = _amount;
        uint256 portionAmount = depositAmount.div(10);
        
        uint256 goOutAmount = portionAmount;
        uint256 gameLotteryPotAmount = portionAmount;
        uint256 gameWinningPotAmount = depositAmount.sub(goOutAmount).sub(gameLotteryPotAmount);
        
        games_[_gameRound].totalAmount = games_[_gameRound].totalAmount.add(gameWinningPotAmount);
        currentLotteryPot_ = currentLotteryPot_.add(gameLotteryPotAmount);
        PlayerBook.deposit.value(goOutAmount)(_personAddress);
    }
    
    function currentWinner(uint256 _gameRound)
        internal
        view
        returns (
            bytes32,
            uint256,
            address
        )
    {   
        bytes32 tempWinner;
        uint256 tempWinningNumber;
        address tempWinnerAddress;
        Game storage currentGame = games_[_gameRound];
        bytes32[] memory participantes = currentGame.participantes;
        for (uint i = 0; i < participantes.length; i++) {
            uint256[] memory tempUserKeys = currentGame.userKeys[participantes[i]];
            for(uint o = 0; o < tempUserKeys.length; o++) {
                uint256 targetKey = tempUserKeys[o];
                bool countIsOne = currentGame.keys[targetKey] == 1;
                if(
                    (tempWinningNumber == 0 && countIsOne == true) ||
                    (tempWinningNumber == 0 && countIsOne == true && targetKey < tempWinningNumber)
                ) {
                    tempWinningNumber = targetKey;
                    tempWinner = participantes[i];
                    tempWinnerAddress = currentGame.participantesAddress[i];
                }
            }
        }
        return (
            tempWinner,
            tempWinningNumber,
            tempWinnerAddress
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
            uint256,
            address
        )
    {
        Game storage currentGame = games_[_gameRound];
        return (
            currentGame.winnerTimestamp,
            currentGame.winnerName,
            currentGame.winnerNumber,
            currentGame.winnerAddress
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
        PlayerBook.deposit.value(rewardAmount)(targetGame.winnerAddress);
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
    
        moneyDistribution(
            totalGameCount_,
            depositAmount,
            bankerAddress
        );
        
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
    
    function snapshotKeys(uint256 _gameRound, uint256[] _keys)
        public
        isRegisteredUser
        areIntegers(_keys)
        meetDepositRequirement(keyRevealFee_.mul(_keys.length))
        payable
    {
        Game storage currentGame = games_[_gameRound];
        uint256 depositAmount = msg.value;
        moneyDistribution(
            _gameRound,
            depositAmount,
            currentGame.bankerAddress
        );

        for (uint i = 0; i < _keys.length; i++) {
            currentGame.snapshotKeys[_keys[i]].count = currentGame.keys[_keys[i]];
            currentGame.snapshotKeys[_keys[i]].timestamp = block.timestamp;
        }
    }
    
    function buyKeys(uint256 _gameRound, uint256[] _keys)
      public
      isRegisteredUser
      areIntegers(_keys)
      meetDepositRequirement(keyPrice_.mul(_keys.length))
      payable
    {
        address playerAddress = msg.sender;
        uint256 depositAmount = msg.value;

        Game storage currentGame = games_[_gameRound];
        bytes32 userName = PlayerBook.getPlayerName(playerAddress);
        
        moneyDistribution(
            _gameRound,
            depositAmount,
            currentGame.bankerAddress
        );
        
        if(currentGame.userKeys[userName].length == 0) {
            currentGame.participantes.push(userName);
            currentGame.participantesAddress.push(playerAddress);
        }
        
        for (uint i = 0; i < _keys.length; i++) {
            currentGame.userKeys[userName].push(_keys[i]);
            currentGame.keys[_keys[i]]++;
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
        moneyDistribution(
            _gameRound,
            depositAmount,
            currentGame.bankerAddress
        );
        (bytes32 winnerName, uint256 winningNumber, address winnerAddress) = currentWinner(_gameRound);
        currentGame.winnerName = winnerName;
        currentGame.winnerAddress = winnerAddress;
        currentGame.winnerNumber = winningNumber;
        currentGame.winnerTimestamp = block.timestamp;
    }
    
}
