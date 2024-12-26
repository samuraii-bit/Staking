import { writeFileSync } from 'fs';
import { ethers } from "hardhat";
import {name, rewardRate, stakeLockTime, unstakeLockTime} from "../test/inits/stakingContract.init";
import {rewardTokenContractAddress} from "./config/rewardTokenAddresses.json";
import {uniwswapLPTokenContractAddress as lpTokenAddress} from "./config/uniswapLPTokenInfo.json";

async function main() {
    const stakingContractFactory = await ethers.getContractFactory(name);
    const StakingContract = await stakingContractFactory.deploy(rewardRate, stakeLockTime, unstakeLockTime, rewardTokenContractAddress, lpTokenAddress);

    await StakingContract.waitForDeployment();

    console.log(`Contract deployed to: ${StakingContract.target}`);
    const addresses = {stakingContractAddress: StakingContract.target, ownerAddress: StakingContract.deploymentTransaction()?.from};
    writeFileSync("./scripts/config/StakingContractAddresses.json", JSON.stringify(addresses, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});