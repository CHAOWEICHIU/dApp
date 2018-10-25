pragma solidity ^0.4.19;

import "./NumberGame.sol";

contract TestContract is NumberGame {

    mapping(bytes32 => uint256[]) userKeys;

    function testMin(uint256[] nums)
      public
      pure
      returns (uint256)
    {
        return (min(nums));
    }
}
