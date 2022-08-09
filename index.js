const ethers = require("ethers");
const IPCLib = require("./ipc-lib");
const IPCEng = require("./ipc-eng");
const IPCGif = require("./ipc-gif");

const contractABI = require('./IPCWrapper.abi.json');
const contractAddress = "0xD0f54E91ee2e57EA72B0836565E8dfFDb0a5F950";
const providerURI = "https://eth-mainnet.alchemyapi.io/v2/6fYLeoOJ3Vp6ONxoiJ0jWkEYGcR8vRIH";

function raw_ipc_to_ipc(raw_ipc) {

  const dna_bytes = IPCLib.ipc_calculate_dna(raw_ipc.dna);
  const attribute_bytes = IPCLib.ipc_calculate_attributes(raw_ipc.attributeSeed);
    
  const ipc = new IPCLib.t_ipc();
   
  ipc.id = parseInt(raw_ipc.tokenId._hex, 16); 
  ipc.token_id = parseInt(raw_ipc.tokenId._hex, 16); 
  ipc.name = raw_ipc.name;

  ipc.attribute_seed = raw_ipc.attributeSeed;
  ipc.dna = raw_ipc.dna;
  ipc.birth = parseInt(raw_ipc.timeOfBirth._hex, 16);

  ipc.price = 0;
  ipc.xp = parseInt(raw_ipc.experience, 16);
  ipc.owner = raw_ipc.owner; 
 
  ipc.race = dna_bytes[0];
  ipc.subrace = dna_bytes[1];
  ipc.gender = dna_bytes[2];
  ipc.height = dna_bytes[3];

  ipc.skin_color = dna_bytes[5]; 
  ipc.hair_color = dna_bytes[6]; 
  ipc.eye_color = dna_bytes[7];
  ipc.handedness = dna_bytes[4];

  ipc.force = attribute_bytes[0];
  ipc.sustain = attribute_bytes[1];
  ipc.tolerance = attribute_bytes[2];
  ipc.strength = ipc.force + ipc.sustain + ipc.tolerance;  
 
  ipc.speed = attribute_bytes[3];
  ipc.precision = attribute_bytes[4];
  ipc.reaction = attribute_bytes[5];
  ipc.dexterity = ipc.speed + ipc.precision + ipc.reaction;  

  ipc.memory = attribute_bytes[6];
  ipc.processing = attribute_bytes[7];
  ipc.reasoning = attribute_bytes[8];
  ipc.intelligence = ipc.memory + ipc.processing + ipc.reasoning;

  ipc.healing = attribute_bytes[9];
  ipc.fortitude = attribute_bytes[10];
  ipc.vitality = attribute_bytes[11];
  ipc.constitution = ipc.healing + ipc.fortitude + ipc.vitality;   
    
  ipc.luck = attribute_bytes[12];

  ipc.accessories = "";
  if (ipc.accessories == "")
    ipc.accessories = 0;

  ipc.accessories = parseInt(ipc.accessories);
  ipc.last_updated = 0;

  ipc.meta.sprite = "";
  ipc.meta.card = "";
  ipc.meta.canon = "";
  ipc.meta.rumor = "";

  const label_ipc = IPCLib.ipc_create_label_ipc(ipc, IPCEng);

  return [ipc, label_ipc];
}

async function main() {

  const provider = new ethers.providers.JsonRpcProvider(providerURI)
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  let message = await contract.getIpc(944);
  console.log(raw_ipc_to_ipc(message));
  await IPCGif.ipcgif_store(raw_ipc_to_ipc(message)[0])
}

main();
