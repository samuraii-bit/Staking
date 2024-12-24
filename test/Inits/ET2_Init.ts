import { ethers } from "hardhat";

export const name = "ERC20_T2";
export const symbol = "ET2";
export const decimals = 18;
export const initialSupply = ethers.parseUnits("10000000000", decimals);