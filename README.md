# Solana UA Bootcamp - 2024-08-06

## Environment Variables

Project env:

* `SECRET_KEY` — wallet secret key.
* `KEYPAIR_PREFIX` — prefix to search for public key
* `CONNECTION_CLUSTER` — cluster to which the solana connects.

### Example `.env`:

```env
SECRET_KEY=your_wallet_secret_key
KEYPAIR_PREFIX=anza
CONNECTION_CLUSTER=mainnet-beta
```

### Cluster

`CONNECTION_CLUSTER` accepts one of the types

```typescript
type Cluster = 'devnet' | 'testnet' | 'mainnet-beta';
```

## Commnds

### `keypair:load` — Load wallet.
```bash
npm run keypair:load
```
> This command loads your wallet based on the value specified in the { SECRET_KEY } environment variable.


###  `keypair:generate` — Generates a new wallet (key pair).
```bash
npm run keypair:generate
```
> The command is used to generate a new wallet and corresponding key pair.


###  `keypair:generate:prefix` — Creates a wallet (key pair) with the selected prefix.
```bash
npm run keypair:generate:prefix
```
> This command generates a wallet with the prefix specified in { KEYPAIR_PREFIX }. Depending on the length of the prefix, the search operation may take a long time.


###  `balance:check` — Loads wallet balance. 
```bash
npm run balance:check
```
> The command checks the wallet balance using the value from { SECRET_KEY }.
