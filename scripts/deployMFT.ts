import { writeFileSync } from 'fs';
import { ethers } from "hardhat";
import {name, symbol, decimals, initialSupply} from "../test/inits/rewardToken.init";

async function main() {
    const MFTFactory = await ethers.getContractFactory(name);
    const MFTContract = await MFTFactory.deploy(name, symbol, decimals, initialSupply);

    await MFTContract.waitForDeployment();

    console.log(`Contract deployed to: ${MFTContract.target}`);
    const addresses = {rewardTokenContractAddress: MFTContract.target, ownerAddress: MFTContract.deploymentTransaction()?.from};
    writeFileSync("./scripts/config/rewardTokenAddresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});