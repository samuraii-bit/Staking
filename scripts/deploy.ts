import { ethers } from "hardhat";
import {name, rewardRate, stakeLockTime, unstakeLockTime} from "../stakingContractInit";
import {contractAddress as ET1_address} from "../erc20_addresses/addresses_ET1.json";
import {contractAddress as ET2_address} from "../erc20_addresses/addresses_ET2.json";
import {contractAddress as rewardTokenAddress} from "../erc20_addresses/addresses_MFT.json";