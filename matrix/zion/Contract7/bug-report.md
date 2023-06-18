# [H-01] Reentrancy Vulnerability in claimThrone Function
Submitted by Auditor

KingOfEther.sol#L9-L15

The `claimThrone()` function in the `KingOfEther` contract is vulnerable to a reentrancy attack due to the order of operations. The contract sends Ether to the current king before updating the state variables, allowing the current king to potentially call the `claimThrone()` function again before the state variables are updated, draining the contract's balance.

```solidity
function claimThrone() external payable {
    require(msg.value > balance, "Need to pay more to become the king");

    (bool sent, ) = king.call{value: balance}("");
    require(sent, "Failed to send Ether");

    balance = msg.value;
    king = msg.sender;
}
```

Proof of Concept:

Assuming the current king is a malicious contract that calls the `claimThrone()` function in its fallback function, it can repeatedly claim the throne and drain the contract's balance.

```solidity
contract MaliciousKing {
    KingOfEther kingOfEther;

    constructor(KingOfEther _kingOfEther) {
        kingOfEther = _kingOfEther;
    }

    fallback() external payable {
        kingOfEther.claimThrone{value: msg.value}();
    }
}
```

Recommended Mitigation Steps:

To fix the reentrancy vulnerability, update the state variables before sending Ether to the current king. This can be done by changing the order of operations in the `claimThrone()` function:

```solidity
function claimThrone() external payable {
    require(msg.value > balance, "Need to pay more to become the king");

    address previousKing = king;
    uint previousBalance = balance;

    balance = msg.value;
    king = msg.sender;

    (bool sent, ) = previousKing.call{value: previousBalance}("");
    require(sent, "Failed to send Ether");
}
```

By updating the state variables before sending Ether, the contract is no longer vulnerable to reentrancy attacks.