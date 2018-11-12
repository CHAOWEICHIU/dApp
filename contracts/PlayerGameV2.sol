pragma solidity ^0.4.19;

import "./SafeMath.sol";

contract PlayerBookV2 {

    modifier meetDepositRequirement(uint256 fee)
    {
        require(msg.value >= fee, "fee does not meet requirement");
        _;
    }

    struct User {
        address wallet;
        bytes32 name;
        uint256 affiliateId;
        uint256 claimable;
        uint256 level;
    }

    uint256 public totalUserCount = 1;                    // total players
    uint256 public registrationFee_ = 10 finney;          // price to register a name
    mapping (address => uint256) public uIdWallet_;       // (wallet => uId) returns user id by address
    mapping (bytes32 => uint256) public uIdName_;         // (name   => uId) returns user id by name
    mapping (uint256 => User) public user_;               // (uId    => data) user data

    constructor()
      public
    {
        user_[1].wallet = msg.sender;
        user_[1].name = "wayne";
        uIdWallet_[msg.sender] = 1;
        uIdName_["wayne"] = 1;
    }

    function getUserNameByAddress(address wallet)
        public
        view
        returns(bytes32)
    {
        return user_[uIdWallet_[wallet]].name;
    }

    function registerUser(bytes32 name, uint256 affiliateId)
        public
        meetDepositRequirement(registrationFee_)
        payable
    {
        // make sure the name has not been used
        require(uIdName_[name] == 0, "sorry that names already taken");

        // set up config
        address wallet = msg.sender;
        totalUserCount ++;
        
        user_[totalUserCount].wallet = wallet;
        user_[totalUserCount].name = name;
        user_[totalUserCount].affiliateId = affiliateId;
        user_[totalUserCount].claimable = 0;
        user_[totalUserCount].level = 1;
        uIdWallet_[wallet] = totalUserCount;
        uIdName_[name] = totalUserCount;

    }

    // function deposit



}

/*
TODO
  User
    - level
      - money would be given after leveling up
      - 
    - claimable 
    - claimableWhenBroken
    - 角色 [
      master,
      manager,
      ...
      ...
    ]
    - 
*/



