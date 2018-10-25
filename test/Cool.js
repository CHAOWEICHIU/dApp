/* eslint-disable */

const Test = artifacts.require("./TestContract.sol")

contract("TestContract", accounts => {
  it('should return mim number', async () => {
    const testContract = await Test.deployed();
    await testContract
      .testMin([2])
      .then(num => assert.equal(num, 2))
    await testContract
      .testMin([2,1,3,5,6,3,3])
      .then(num => assert.equal(num, 1))
    await testContract
      .testMin([0, 1, 3])
      .then(num => assert.equal(num, 0))
    await testContract
      .testMin([])
      .then(num => assert.equal(num, 0))
  })
})
