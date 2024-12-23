import { writeFileSync } from 'fs';
import { ethers } from "hardhat";
import {names, symbols, decimals, initialSupply} from "./tokensInit";

async function main() {
    const tokenDigit = 2;
    const MyFirstToken = await ethers.getContractFactory(names[tokenDigit]);
    const myFirstToken = await MyFirstToken.deploy(names[tokenDigit], symbols[tokenDigit], decimals, initialSupply);

    await myFirstToken.waitForDeployment();

    console.log(`Contract deployed to: ${myFirstToken.target}`);
    const addresses = {contractAddress: myFirstToken.target, ownerAddress: myFirstToken.deploymentTransaction()?.from};
    writeFileSync(`scripts/ERC20_Scripts/addresses/addresses${tokenDigit}.json`, JSON.stringify(addresses, null, 2));
    
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});