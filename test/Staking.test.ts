import {loadFixture, ethers, expect, time} from "./setup";
import {name as stakingName, rewardRate, stakeLockTime, unstakeLockTime} from "./inits/stakingContract.init";
import {name as MFTname, symbol, decimals, initialSupply} from "./inits/rewardToken.init"
import {name as lpTokenName} from "./inits/rewardToken.init"

describe("Testing Staking", function() {

    async function deploy() {
        const users = await ethers.getSigners();

        const myFirstTokenFactory = await ethers.getContractFactory(MFTname);
        const rewardToken = await myFirstTokenFactory.deploy(MFTname, symbol, decimals, initialSupply);

        const lpTokenFactory = await ethers.getContractFactory(lpTokenName);
        const lpToken = await lpTokenFactory.deploy(lpTokenName, symbol, decimals, initialSupply);

        const FactoryStaking = await ethers.getContractFactory(stakingName);
        const StakingContract = await FactoryStaking.deploy(rewardRate, stakeLockTime, unstakeLockTime, rewardToken.target, lpToken.target); 

        await lpToken.connect(users[0]).setStakingContract(StakingContract.target);
        await rewardToken.connect(users[0]).setStakingContract(StakingContract.target);

        return {users, StakingContract, rewardToken, lpToken};
    }
    
    it("Deployment test", async function(){
        const {StakingContract} = await loadFixture(deploy);
        expect(StakingContract.target).to.be.properAddress;
    });

    it("stake test: just stake some tokens", async function() {
        const {StakingContract, users, lpToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        const tx = await StakingContract.connect(users[0]).stake(sum);
        
        await expect(tx).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [-sum, sum]);
        await expect(tx).to.emit(StakingContract, "Stake").withArgs(users[0].address, sum);

        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(sum);
    });

    it("stake test: staking 2nd time after 1 day", async function() {
        const {StakingContract, users, lpToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        const tx1 = await StakingContract.connect(users[0]).stake(sum);
        
        await expect(tx1).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [-sum, sum]);
        await expect(tx1).to.emit(StakingContract, "Stake").withArgs(users[0].address, sum);
        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(sum);


        const oneDayLater = (await time.latest()) + (24 * 60 * 60);
        await time.increaseTo(oneDayLater);

        const tx2 = await StakingContract.connect(users[0]).stake(sum);
        
        await expect(tx2).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [-sum, sum]);
        await expect(tx2).to.emit(StakingContract, "Stake").withArgs(users[0].address, sum);
        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(sum + sum);
    });

    it("stake test: staking 2nd time after 2 days", async function() {
        const {StakingContract, users, lpToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        const tx1 = await StakingContract.connect(users[0]).stake(sum);
        
        await expect(tx1).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [-sum, sum]);
        await expect(tx1).to.emit(StakingContract, "Stake").withArgs(users[0].address, sum);
        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(sum);


        const twoDaysLater = (await time.latest()) + (24 * 60 * 60 * 2);
        await time.increaseTo(twoDaysLater);

        const tx2 = await StakingContract.connect(users[0]).stake(sum);
        
        await expect(tx2).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [-sum, sum]);
        await expect(tx2).to.emit(StakingContract, "Stake").withArgs(users[0].address, sum);
        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(sum + sum);
        await expect((await StakingContract.stakes(users[0].address)).unstakeAvailable).to.be.equal(sum);
    });

    it("stake test: staking 2nd time after 23 hours", async function() {
        const {StakingContract, users, lpToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        await StakingContract.connect(users[0]).stake(sum);

        const twentyThreeHoursLater = (await time.latest()) + 23 * 60 * 60;
        await time.increaseTo(twentyThreeHoursLater);

        const tx = await StakingContract.connect(users[0]);
        
        await expect(tx.stake(sum)).to.be.revertedWith("U have to wait");
    });

    it("stake test: trying to stake 0 tokens", async function() {
        const {StakingContract, users, lpToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("0", decimals);
        const tx = await StakingContract.connect(users[0]);
        
        await expect(tx.stake(sum)).to.be.revertedWith("Amount must be greater than 0");
    });

    it("stake test: trying to stake more than user have on the balance", async function() {
        const {StakingContract, users, lpToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        const tx = await StakingContract.connect(users[1]);
        
        await expect(tx.stake(sum)).to.be.revertedWith("No funds enough to stake");
    });

    it("claim test: getting reward", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        await StakingContract.connect(users[0]).stake(sum);
        const currentBalance = (await StakingContract.stakes(users[0].address)).balance;
        
        const oneDay = 60 * 60 * 24;
        const oneDayLater = (await time.latest()) + oneDay;
        await time.increaseTo(oneDayLater);

        const tx = await StakingContract.connect(users[0]).claim();

        await expect((await StakingContract.stakes(users[0].address)).reward).to.be.equal(0);
        await expect(tx).to.emit(StakingContract, "Claim").withArgs(users[0].address);
    });

    it("claim test: trying to get reward when it is no rewards on the balance", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const tx = await StakingContract.connect(users[0]);
        
        await expect(tx.claim()).to.be.revertedWith("There are no available rewards");
    });

    it("unstake test: unstake all", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        await StakingContract.connect(users[0]).stake(sum);

        const oneDay = 60 * 60 * 24;
        const twoDaysLater = (await time.latest()) + oneDay * 2;
        await time.increaseTo(twoDaysLater);

        const tx = await StakingContract.connect(users[0]).unstake();
        const expectedBalance = (await StakingContract.stakes(users[0].address)).balance - (await StakingContract.stakes(users[0].address)).unstakeAvailable;
        
        await expect(tx).to.emit(StakingContract, "Unstake").withArgs(users[0].address);
        await expect(tx).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [sum, -sum]);
        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(expectedBalance);
        await expect((await StakingContract.stakes(users[0].address)).unstakeAvailable).to.be.equal(0);
    });

    it("unstake test: unstake all after 2 days", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        await StakingContract.connect(users[0]).stake(sum);

        const oneDay = 60 * 60 * 24;
        const twoDaysLater = (await time.latest()) + oneDay * 2;
        await time.increaseTo(twoDaysLater);

        const tx = await StakingContract.connect(users[0]).unstake();
        const expectedBalance = (await StakingContract.stakes(users[0].address)).balance - (await StakingContract.stakes(users[0].address)).unstakeAvailable;
        
        await expect(tx).to.emit(StakingContract, "Unstake").withArgs(users[0].address);
        await expect(tx).to.changeTokenBalances(lpToken, [users[0].address, StakingContract.target], [sum, -sum]);
        await expect((await StakingContract.stakes(users[0].address)).balance).to.be.equal(expectedBalance);
        await expect((await StakingContract.stakes(users[0].address)).unstakeAvailable).to.be.equal(0);
    });
    
    it("unstake test: trying to unstake all after 1 day", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const sum = ethers.parseUnits("100", decimals);
        await StakingContract.connect(users[0]).stake(sum);

        const oneDay = 60 * 60 * 24;
        const oneDayLater = (await time.latest()) + oneDay;
        await time.increaseTo(oneDayLater);

        const tx = await StakingContract.connect(users[0]);
        
        await expect(tx.unstake()).to.be.revertedWith("There are no tokens to unstake");
    });

    it("unstake test: trying to unstake all after 1 day", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const tx = await StakingContract.connect(users[0]);
        
        await expect(tx.unstake()).to.be.revertedWith("There are no tokens to unstake");
    });

    it("setNewRewardRate test: setting new rewardRate = 20 %", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const tx = await StakingContract.connect(users[0]).setNewRewardRate(20);

        await expect(tx).to.emit(StakingContract, "SetNewRewardRate").withArgs(20);
        await expect(await StakingContract.rewardRate()).to.be.equal(20);
    });

    it("setNewRewardRate test: trying to set new rewardRate = 20 % as non-admin", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const tx = await StakingContract.connect(users[1]);

        await expect(tx.setNewRewardRate(20)).to.be.revertedWith("Only admins can use this function");
    });

    it("setNewStakeLockTime test: setting new StakeLockTime = 1 week", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const oneWeek = 60 * 60 * 24 * 7; 
        const tx = await StakingContract.connect(users[0]).setNewStakeLockTime(oneWeek);

        await expect(tx).to.emit(StakingContract, "SetNewStakeLockTime").withArgs(oneWeek);
        await expect(await StakingContract.stakeLockTime()).to.be.equal(oneWeek);
    });

    it("setNewStakeLockTime test: trying to set new StakeLockTime = 1 week as non-admin", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const oneWeek = 60 * 60 * 24 * 7; 
        const tx = await StakingContract.connect(users[1]);

        await expect(tx.setNewStakeLockTime(oneWeek)).to.be.revertedWith("Only admins can use this function");
    });

    it("setNewUnstakeLockTime test: setting new UnstakeLockTime = 2 weeks", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const twoWeeks = 60 * 60 * 24 * 7 * 2; 
        const tx = await StakingContract.connect(users[0]).setNewUnstakeLockTime(twoWeeks);

        await expect(tx).to.emit(StakingContract, "SetNewUnstakeLockTime").withArgs(twoWeeks);
        await expect(await StakingContract.unstakeLockTime()).to.be.equal(twoWeeks);
    });

    it("setNewUnstakeLockTime test: trying to set new UnstakeLockTime = 2 weeks as non-admin", async function(){
        const {StakingContract, users, lpToken, rewardToken} = await loadFixture(deploy);
        const twoWeeks = 60 * 60 * 24 * 7 * 2; 
        const tx = await StakingContract.connect(users[1]);

        await expect(tx.setNewUnstakeLockTime(twoWeeks)).to.be.revertedWith("Only admins can use this function");
    });
});