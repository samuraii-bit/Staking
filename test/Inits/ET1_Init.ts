import { ethers } from "hardhat";

export const name = "ERC20_T1";
export const symbol = "ET1";
export const decimals = 18;
export const initialSupply = ethers.parseUnits("10000000000", decimals);