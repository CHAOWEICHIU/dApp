pragma solidity ^0.4.19;

contract Mushroom {
    using LedgerSystem for LedgerSystem.Data;
    using MushroomGameSystem for MushroomGameSystem.Data;
    
    address public owner;
    mapping(address => User) users;
    address[] public all_users;
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
    
    function registerUser() public {
        require(users[msg.sender].registerBlockheight == 0);
        all_users.push(msg.sender);
        users[msg.sender] = User({
            registerBlockheight: block.number,
            gameIndex: 0,
            ledger: LedgerSystem.Data(0)
        });
    }
    
    function getGuCoin(address _user) public view returns (uint256) {
        User storage user = users[_user];
        if(user.registerBlockheight>0) {
            uint256 base = (block.number - user.registerBlockheight);
            return user.ledger.getBalance(base);
        }
    }
    
    function buyGuCoin() public payable {
        require(msg.value / mushroom_eth_rate > 1);
        User storage _u = users[msg.sender];
        _u.ledger.operation(msg.value / mushroom_eth_rate, true, "buy Gu Coin");
    }
    
    function newGame() public payable returns(uint256) {
        return mushroomGames.newGame(msg.sender, msg.value, 5, 5);
    }
    
    function joinGame(uint256 game_id) public returns (bool) {
        return mushroomGames.joinGame(game_id, msg.sender);
    }
    
    function getMushroom(uint256 game_index, uint8 team_index) public view returns (uint256){
        return mushroomGames.calcMushroom(game_index, team_index, block.number);
    }
}

library MushroomGameSystem {
    struct Data {
        mapping(uint256 => MushroomGame) mushroomGames;
        uint256 index;
    }
    
    struct MushroomGame {
        address banker;
        uint256 banker_deposit;
        mapping(uint8 => address) gamer;
        uint8 gamer_count;
        uint256 created_at_block;
        uint256 game_start_at;
        uint256 pending_block;
        uint256 gaming_block;
        mapping(uint8 => Item) items;
        mapping(address => uint8) team_member;
        uint8 team_count;
        uint8 items_count;
        mapping(address => uint8) levels;
        mapping(uint256 => GuGuLedger) ledgers;
        uint256 ledger_count;
    }
    
    struct Item {
        string name;
        uint32 price;
        uint32 duration;
        uint8 production_rate;
        uint8 mushroom_rate;
        bool unique;    //buy once only
    }
    
    struct GuGuLedger {
        address user;
        uint8 team_index;
        uint8 user_level;
        bool isLevel;
        Item item;
        uint256 block;
    }
    

    
    function calcMushroom(Data storage self, uint256 game_index, uint8 team_index, uint256 target_block) view internal returns (uint256) {
        MushroomGame storage _m = self.mushroomGames[game_index];
        uint256 total_gugu = 0;
        uint256 end_block = 0;
        if(_m.game_start_at + _m.gaming_block <= target_block) {
            end_block = _m.gaming_block + _m.game_start_at;
        } else {
            end_block = target_block - _m.game_start_at;
        }
        
        total_gugu += (end_block - _m.game_start_at) * 3;
        for(uint256 i=0; i<_m.ledger_count; i++) {
            GuGuLedger storage _l = _m.ledgers[i];
            if(_l.team_index != team_index){
                continue;
            }
            if(_l.isLevel) {
                total_gugu += (end_block - _l.block) * 3;
            } else {
                if(!_l.item.unique) {
                    if((_l.block + _l.item.duration) > end_block) {
                        total_gugu += (end_block - (_l.block + _l.item.duration)) * _l.user_level * _l.item.production_rate;
                    } else {
                        total_gugu += _l.item.duration * _l.user_level * _l.item.production_rate;
                    }
                } else {
                    total_gugu += calcMushroom(self, game_index, team_index, _l.block);
                }
            }
        }
        return total_gugu;
    }
    
    function newGame(
        Data storage self,
        address _banker,
        uint256 _deposit, uint256 _pending_block,
        uint256 _gaming_block) internal returns (uint256) {
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
        uint32 _price, uint32 _duration, uint8 _production_rate,
        uint8 _mushroom_rate, bool _unique) internal {
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
    
    function isEnd(
        Data storage self, uint256 index) internal view returns(bool) {
        MushroomGame storage m = self.mushroomGames[index];
        if(m.game_start_at == 0) {
            if(m.created_at_block + block.number <= m.pending_block) {
                return true;
            }
        } else {
            if(m.created_at_block + block.number <= m.gaming_block) {
                return true;
            }
        }
        return false;
    }
    
    function banker_withdrawal(Data storage self, uint256 index) internal {
        MushroomGame storage m = self.mushroomGames[index];
        require(
            m.game_start_at == 0 && 
            m.created_at_block + block.number <= m.pending_block);
        require(m.banker.send(m.banker_deposit));
    }
    
    function joinGame(Data storage self, uint256 game_index, address user) internal returns (bool) {
        MushroomGame storage _m = self.mushroomGames[game_index];
        if(_m.game_start_at != 0) {
            return false;
        }
        if(_m.gamer_count < 11) {
            _m.gamer[_m.gamer_count] = user;
            _m.levels[user] = 1;
            _m.gamer_count += 1;
        } 
        if(_m.gamer_count >= 11) {
            randonGamer(self, game_index);
            _m.game_start_at = block.number;
        }
        return true;
    }
    function randonGamer(Data storage self, uint256 game_index) internal {
        MushroomGame storage _m = self.mushroomGames[game_index];
        for(uint8 i=0; i<_m.gamer_count; i++) {
            _m.team_member[_m.gamer[i]] = (i % 2) + 1; 
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
        Data storage self, uint256 _amount,
        bool _positive, string _desc
    ) internal {
        self.ledgers[self.index] = Ledger({
            amount: _amount,
            positive: _positive,
            desc: _desc
        });
        self.index += 1;
    }
    
    function getBalance(Data storage self, uint256 _init) internal view returns (uint256) {
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
