import { HardhatUserConfig, task } from "hardhat/config";
import {contractAddress as StakingContractAddress} from "./addresses.json";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const StakingContractName = "Staking";
export const rewardRate = 10;
export const stakeLockTime = 60 * 60 * 24;
export const unstakeLockTime = 60 * 60 * 24 * 2;

task("stake", "Staking tokens")
  .addParam("amount", "The amount of tokens to stake")
  .addParam("address", "The address from which u want stake tokens")
    .setAction(async (taskArgs, hre) => {
      const amount = taskArgs.amount;
      const signer = await hre.ethers.getSigner(taskArgs.address);
      const StakingContract = await hre.ethers.getContractAt(StakingContractName, StakingContractAddress);
      const tx = await StakingContract.connect(signer).stake(amount);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
          console.log(`${amount} of tokens were successfully staked `);
      } else {
          console.error("Transaction failed");
      };
    });

task("unstake", "Unstaking tokens")
  .addParam("address", "The address for which u want unstake tokens")
    .setAction(async (taskArgs, hre) => {
      const address = taskArgs.address;
      const signer = await hre.ethers.getSigner(address);
      const StakingContract = await hre.ethers.getContractAt(StakingContractName, StakingContractAddress);
      const tx = await StakingContract.connect(signer).unstake();
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
          console.log(`All of tokens were successfully unstaked to ${address}`);
      } else {
          console.error("Transaction failed");
      };
    });

task("claim", "Claim reward tokens")
  .addParam("address", "The address for which u want claim reward tokens")
    .setAction(async (taskArgs, hre) => {
      const address = taskArgs.address;
      const signer = await hre.ethers.getSigner(address);
      const StakingContract = await hre.ethers.getContractAt(StakingContractName, StakingContractAddress);
      const tx = await StakingContract.connect(signer).claim();
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
          console.log(`All of reward tokens were successfully claimed to ${address}`);
      } else {
          console.error("Transaction failed");
      };
    });

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: process.env.SEPOLIA_URL,
      accounts: process.env.PRIVATE_KEYS ? process.env.PRIVATE_KEYS.split(",") : [],
    },
  },
  etherscan :{
    apiKey: process.env.ETHERSCAN_API,
  },
};

export default config;