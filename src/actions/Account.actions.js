import { ethers } from "ethers";
import { addresses, Actions } from "../constants";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { abi as sOHM } from "../abi/sOHM.json";
import { abi as sOHMv2 } from "../abi/sOhmv2.json";

export const fetchAccountSuccess = payload => ({
  type: Actions.FETCH_ACCOUNT_SUCCESS,
  payload,
});

export const loadAccountDetails =
  ({ networkID, provider, address }) =>
  async dispatch => {
    // console.log("networkID = ", networkID)
    // console.log("addresses = ",addresses)

    let ohmContract;
    let ohmBalance = 0;
    let sohmContract;
    let sohmBalance = 0;
    let oldsohmContract;
    let oldsohmBalance = 0;
    let stakeAllowance = 0;
    let unstakeAllowance = 0;
    let daiBondAllowance = 0;

    const daiContract = new ethers.Contract(addresses[networkID].DAI_ADDRESS, ierc20Abi, provider);
    const daiBalance = await daiContract.balanceOf(address);

    if (addresses[networkID].OHM_ADDRESS) {
      ohmContract = new ethers.Contract(addresses[networkID].OHM_ADDRESS, ierc20Abi, provider);
      ohmBalance = await ohmContract.balanceOf(address);
      stakeAllowance = await ohmContract.allowance(address, addresses[networkID].STAKING_HELPER_ADDRESS);
    }

    if (addresses[networkID].DAI_BOND_ADDRESS) {
      daiBondAllowance = await daiContract.allowance(address, addresses[networkID].DAI_BOND_ADDRESS);
    }

    if (addresses[networkID].SOHM_ADDRESS) {
      sohmContract = await new ethers.Contract(addresses[networkID].SOHM_ADDRESS, sOHMv2, provider);
      sohmBalance = await sohmContract.balanceOf(address);
      unstakeAllowance = await sohmContract.allowance(address, addresses[networkID].STAKING_ADDRESS);
    }

    if (addresses[networkID].OLD_SOHM_ADDRESS) {
      oldsohmContract = await new ethers.Contract(addresses[networkID].OLD_SOHM_ADDRESS, sOHM, provider);
      oldsohmBalance = await oldsohmContract.balanceOf(address);
    }

    return dispatch(
      fetchAccountSuccess({
        balances: {
          dai: ethers.utils.formatEther(daiBalance),
          ohm: ethers.utils.formatUnits(ohmBalance, "gwei"),
          sohm: ethers.utils.formatUnits(sohmBalance, "gwei"),
          oldsohm: ethers.utils.formatUnits(oldsohmBalance, "gwei"),
        },
        staking: {
          ohmStake: +stakeAllowance,
          ohmUnstake: +unstakeAllowance,
        },
        bonding: {
          daiAllowance: daiBondAllowance,
        },
      }),
    );
  };
