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
    }

    function getPlayerName(address _addr)
        public
        view
        returns(bytes32)
    {
        return plyr_[pIDxAddr_[_addr]].name;
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
    
    function depositMoney()
        public
        payable
    {
        require(msg.value > 0, "need money");
        uint256 affiliationAmount = msg.value / 10;
        address _addr = msg.sender;
        uint256 _playerId = pIDxAddr_[_addr];
        uint256 _affiliatePlayerId = plyr_[_playerId].laff;
        // if the person who send money has registered
        if(_playerId != 0) {
            plyr_[_affiliatePlayerId].claimable = affiliationAmount;
            plyr_[_playerId].claimable = msg.value - affiliationAmount;
        }
        plyr_[0].claimable = msg.value;
    }
    
    function claimMoney()
        public
    {
        address _addr = msg.sender;
        Player storage player = plyr_[pIDxAddr_[_addr]];
        require(player.claimable != 0, "you don't have money to claim");
        player.claimable = 0;
        _addr.transfer(player.claimable);
    }
}
