// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Lib {
    address public owner;

    function pwn() public {
        owner = msg.sender;
    }
}
