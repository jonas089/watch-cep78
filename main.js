/*
      [Prototype Design]
      -> Accounts
        -> manufacturer requires a private/public keypair.
          -> can be a manual process for prototyping.
        -> user only needs an account-hash / public key.
          -> should be generated within the app.

      -> Interface
        -> mint()
          -> send a signed deploy to the client instance.
        -> query()
          -> use account hash to query collections

      [Other]
      - Transfer account_hash | pubkey ?
*/
// filesystem to read & write keys
const fs = require('fs');

// casper sdk
const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, DeployUtil, CLPublicKey, CLKey, Keys, CLAccountHash } = require('casper-js-sdk');
const node_addr = "http://65.108.73.113:7777/rpc/";
const client = new CasperClient(node_addr);
const contract = new Contracts.Contract(client);
const contract_hash = "hash-6e7757c21690a60ac1dd4846a02cf8f4df33e2b933ba68116a9aad9de90ad724"
contract.setContractHash(contract_hash);

function PublicKeyToBytes(key){
  return CLPublicKey.fromHex(key)
}

function PemToHex(public_key_pem_path){
  const PublicKeyByteArray = Keys.Ed25519.parsePublicKeyFile(public_key_pem_path);
  const FromEd25519 = CLPublicKey.fromEd25519(PublicKeyByteArray);
  return FromEd25519.toHex()
}

function asymmetric_keypair_test(){
  // prototype only supports Ed25519
  return Keys.Ed25519.parseKeyFiles("./pubkey.pem", "./privkey.pem")
}

function asymmetric_keypair(priv_path, pub_path){
  return Keys.Ed25519.parseKeyFiles(pub_path, priv_path)
}

// creates new keypair in ./tests/data/keys ! only supports Ed25519
function newKeys(){
  keys_path = './test/data/keys/';
  const k = Keys.Ed25519.new();
  console.log(k.exportPrivateKeyInPem());
  console.log(k.exportPublicKeyInPem());

  // write the new private key and public key to .pem
  // => account creation successful.
  public_key = k.exportPublicKeyInPem();
  private_key = k.exportPrivateKeyInPem();
  fs.writeFile(keys_path + 'pubkey.pem', public_key, err => {
    if (err) {
      console.error(err);
    }
  });
  fs.writeFile(keys_path + 'privkey.pem', private_key, err => {
    if (err) {
      console.error(err);
    }
  });

  // read public key from .pem and convert to hex for explorer.
  console.log(PemToHex('pubkey.pem'))
}

// Warning: Currently anyone can transfer tokens, not just the owner.
// Fix this by comparing caller to owner.
async function transfer_piece(public_key, model_contract_hash, token_hash, target_key, source_key){
  const asymmetric_keypair = asymmetric_keypair_test();
  const target_key_bytes = PublicKeyToBytes(target_key);
  const source_key_bytes = PublicKeyToBytes(source_key);
  cl_target = CLValueBuilder.key(target_key_bytes);
  cl_source = CLValueBuilder.key(source_key_bytes);
  public_key_bytes = PublicKeyToBytes(public_key);
  args = RuntimeArgs.fromMap({
    // dummy meta as json string: '{\"name\":\"John Doe\",\"token_uri\":\"https://www.barfoo.cong\",\"checksum\":\"940bffb3f2bba35f84313aa26da09ece3ad47045c6a1292c2bbd2df4ab1a55fc\"}'
    'token_hash':CLValueBuilder.string(token_hash),
    'source_key': cl_source,
    'target_key': cl_target
  });

  const model = new Contracts.Contract(client);
  model.setContractHash(model_contract_hash);
  const result = model.callEntrypoint("transfer", args, public_key_bytes, "casper-test", "1000000000", [], 10000000);
  signedDeploy = DeployUtil.signDeploy(result, asymmetric_keypair);
  signedDeploy.send('http://136.243.187.84:7777/rpc').then((result) => {
    console.log("Transfer deploy_hash: ", result);
  }).catch((error) => {
    console.log(error);
  });

}

