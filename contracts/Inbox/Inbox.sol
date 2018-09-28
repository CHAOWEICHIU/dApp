pragma solidity ^0.4.18;

contract Dice {
    string name = "Dice";
    
    function changeName(string _name) public {
        name = _name;
    }
}
