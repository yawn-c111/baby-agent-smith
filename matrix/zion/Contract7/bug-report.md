# [M-01] Missing Initialization of King Address
Submitted by Auditor

KingOfEther.sol#L4-L5

The KingOfEther contract does not initialize the `king` address when the contract is deployed. This results in an inaccurate state of the `king` address until the first user claims the throne. It is recommended to set the `king` address in the contract's constructor.

```solidity
contract KingOfEther {
    address public king;
    uint public balance;
}
```

## Proof of Concept

When the contract is deployed, the `king` address is not set, which may lead to unexpected behavior or confusion for users interacting with the contract.

## Recommended Mitigation Steps

Initialize the `king` address in the contract's constructor to ensure it is set to a valid address upon deployment. For example, you can set the `king` address to the contract deployer's address:

```solidity
constructor() {
    king = msg.sender;
}
```

# [H-02] Reentrancy Attack in ClaimThrone Function
Submitted by Auditor

KingOfEther.sol#L7-L14

The `claimThrone` function in the KingOfEther contract is vulnerable to a reentrancy attack due to the order of operations. The function sends Ether to the current king before updating the `king` and `balance` variables. This allows a malicious contract to repeatedly claim the throne and receive Ether before the new king is set.

```solidity
function claimThrone() external payable {
    require(msg.value > balance, "Need to pay more to become the king");

    (bool sent, ) = king.call{value: balance}("");
    require(sent, "Failed to send Ether");

    balance = msg.value;
    king = msg.sender;
}
```

## Proof of Concept

An attacker can create a malicious contract that calls the `claimThrone` function in a fallback function, allowing them to repeatedly claim the throne and receive Ether before the new king is set.

```solidity
contract MaliciousContract {
    KingOfEther public kingOfEther;

    constructor(KingOfEther _kingOfEther) {
        kingOfEther = _kingOfEther;
    }

    function attack() public payable {
        kingOfEther.claimThrone{value: msg.value}();
    }

    fallback() external payable {
        if (address(kingOfEther).balance >= msg.value) {
            kingOfEther.claimThrone{value: msg.value}();
        }
    }
}
```

## Recommended Mitigation Steps

To fix the reentrancy vulnerability, update the `king` and `balance` variables before sending Ether to the current king. This will prevent the attacker from repeatedly calling the `claimThrone` function and exploiting the reentrancy vulnerability.

Here's the updated `claimThrone` function:

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

# [L-01] High Gas Usage in ClaimThrone Function
Submitted by Auditor

KingOfEther.sol#L7-L14

The `claimThrone` function in the KingOfEther contract has high gas usage due to sending Ether to the current king every time a new king claims the throne. This can be optimized by allowing the previous king to withdraw their Ether manually.

```solidity
function claimThrone() external payable {
    require(msg.value > balance, "Need to pay more to become the king");

    (bool sent, ) = king.call{value: balance}("");
    require(sent, "Failed to send Ether");

    balance = msg.value;
    king = msg.sender;
}
```

## Recommended Mitigation Steps

Instead of sending Ether to the current king in the `claimThrone` function, store the Ether owed to each king in a mapping and allow them to withdraw their Ether manually. This will reduce the gas usage in the `claimThrone` function.

Here's the updated contract with a `withdraw` function:

```solidity
contract KingOfEther {
    address public king;
    uint public balance;
    mapping(address => uint) public owed;

    function claimThrone() external payable {
        require(msg.value > balance, "Need to pay more to become the king");

        owed[king] += balance;

        balance = msg.value;
        king = msg.sender;
    }

    function withdraw() external {
        uint amount = owed[msg.sender];
        require(amount > 0, "No Ether to withdraw");

        owed[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }
}
```

This implementation allows previous kings to withdraw their Ether manually, reducing the gas usage in the `claimThrone` function.