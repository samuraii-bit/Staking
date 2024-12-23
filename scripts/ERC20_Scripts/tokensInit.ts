import { ethers } from "hardhat";

export const names = ["MyFirstToken", "ERC20_T1", "ERC20_T2"];
export const symbols = ["MFT", "ET1", "ET2"];
export const decimals = 18;
export const initialSupply = ethers.parseUnits("10000000000000", decimals);