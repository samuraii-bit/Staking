import { writeFileSync } from 'fs';
import { ethers } from "hardhat";
import {name, symbol, decimals, initialSupply} from "../Inits/MFT_Init";

async function main() {
    const MFTFactory = await ethers.getContractFactory(name);
    const MFTContract = await MFTFactory.deploy(name, symbol, decimals, initialSupply);

    await MFTContract.waitForDeployment();

    console.log(`Contract deployed to: ${MFTContract.target}`);
    const addresses = {contractAddress: MFTContract.target, ownerAddress: MFTContract.deploymentTransaction()?.from};
    writeFileSync("../contractsInfo/MFT_modified_Addresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});