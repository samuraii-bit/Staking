import { HardhatUserConfig, task } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
    
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