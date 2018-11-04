pragma solidity ^0.4.23;
contract Mushroom {
    using LedgerSystem for LedgerSystem.Data;
    using MushroomGameSystem for MushroomGameSystem.Data;
    
    address public owner;
    mapping(address => User) users;
    address[] all_users;
    MushroomGameSystem.Data mushroomGames;
    uint256 public mushroom_eth_rate;
    
    struct User {
        uint256 registerBlockheight;
        uint8 gameIndex;
        LedgerSystem.Data ledger;
    }
    
    constructor () public {
        mushroomGames = MushroomGameSystem.Data(0);
        mushroom_eth_rate = 1E14;
    }
    
    function getAllUsers() public view returns(address[]) {
        return all_users;
    }
    
    function isRegister(address _addr) public view returns (bool) {
        if(users[_addr].registerBlockheight != 0) {
            return true;
        }
        return false;
    }
    
    function registerUser() public {
        require(users[msg.sender].registerBlockheight == 0, "you have registered");
        all_users.push(msg.sender);
        users[msg.sender] = User({
            registerBlockheight: block.number,
            gameIndex: 0,
            ledger: LedgerSystem.Data(0)
        });
    }
    
    function getGuCoin(address _user) internal view returns (uint256) {
        User storage user = users[_user];
        if(user.registerBlockheight>0) {
            uint256 base = (block.number - user.registerBlockheight);
            return user.ledger.getBalance(base);
        }
    }
    
    function buyGuCoin() public payable {
        require(msg.value / mushroom_eth_rate > 1, "Not enough money");
        User storage _u = users[msg.sender];
        _u.ledger.operation(msg.value / mushroom_eth_rate, true, "buy Gu Coin");
    }
    
    function newGame() public payable returns(uint256) {
        return mushroomGames.newGame(msg.sender, msg.value, 5, 5);
    }
    
    function joinGame(uint256 game_id) public returns (bool) {
        return mushroomGames.joinGame(game_id, msg.sender);
    }
    
    function gameWithTeam(uint256 game_index, uint8 team_index) 
        public
        view
        returns (
            uint256,    // score
            address[],  // team_members
            uint8[]     // level
        )
    {
        uint256 score = mushroomGames.calcMushroom(
            game_index,
            team_index,
            block.number);
        address[] memory addresses;
        uint8[] memory levels;
        (addresses, levels) = mushroomGames.getTeamMember(game_index, team_index);
        return (score, addresses, levels);
    }
    
    function getBankerGame(address _addr) view public returns (bool, uint256) {
        return mushroomGames.getBankerGame(_addr);
    }
    
    function getGameInfo(uint256 game_index) 
        public 
        view 
        returns (
            string,     // pending || started || aborted || ended
            address[],  // participants
            uint256,    // created_at_block
            uint256,    // game_start_at
            uint256,    // pending_block
            uint8      // team count
        )
    {
        return mushroomGames.getGameInfo(game_index);
    }
    
    function getPlayerGame(address _addr) view public returns (uint256) {
        if(msg.sender == _addr) {
            return 2;
        }
        return 1;
    }
    
}

