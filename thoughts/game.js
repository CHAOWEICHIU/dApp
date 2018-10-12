/** 
 * Make money by being a banker - (Dashboard)
 * Level System for banker (depends on rounds/incentive that has put in), 
 *  - banker can access different pool depends
*/

/**
 * COST for buying numbers / COST for cash-out
 * 1% to developer team
 * 9% for banker team (referral link) 
 *    - depends on how much revenue it has generated
 *    - withdraw cost will give to developer goes into different pools proportionally
 * 20% for passive income
 * 20% lottery pool
 * 50% final winning
 */

/**
 * TODO
  * break even point base on the reward that putting in
  */

const currentPoolReward = 50000;
const totalKeysCount = 4000;


const user = {
  keysCount: 30,
}

const profitToEarn = (userKeysCount, totalKeysCount) => {
  return (userKeysCount / totalKeysCount) * currentPoolReward
}

let r = profitToEarn(user.keysCount, totalKeysCount)


/*
  Level Mining
*/
