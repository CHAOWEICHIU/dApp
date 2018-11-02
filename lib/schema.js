const graphql = require('graphql')
const Web3 = require('web3')
const _ = require('lodash')
const moment = require('moment')
const { networks } = require('../truffle')
const { div, mul } = require('../utils/calculation')

const rpcEndpoint = `http://${networks.development.host}:${networks.development.port}`
const PlayerBookContract = require('../build/contracts/PlayerBook.json')
const NumberGameContract = require('../build/contracts/NumberGame.json')

const timestampFromUintToNumber = uint => Number(mul(uint, '1000'))

const web3 = new Web3(new Web3.providers.HttpProvider(rpcEndpoint))
const {
  utils,
  eth: {
    getBalance,
  },
} = web3

const playerBook = new web3.eth.Contract(
  PlayerBookContract.abi,
  PlayerBookContract.networks['5777'].address,
)

const { methods: { pIDxAddr_, plyr_ } } = playerBook

const numberGame = new web3.eth.Contract(
  NumberGameContract.abi,
  NumberGameContract.networks['5777'].address,
)

const {
  methods: {
    keyPrice_,
    currentLotteryPot_,
    totalGameCount_,
    gameActivationFee_,
    games_,
    keyRevealFee_,
    snapshotWinnerFee_,
  },
} = numberGame

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
} = graphql


const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    name: { type: GraphQLString },
    claimable: { type: GraphQLString },
    id: { type: GraphQLString },
    affiliate: {
      type: WalletType, /* eslint-disable-line */ 
      resolve: ({ laffId }) => plyr_(laffId)
        .call()
        .then(({ addr }) => ({ address: addr }))
      ,
    },
  }),
})

const WalletType = new GraphQLObjectType({
  name: 'WalletType',
  fields: () => ({
    address: { type: GraphQLString },
    balance: {
      type: GraphQLString,
      resolve: ({ address }) => getBalance(address)
        .then(balance => div(balance, utils.unitMap.ether)),
    },
    user: {
      type: UserType,
      resolve: ({ address }) => pIDxAddr_(address).call().then(pId => plyr_(pId)
        .call()
        .then(data => ({
          name: utils.toUtf8(data.name),
          claimable: div(data.claimable, utils.unitMap.ether),
          laffId: data.laff,
          id: pId,
        })))
      ,
    },
  }),
})

const getGameById = id => games_(id)
  .call()
  .then(game => (game.startTime === 0 || game.startTime === '0'
    ? null
    : ({
      ...game,
      startTime: timestampFromUintToNumber(game.startTime),
      endTime: timestampFromUintToNumber(game.endTime),
      winningAmount: div(game.totalAmount, utils.unitMap.ether),
      id,
    })))


const GameType = new GraphQLObjectType({
  name: 'GameType',
  fields: () => ({
    id: { type: GraphQLInt },
    potAmountWinning: { type: GraphQLString },
    startTime: { type: GraphQLFloat },
    endTime: { type: GraphQLFloat },
    feeKeyPurchasing: { type: GraphQLString },
    feeKeyRevealing: { type: GraphQLString },
    feeSnapshotWinner: { type: GraphQLString },
    status: { type: GraphQLString },
    bankerWallet: {
      type: WalletType,
      resolve: parent => ({ address: parent.bankerAddress }),
    },
  }),
})


const GameInformationType = new GraphQLObjectType({
  name: 'GameInformationType',
  fields: {
    count: { type: GraphQLInt },
    potAmountLottery: { type: GraphQLString },
    feeGameActivation: { type: GraphQLString },
    games: {
      type: new GraphQLList(GameType),
      args: { gameIds: { type: new GraphQLList(GraphQLInt) } },
      resolve: ({ count }, { gameIds }) => Promise.all([
        keyRevealFee_().call(),
        snapshotWinnerFee_().call(),
        keyPrice_().call(),
      ])
        .then(([
          feeKeyRevealing,
          feeSnapshotWinner,
          feeKeyPurchasing,
        ]) => Promise.all(
          gameIds
            ? gameIds.map(num => getGameById(num))
            : _.range(1, Number(count) + 1).map(num => getGameById(num)),
        )
          .then(games => games.filter(game => game).map(game => (!game ? null : ({
            ...game,
            startTime: game.startTime,
            endTime: game.endTime,
            id: game.id,
            status: (moment(game.endTime).diff(moment()) > 0) ? 'active' : 'finished',
            potAmountWinning: game.winningAmount,
            feeKeyRevealing: div(feeKeyRevealing, utils.unitMap.ether),
            feeSnapshotWinner: div(feeSnapshotWinner, utils.unitMap.ether),
            feeKeyPurchasing: div(feeKeyPurchasing, utils.unitMap.ether),
          }))))),
    },
  },
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    gameInformation: {
      type: GameInformationType,
      resolve: () => Promise.all([
        totalGameCount_().call(),
        currentLotteryPot_().call(),
        gameActivationFee_().call(),
      ])
        .then(([
          count,
          potAmountLottery,
          feeGameActivation,
        ]) => ({
          count,
          potAmountLottery: div(potAmountLottery, utils.unitMap.ether),
          feeGameActivation: div(feeGameActivation, utils.unitMap.ether),
        }))
      ,
    },
    wallet: {
      type: WalletType,
      args: {
        address: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, { address }) => ({ address }),
    },
  },
})


module.exports = new GraphQLSchema({
  query: RootQuery,
  // mutation: Mutation,
})
