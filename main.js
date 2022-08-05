const { RuntimeArgs, CLValueBuilder, Contracts, CasperClient, DeployUtil, CLPublicKey } = require('casper-js-sdk')

const node_addr = "http://136.243.187.84:7777/rpc";
const client = new CasperClient(node_addr);
const contract = new Contracts.Contract(client);
const contract_hash = "hash-6e7757c21690a60ac1dd4846a02cf8f4df33e2b933ba68116a9aad9de90ad724"
contract.setContractHash(contract_hash);

function PublicKeyToAccountHashString(key){
  return CLPublicKey.fromHex(key).toAccountHashStr().substring(13)
}

async function find_my_model(m) {
  account_hash_string = "7e328c23029e42e8e7ba6e4f61d483daffead4b5598bdac46f195a5fbeadf8c5";
  model_contract_hash = await contract.queryContractDictionary(
    "items",
    m
  ).then(response => {
    return "hash-" + response.data;
  }).catch(error => {
    return None;
  });
  console.log(model_contract_hash);
  const model = new Contracts.Contract(client);
  model.setContractHash(model_contract_hash);

  My_model = model.queryContractDictionary(
    "owned_tokens",
    account_hash_string
  ).then(response => {
    console.log("Owned " + m + "(s)");
    console.log(response.data.data);
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
  await find_my_model("Daytona");
  await find_my_model("Daydate");
}
call();
