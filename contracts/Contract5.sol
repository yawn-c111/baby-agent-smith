// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./libraries/Lib.sol";

contract HackMe {
    address public owner;
    Lib public lib;

    constructor(Lib _lib) {
        owner = msg.sender;
        lib = Lib(_lib);
    }

    fallback() external payable {
        address(lib).delegatecall(msg.data);
    }
}
