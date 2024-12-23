import {loadFixture, ethers, expect, time} from "./setup";
import {name, rewardRate, stakeLockTime, unstakeLockTime} from "../stakingContractInit";
import {contractAddress as ET1_address} from "../erc20_addresses/addresses_ET1.json";
import {contractAddress as ET2_address} from "../erc20_addresses/addresses_ET2.json";
import {contractAddress as rewardTokenAddress} from "../erc20_addresses/addresses_MFT.json";

describe("Testing Staking", function() {

    async function deploy() {
        const users = await ethers.getSigners();
    
        const FactoryStaking = await ethers.getContractFactory(name);
        const StakingContract = await FactoryStaking.deploy(rewardRate, stakeLockTime, unstakeLockTime, rewardTokenAddress, lpTokenAddress); 

        return {users, StakingContract};
    }
    
    it("Deployment test", async function(){
        const {StakingContract} = await loadFixture(deploy);
        expect(StakingContract.target).to.be.properAddress;
    });
});