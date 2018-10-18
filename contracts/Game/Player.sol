pragma solidity ^0.4.19;

contract PlayerBook {
    uint256 public totalPlayerCount = 0;                    // total players
    uint256 public registrationFee_ = 10 finney;            // price to register a name
    mapping (address => uint256) public pIDxAddr_;          // (addr => pID) returns player id by address
    mapping (bytes32 => uint256) public pIDxName_;          // (name => pID) returns player id by name
    mapping (uint256 => Player) public plyr_;               // (pID => data) player data
    
    struct Player {
        address addr;
        bytes32 name;
        uint256 laff;
        uint256 claimable;
    }
    
    constructor()
        public
    {
        plyr_[0].addr = msg.sender;
        plyr_[0].name = "wayne";
        pIDxAddr_[msg.sender] = 0;
        pIDxName_["wayne"] = 0;
        totalPlayerCount ++;
    }
    
    
    function registerPlayer(bytes32 _nameString, uint256 _affCode)
        public
        payable
    {
        // make sure name fees paid
        require (msg.value >= registrationFee_, "umm.....  you have to pay the name fee");
        
        // make sure the name has not been used
        require(pIDxName_[_nameString] == 0, "sorry that names already taken");
        
        // set up config
        address _addr = msg.sender;
        totalPlayerCount ++;
        
        plyr_[totalPlayerCount].addr = _addr;
        plyr_[totalPlayerCount].name = _nameString;
        pIDxAddr_[_addr] = totalPlayerCount;
        pIDxName_[_nameString] = totalPlayerCount;
        plyr_[totalPlayerCount].laff = _affCode;
        
    }
    
}
