import { ethers } from "hardhat";

export const name = "Staking";
export const rewardRate = 10;
export const stakeLockTime = Number(60 * 60 * 24);
export const unstakeLockTime = Number(60 * 60 * 24 * 2);