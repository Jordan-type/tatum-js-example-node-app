# Tatum Node Js app example
Application shows examples of basic flows using Tatum SDK for Bitcoin, Ethereum, Polygon, Tron and Solana.

## Libs
* Node Js
* Nest Js
* Typescript
* Tatum SDK
  * @tatumio/eth
  * @tatumio/btc
  * @tatumio/tron
  * @tatumio/polygon
  * @tatumio/solana

## How to start

### Install dependencies
```bash
npm install
```
or
```bash
yarn install
```

### Start application
```bash
npm run start
```
or
```bash
yarn start
```
Application will be started on port 3000 and available at
```bash
http://localhost:3000
```

### Wallet generation
Chose chain you want to use (e.g. BTC) and initialise wallet.
```bash
curl --location --request POST 'http://localhost:3000/btc/wallet'
```
It will generate new mnemonic and address/keys for first 5 indexes of keys derivation (0, 1, 2, 3, 4 indexes) and store to local json file.  
These addresses and keys will be reused for next operations and examples.  
Please find and top up 0 index address from corresponding faucet.

**Bitcoin**  
https://bitcoinfaucet.uo1.net/send.php

**Ethereum**  
https://sepolia-faucet.pk910.de/
