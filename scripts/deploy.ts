import { writeFileSync } from 'fs';
import { ethers } from "hardhat";
import {name, rewardRate, stakeLockTime, unstakeLockTime} from "../Inits/stakingContractInit";
import {contractAddress as rewardTokenAddress} from "../contractsInfo/MFT_modified_Addresses.json";
import {contractAddress as lpTokenAddress} from "../contractsInfo/uniswapLPTokenInfo.json";

async function main() {
    const stakingContractFactory = await ethers.getContractFactory(name);
    const StakingContract = await stakingContractFactory.deploy(rewardRate, stakeLockTime, unstakeLockTime, rewardTokenAddress, lpTokenAddress);

    await StakingContract.waitForDeployment();

    console.log(`Contract deployed to: ${StakingContract.target}`);
    const addresses = {contractAddress: StakingContract.target, ownerAddress: StakingContract.deploymentTransaction()?.from};
    writeFileSync("../contractsInfo/StakingContractAddresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});