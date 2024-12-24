// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStaking {
    event Stake(address _from, uint256 _amount);
    event Claim(address _to);
    event Unstake(address _from);
    event SetNewRewardRate(uint256 _rewardRate);
    event SetNewStakeLockTime(uint256 _stakeLockTime);
    event SetNewUnstakeLockTime(uint256 _unstakeLockTime);
}