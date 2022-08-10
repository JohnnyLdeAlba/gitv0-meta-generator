const fs = require('fs/promises');
const ethers = require("ethers");

const IPCLib = require("./ipc-lib");
const IPCEng = require("./ipc-eng");
const IPCGif = require("./ipc-gif");
const IPCCard = require("./ipc-card");

const contractABI = require('./IPCWrapper.abi.json');
const contractAddress = "0xD0f54E91ee2e57EA72B0836565E8dfFDb0a5F950";
const providerURI = "";

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

async function ipc_to_opensea_json(label_ipc) {

  let description = `2022 ${label_ipc.subrace}\n\n${label_ipc.gender}, ${label_ipc.height}, `;
  description+= `${label_ipc.skin_color} Skin, ${label_ipc.hair_color} Hair, ${label_ipc.eye_color} Eyes, ${label_ipc.handedness}-Handed\n\n`;
  description+= `${label_ipc.strength} Strength, 17 Dexterity, 17 Intelligence, 15 Constitution, 6 Luck`;

  const os_json = {
    description: description,
    name: `#${label_ipc.token_id} - ${label_ipc.gender} ${label_ipc.subrace}`,
    image: `ipfs://bafybeihhx6bgrqe62ep7vfqipci3qc7ktkkldwfm4ezkgwzcaly6kpzwg4/${label_ipc.token_id}.gif`,
    attributes: [
      {trait_type: "Race", value: label_ipc.race},
      {trait_type: "Subrace", value: label_ipc.subrace},
      {trait_type: "Gender", value: label_ipc.gender},
      {trait_type: "Height", value: label_ipc.height},
      {trait_type: "Skin Color", value: label_ipc.skin_color},
      {trait_type: "Hair Color", value: label_ipc.hair_color},
      {trait_type: "Eye Color", value: label_ipc.eye_color},
      {trait_type: "Handedness", value: label_ipc.handedness},
      {trait_type: "Birth Year", value: "2022"},
      {trait_type: "Accessories", value: "None"},
      {trait_type: "Strength", value: label_ipc.strength},
      {trait_type: "Force", value: label_ipc.force},
      {trait_type: "Sustain", value: label_ipc.sustain},
      {trait_type: "Tolerance", value: label_ipc.tolerance},
      {trait_type: "Dexterity", value: label_ipc.dexterity},
      {trait_type: "Speed", value: label_ipc.speed},
      {trait_type: "Precision", value: label_ipc.precision},
      {trait_type: "Reaction", value: label_ipc.reaction},
      {trait_type: "Intelligence", value: label_ipc.intelligence},
      {trait_type: "Memory", value: label_ipc.memory},
      {trait_type: "Processing", value: label_ipc.processing},
      {trait_type: "Reasoning", value: label_ipc.reasoning},
      {trait_type: "Constitution", value: label_ipc.constitution},
      {trait_type: "Healing", value: label_ipc.healing},
      {trait_type: "Fortitude", value: label_ipc.fortitude},
      {trait_type: "Vitality", value: label_ipc.vitality},
      {trait_type: "Luck", value: label_ipc.luck}
    ]
  };

  await fs.writeFile(`tokens/${label_ipc.token_id}`, JSON.stringify(os_json));

  return os_json;
}

async function ipc_generate_meta_data(payload) {

  const [ipc, label_ipc] = payload;

  const os_json = ipc_to_opensea_json(label_ipc);
  await IPCGif.ipcgif_store(ipc);
}

async function generate_backup() {

  const provider = new ethers.providers.JsonRpcProvider(providerURI)
  const contract = new ethers.Contract(contractAddress, contractABI, provider);

  const raw_tokens = await contract.uwGetAllTokens(0, 1000);
  const tokens = [];

  for (let index = 0; index < raw_tokens.length; index++)
    tokens[index] = raw_ipc_to_ipc(raw_tokens[index]);
  
  await fs.writeFile("backup.json", JSON.stringify(tokens));
}

async function open_backup() {

  const data = await fs.readFile("backup.json");
  return JSON.parse(data);
}

async function main() {

  const tokens = await open_backup();

  for (let index = 0; index < tokens.length; index++) {

    const payload = tokens[index];
    // await ipc_generate_meta_data(payload);
    await IPCCard.ipccard_store(payload[0]);
  }
}

// generate_backup();
main();