async function mint_model(model_contract_hash, public_key, metadata){
  // for prototype using the local keypair.
  const model = new Contracts.Contract(client);
  model.setContractHash(model_contract_hash);

  const asymmetric_keypair = asymmetric_keypair_test();
  const public_key_bytes = PublicKeyToBytes(public_key);

  exp = new CLValueBuilder.key(public_key_bytes);
  console.log("EXP:", exp.data);
  args = RuntimeArgs.fromMap({
    // dummy meta as json string: '{\"name\":\"John Doe\",\"token_uri\":\"https://www.barfoo.cong\",\"checksum\":\"940bffb3f2bba35f84313aa26da09ece3ad47045c6a1292c2bbd2df4ab1a55fc\"}'
    'token_meta_data':CLValueBuilder.string(metadata),
    'token_owner': exp
  });

  const result = model.callEntrypoint("mint", args, public_key_bytes, "casper-test", "5000000000", [], 10000000);
  signedDeploy = DeployUtil.signDeploy(result, asymmetric_keypair);
  signedDeploy.send('http://136.243.187.84:7777/rpc').then((result) => {
    console.log("Mint deploy_hash: ", result);
  }).catch((error) => {
    console.log(error);
  });
}

// contract_hash is manufacturer contract => named_key of manufacturer account-hash
async function find_model_contract_hash(m){
  model_contract_hash = await contract.queryContractDictionary(
    "items",
    m
  ).then(response => {
    return "hash-" + response.data;
  }).catch(error => {
    console.log("[ALERT!] Error retrieving Contract Hash: ", error);
    return error;
  });

  return model_contract_hash;
}

async function query_model(m) {
  account_hash_string = "bfb5162e42c111b1211e565201777d780c1873f63b767ba73d6bdb398d3a8bb2";
  //account_hash_string = "7e328c23029e42e8e7ba6e4f61d483daffead4b5598bdac46f195a5fbeadf8c5";
  model_contract_hash = await contract.queryContractDictionary(
    "items",
    m
  ).then(response => {
    return "hash-" + response.data;
  }).catch(error => {
    return error;
  });

  console.log(m + ": " + model_contract_hash + "\n");
  const model = new Contracts.Contract(client);
  model.setContractHash(model_contract_hash);

  model.queryContractDictionary(
    "owned_tokens",
    account_hash_string
  ).then(response => {
    console.log("Owned " + m + "(s)");
    for (let i = 0; i < response.data.length; i++){
      console.log(response.data[i].data);
    };
    console.log("\n");
  }).catch(error => {
    e = "Failed to find base key at path"
    if (error.toString().includes(e.toString())) {
      console.log("Account does not own a " + m);
    }
    else{
      console.log("Unexpected Error, contact developer");
      console.log(error.toString());
    }
  });
}

async function call(){
  //await query_model("Daytona");
  //Daytona_Contract_Hash = await find_model_contract_hash("Daytona");

  /*
  // EXAMPLE MINT
  await mint_model(
  Daytona_Contract_Hash,
  "017910998638dd5580e33b513286e2860b085c422987b83dc0d6b27ad04e0701c1",
  '{\"name\":\"Daytona Watch 08\",\"token_uri\":\"https://www.daytona.ch\",\"checksum\":\"Null\"}'
  );
  await new Promise(r => setTimeout(r, 120000)).then((result) =>
  {
    query_model("Daytona");
  }
  );
  */

  // EXAMPLE TRANSFER
  /*await transfer_piece(
  "017910998638dd5580e33b513286e2860b085c422987b83dc0d6b27ad04e0701c1",
  "hash-b8ba08a37def08f4a5109a96699f88a06cd28c0f774b971efc2f5b74cf71bde4",
  "6c28b5f863a7b48fce435d0dc8664d37ea749591bd115e7cdec108bf6754e4c6",
  "01eecc8e4f5b0bd8e7dd37e236ebb49720d77f9d2ed825dcdf6f1b616ffbb5104a",
  "017910998638dd5580e33b513286e2860b085c422987b83dc0d6b27ad04e0701c1"
  );*/

  // OTHER TESTS
  newKeys();

  /*

  public_key,
  model_contract_hash,
  token_hash,
  target_key,
  source_key

  */
}
call();
// use sdk::Deployutil
// openssl pkey -in private.pem -pubout
