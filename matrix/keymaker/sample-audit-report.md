# [M-04] Interest accrued could be zero for small decimal tokens
Submitted by hickuphh3

PooledCreditLine.sol#L1215-L1221

Interest is calculated as

```
(_principal.mul(_borrowRate).mul(_timeElapsed).div(YEAR_IN_SECONDS).div(SCALING_FACTOR));
It is possible for the calculated interest to be zero for principal tokens with small decimals, such as EURS (2 decimals). Accumulated interest can therefore be zero by borrowing / repaying tiny amounts frequently.
```

## Proof of Concept
Assuming a borrow interest rate of 5% (5e17) and principal borrow amount of 10_000 EURS (10_000 * 1e2 = 1_000_000), the interest rate calculated would be 0 if principal updates are made every minute (around 63s).

```
// in this example, maximum duration for interest to be 0 is 63s
1_000_000 * 5e17 * 63 / (86400 * 365) / 1e18 = 0.99885 // = 0
While plausible, this method of interest evasion isn’t as economical for tokens of larger decimals like USDC and USDT (6 decimals).
```

## Recommended Mitigation Steps
Take caution when allowing an asset to be borrowed. Alternatively, scale the principal amount to precision (1e18) amounts.