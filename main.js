const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, DeployUtil, CLPublicKey, CLKey, Keys, CLAccountHash } = require('casper-js-sdk');
//const axios = require('axios');
const node_addr = "http://65.108.73.113:7777/rpc/";
const client = new CasperClient(node_addr);
const contract = new Contracts.Contract(client);
const contract_hash = "hash-6e7757c21690a60ac1dd4846a02cf8f4df33e2b933ba68116a9aad9de90ad724"
contract.setContractHash(contract_hash);

function PublicKeyToAccountHashString(key){
  return CLPublicKey.fromHex(key)
}

function asymmetric_keypair_local(){
  return Keys.Ed25519.parseKeyFiles("./pubkey.pem", "./privkey.pem");
}

async function mint_model(model_contract_hash, public_key, metadata){
  // for prototype using the local keypair.
  const model = new Contracts.Contract(client);
  model.setContractHash(model_contract_hash);

  const asymmetric_keypair = asymmetric_keypair_local();
  const public_key_bytes = PublicKeyToAccountHashString(public_key);

  exp = new CLValueBuilder.key(public_key_bytes);
  console.log("EXP:", exp.data);
  args = RuntimeArgs.fromMap({
    // dummy meta as json string: '{\"name\":\"John Doe\",\"token_uri\":\"https://www.barfoo.cong\",\"checksum\":\"940bffb3f2bba35f84313aa26da09ece3ad47045c6a1292c2bbd2df4ab1a55fc\"}'
    'token_meta_data':CLValueBuilder.string(metadata),
    'token_owner': exp
  });

  const result = model.callEntrypoint("mint", args, public_key_bytes, "casper-test", "1000000000", [], 10000000);
  signedDeploy = DeployUtil.signDeploy(result, asymmetric_keypair);
  signedDeploy.send('http://136.243.187.84:7777/rpc').then((result) => {
    console.log(result);
  }).catch((error) => {
    console.log(error);
  });
}

// currently manufacturer is hardcoded, this is to be changed.
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
  Daytona_Contract_Hash = await find_model_contract_hash("Daytona");
  await mint_model(
  Daytona_Contract_Hash,
  "017910998638dd5580e33b513286e2860b085c422987b83dc0d6b27ad04e0701c1",
  '{\"name\":\"Daytona Watch 01\",\"token_uri\":\"https://www.daytona.ch\",\"checksum\":\"Null\"}'
  );
  await query_model("Daytona");
}
call();
// use sdk::Deployutil
// openssl pkey -in private.pem -pubout




/* [PROGRESS BACKUP]
tight_key = "account-hash-bfb5162e42c111b1211e565201777d780c1873f63b767ba73d6bdb398d3a8bb2";

// generates async keypair from keyfiles.
asymkeypair = Keys.Ed25519.parseKeyFiles("./pubkey.pem", "./privkey.pem");
//console.log(asymkeypair);

pubkey_string = "017910998638dd5580e33b513286e2860b085c422987b83dc0d6b27ad04e0701c1";
pubkey = CLPublicKey.fromHex(pubkey_string); // is bytes
// create deploy object
///////////////// cl_account_hash = new CLAccountHash(account_hash_string);

// derive account hash from pubkey?
_acchash = new CLAccountHash(pubkey);

exp = new CLValueBuilder.key(pubkey);
console.log("ACC:", _acchash.data);
console.log("EXP:", exp.data);
args = RuntimeArgs.fromMap({
  'token_meta_data':CLValueBuilder.string('{\"name\":\"John Doe\",\"token_uri\":\"https://www.barfoo.cong\",\"checksum\":\"940bffb3f2bba35f84313aa26da09ece3ad47045c6a1292c2bbd2df4ab1a55fc\"}'),
  'token_owner': exp
});

const result = model.callEntrypoint("mint", args, pubkey, "casper-test", "120000000000", [], 10000000);
signedDeploy = DeployUtil.signDeploy(result, asymkeypair);
signedDeploy.send('http://136.243.187.84:7777/rpc').then((result) => {
  console.log(result);
}).catch((error) => {
  console.log(error);
});
*/
