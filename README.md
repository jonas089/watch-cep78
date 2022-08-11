# Casper-CEP78 NFT supply-chain project
A supply chain project built upon the Casper-CEP78 NFT standard with requirements for authenticity certificates in mind.
Core functionality:
  1. Create a Collection / Product row
  2. Mint a Product from within that Collection
  3. Track the owner of the product and 
  3.1 - allow transfers ( owner_mode = 2 )
Optional functionality:
  1. approve operators for transfers
  2. burn a product when "destroyed" or "consumed"
  
## Architecture
![Preview](https://github.com/jonas089/watch-cep78/blob/master/mindmap.png "Contract Architecture")
