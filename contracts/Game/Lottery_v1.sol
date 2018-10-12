pragma solidity ^0.4.19;

import "../Math/SafeMath.sol";

contract LotteryEvent {
    event 
}


contract Lottery {
    
    using SafeMath for uint256;

    uint randNonce = 0;

    uint256 public poolPassiveIncome = 0;
    uint256 public poolLottery = 0;
    uint256 public poolWinnerTakesAll = 0;
    
    uint8 passiveIncomeRate = 15;
    uint8 lotteryRate = 15;
    uint8 winnerTakesAllRate = 50;
    
    address contractOwner;

    
    mapping(address => uint256) claimableAmount;
    
    constructor() public payable {
        contractOwner = msg.sender;
    }
    
    function checkClaimableAmount(address _participant) public view returns (uint256){
        if(claimableAmount[_participant] > 0) {
            return claimableAmount[_participant];
        } else {
            return 0;
        }
    }
    
    
    function _playLottery(address _participant) internal {
        uint256 _claimableAmount = claimableAmount[_participant];
        if(_randMod(10) > 7) {
            if(_claimableAmount > 0) {
                claimableAmount[_participant] = _claimableAmount + poolLottery;
                poolLottery = 0;
            } else {
                claimableAmount[_participant] = poolLottery;
                poolLottery = 0;
            }    
        }
    }
    
    function _randMod(uint _modulus) internal returns(uint) {
        randNonce++;
        return uint(keccak256(abi.encodePacked(now, msg.sender, randNonce))) % _modulus;
    }
    

    function betMoney(uint256 _amount) public {
        require(
            _amount > 0,
            "should be bigger than 0"
        );
        
        address _participant = msg.sender;
        
        uint256 _amountForPoolPassiveIncome = _amount.div(100).mul(passiveIncomeRate);
        uint256 _amountForPoolLottery = _amount.div(100).mul(lotteryRate);
        uint256 _amountForPoolWinnerTakesAllRate = _amount.div(100).mul(winnerTakesAllRate);
        
        poolPassiveIncome = poolPassiveIncome.add(_amountForPoolPassiveIncome);
        poolLottery = poolLottery.add(_amountForPoolLottery);
        poolWinnerTakesAll = poolWinnerTakesAll.add(_amountForPoolWinnerTakesAllRate);
        
        _playLottery(_participant);
        
        
    }

}