library MushroomGameSystem {
    struct Data {
        mapping(uint256 => MushroomGame) mushroomGames;
        uint256 index;
    }
    
    struct MushroomGame {
        address banker;
        mapping(address => uint8) levels;
        mapping(address => uint8) team_member;
        mapping(uint256 => GuGuLedger) ledgers;
        mapping(uint8 => Item) items;
        mapping(uint8 => address) gamer;
        uint256 banker_deposit;
        uint256 created_at_block;
        uint256 game_start_at;
        uint256 gaming_block;
        uint256 ledger_count;
        uint256 pending_block;
        uint8 gamer_count;
        uint8 items_count;
        uint8 team_count;
    }
    
    struct Item {
        bool unique;    //buy once only
        string name;
        uint32 duration;
        uint32 price;
        uint8 mushroom_rate;
        uint8 production_rate;
    }
    
    struct GuGuLedger {
        Item item;
        address user;
        bool isLevel;
        uint256 block;
        uint8 team_index;
        uint8 user_level;
    }
    
    function getTeamMember(
        Data storage self,
        uint256 game_index,
        uint256 team_index
    ) 
        internal
        view
        returns (address[], uint8[]) 
    {
        MushroomGame storage _m = self.mushroomGames[game_index];
        address[] memory addresses = new address[](_m.gamer_count / _m.team_count);
        uint8[] memory levels = new uint8[](_m.gamer_count / _m.team_count);
        uint8 idx = 0;
        for(uint8 i=0; i< _m.gamer_count; i++) {
            if(_m.team_member[_m.gamer[i]] == team_index) {
                addresses[idx] = _m.gamer[i];
                levels[idx] = _m.levels[_m.gamer[i]];
                idx += 1;
            }
        }
        return (addresses, levels);
    }
    
    function getGameInfo(
        Data storage self,
        uint256 game_index
    ) 
        internal
        view
        returns (
            string,     // pending || started || aborted || ended
            address[],  // participants
            uint256,    // created_at_block
            uint256,    // game_start_at
            uint256,    // pending_block
            uint8       // team count
        )
    {
        MushroomGame storage _m = self.mushroomGames[game_index];
        address[] memory addr = new address[](_m.gamer_count);
        string memory status;
        if(_m.game_start_at == 0) {
            if(block.number - _m.created_at_block >= _m.pending_block) {
                status = "aborted";
            } else {
                status = "pending";
            }
        } else {
            if(block.number - _m.game_start_at >= _m.gaming_block) {
                status = "ended";
            } else {
                status = "started";
            }
        } 
        for(uint8 i=0; i<_m.gamer_count; i++) {
            addr[i] = _m.gamer[i];
        } 
        return (
            status,
            addr,
            _m.created_at_block,
            _m.pending_block,
            _m.game_start_at,
            _m.team_count
        );
    }
    
    function getBankerGame(Data storage self, address _banker) 
        internal
        view
        returns (bool, uint256) 
    {
        for(uint256 i=0;i<self.index;i++) {
            if(!isEnd(self, i) && self.mushroomGames[i].banker == _banker) {
                return (true, i);
            }
        }
        return (false, 0);
    }

    
    function calcMushroom(
        Data storage self, 
        uint256 game_index,
        uint8 team_index,
        uint256 target_block
    ) 
        view 
        internal
        returns (uint256) 
    {
        MushroomGame storage _m = self.mushroomGames[game_index];
        //uint248 team_members = _m.gamer_count / _m.team_count;
        uint256 total_gugu = 0;
        uint256 end_block = 0;
        if(_m.game_start_at + _m.gaming_block <= target_block) {
            end_block = _m.gaming_block + _m.game_start_at;
        } else {
            end_block = target_block;
        }
        for(uint8 x=0;x<_m.gamer_count/_m.team_count; x++) {
            total_gugu += (end_block - _m.game_start_at) * 3;
        }
        
        for(uint256 i=0; i<_m.ledger_count; i++) {
            GuGuLedger memory _l = _m.ledgers[i];
            if(_l.team_index != team_index){
                continue;
            }
            if(_l.isLevel) {
                total_gugu += (end_block - _l.block) * 3;
            } else {
                if(!_l.item.unique) {
                    if((_l.block + _l.item.duration) > end_block) {
                        total_gugu += (end_block 
                            - (_l.block + _l.item.duration)) 
                            * _l.user_level 
                            * _l.item.production_rate;
                    } else {
                        total_gugu += _l.item.duration 
                            * _l.user_level 
                            * _l.item.production_rate;
                    }
                } else {
                    total_gugu += calcMushroom(
                        self,
                        game_index,
                        team_index,
                        _l.block);
                }
            }
        }
        return total_gugu;
    }
    
    function newGame(
        Data storage self,
        address _banker,
        uint256 _deposit,
        uint256 _pending_block,
        uint256 _gaming_block
    ) 
        internal returns (uint256) 
    {
        self.mushroomGames[self.index] = MushroomGame({
            banker: _banker,
            banker_deposit: _deposit,
            gamer_count: 0,
            created_at_block: block.number,
            game_start_at: 0,
            pending_block: _pending_block,
            gaming_block: _gaming_block,
            items_count: 0,
            ledger_count: 0,
            team_count: 2
        });
        self.index += 1;
        return self.index - 1 ;
    }
    
    function newGameItem(
        Data storage self,
        uint256 game_index,
        string _name,
        uint32 _price,
        uint32 _duration,
        uint8 _production_rate,
        uint8 _mushroom_rate,
        bool _unique
    ) 
        internal 
    {
        MushroomGame storage _m = self.mushroomGames[game_index];
        _m.items[_m.items_count] = Item({
            name: _name,
            price: _price,
            duration: _duration,
            production_rate: _production_rate,
            mushroom_rate: _mushroom_rate,
            unique: _unique
        });
        _m.items_count += 1;
        
    }
    
    function isEnd(Data storage self, uint256 index) 
        internal
        view
        returns(bool) 
    {
        MushroomGame storage m = self.mushroomGames[index];
        if(m.game_start_at == 0) {
            if(block.number - m.created_at_block <= m.pending_block) {
                return true;
            }
        } else {
            if(block.number - m.created_at_block <= m.gaming_block) {
                return true;
            }
        }
        return false;
    }
    
    function banker_withdrawal(Data storage self, uint256 index) internal {
        MushroomGame storage m = self.mushroomGames[index];
        require(
            m.game_start_at == 0 
            && m.created_at_block + block.number <= m.pending_block);
        require(m.banker.send(m.banker_deposit));
    }
    
    function joinGame(Data storage self, uint256 game_index, address user) 
        internal
        returns (bool) 
    {
        MushroomGame storage _m = self.mushroomGames[game_index];
        if(_m.game_start_at != 0) {
            return false;
        }
        if(_m.gamer_count < 2) {
            _m.gamer[_m.gamer_count] = user;
            _m.levels[user] = 1;
            _m.gamer_count += 1;
        } 
        if(_m.gamer_count >= 2) {
            randonGamer(self, game_index);
            _m.game_start_at = block.number;
        }
        return true;
    }
    
    function randonGamer(Data storage self, uint256 game_index) internal {
        MushroomGame storage _m = self.mushroomGames[game_index];
        for(uint8 i=0; i<_m.gamer_count; i++) {
            _m.team_member[_m.gamer[i]] = (i+1) % 2; 
        }
        return;
    }
    
}

library LedgerSystem {
    struct Data { 
        mapping(uint256 => Ledger) ledgers;
        uint256 index;
    }
    
    struct Ledger {
        uint256 amount;
        bool positive;
        string desc;
    }
    
    function operation(
        Data storage self,
        uint256 _amount,
        bool _positive,
        string _desc
    ) 
        internal 
    {
        self.ledgers[self.index] = Ledger({
            amount: _amount,
            positive: _positive,
            desc: _desc
        });
        self.index += 1;
    }
    
    function getBalance(
        Data storage self,
        uint256 _init
    ) 
        internal
        view 
        returns (uint256)
    {
        uint256 base = _init;
        for(uint64 i=0; i<self.index; i++) {
            if(self.ledgers[i].positive) {
                base += self.ledgers[i].amount;
            } else {
                base -= self.ledgers[i].amount;
            }
        }
        return base;
    }
}
