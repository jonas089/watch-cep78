# Casper-CEP78 NFT supply-chain project
A supply chain project built upon the Casper-CEP78 NFT standard with requirements for authenticity certificates in mind.
### Core functionality:
1. Create a Collection / Product row
2. Mint a Product from within that Collection
3. Track the owner of the product
4. Allow transfers ( owner_mode = 2 )

### Optional functionality:
1. approve operators for transfers
2. burn a product when "destroyed" or "consumed"

## Architecture
![Preview](https://github.com/jonas089/watch-cep78/blob/master/mindmap.png "Contract Architecture")

# main.js - client concept
Contains functions that will be re-used and modified / cleaned up when building the actual prototype.
Functions can be used in a node.js webapp or any javascript backend. Keys should always be generated and
stored client-side.

## Currently supported - main.js
- Query a Collection's / Product row's contract hash by reading the items key in the "Parent contract". (By Collection Name)
- Query all Token-hashs that belong to an account for a given Collection. (By Collection Name)
- Transfer owned tokens. (By Token Hash && Collection contract hash)
- Mint Tokens, restricted to manufacturer ( "INSTALLER" of the "Parent contract" ). (By Collection contract hash).

## Currently unsupported - main.js
- Approve operators
- Burn

## Keys - main.js
- Create an Ed25519 Keypair and write it to a .pem file.
- Parse the Ed25519 Keypair and use it as an asymmetric keypair to sign deploys.
- Parse the pubkey.pem file to lookup the publickey hex with the explorer.

## Design goals for Client
