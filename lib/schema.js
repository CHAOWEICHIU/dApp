const graphql = require('graphql')
const Web3 = require('web3')
const _ = require('lodash')
const moment = require('moment')
const fetch = require('node-fetch')
const random = require('random-number-generator')
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

const { methods: { pIDxAddr_, plyr_, pIDxName_ } } = playerBook

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

let inMemoryKitties = []

fetch('https://api.cryptokitties.co/v2/kitties?offset=0&limit=20')
  .then(res => res.json())
  .then(({ kitties }) => {
    inMemoryKitties = kitties
    return null
  })

const fetchUserInfoById = pId => plyr_(pId)
  .call()
  .then(data => (
    !utils.toUtf8(data.name)
      ? null
      : ({
        name: utils.toUtf8(data.name),
        claimable: div(data.claimable, utils.unitMap.ether),
        laffId: Number(data.laff),
        id: Number(pId),
      })
  ))

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    name: { type: GraphQLString },
    claimable: { type: GraphQLString },
    id: { type: GraphQLInt },
    image: {
      type: GraphQLString,
      resolve: parent => inMemoryKitties[parent.id].image_url,
    },
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
      resolve: ({ address }) => pIDxAddr_(address)
        .call()
        .then(pId => fetchUserInfoById(pId))
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
          })))
            .sort((a, b) => Number(a.potAmountWinning) + Number(b.potAmountWinning)))),
    },
  },
})

const PlayerBookType = new GraphQLObjectType({
  name: 'PlayerBookType',
  fields: () => ({
    player: {
      type: UserType,
      args: {
        name: { type: GraphQLString },
        id: { type: GraphQLInt },
      },
      resolve: (parent, { name, id }) => {
        if (id && id !== 0) {
          return fetchUserInfoById(id)
        }
        if (name) {
          return pIDxName_(utils.toHex(name))
            .call()
            .then(pId => (pId === '0' ? null : fetchUserInfoById(pId)))
        }
        return null
      }
      ,
    },
  }),
})

const WEAPONS = [
  {
    name: '姑姑',
    feature: '每 block 產生 3 倍菇菇數 （只維持 2,000 block = 約 3min）',
    image: 'http://lorempixel.com/500/500',
  },
  {
    name: '奶奶',
    feature: '每 block 產生 2 倍菇菇數 （只維持 2,000 block = 約 3min）',
    image: 'http://lorempixel.com/500/500/abstract',
  },
  {
    name: '神奇藥水',
    feature: '加乘 2 倍現有菇菇數量 （限購一次）',
    image: 'http://lorempixel.com/500/500/business',
  },
  {
    name: '菇菇幣',
    feature: '（註冊完就自動生成菇菇幣或用購買的）',
    image: 'http://lorempixel.com/500/500/nightlife',
  },
]

const inGameUserGeneratorWithScore = (withScore) => {
  const score = random(2000, 1)
  const level = random(6, 1)
  const weapons = _.range(0, 4).map((i) => {
    const count = random(10, 0)
    return ({
      weapon: WEAPONS[i],
      count,
    })
  })
  return ({
    score: withScore ? score : 0,
    level: withScore ? level : 0,
    holdingWeapons: withScore ? weapons.filter(a => a.count !== 0) : null,
  })
}

const MushroomInGameWeaponType = new GraphQLObjectType({
  name: 'MushroomInGameWeaponType',
  fields: {
    name: { type: GraphQLString },
    feature: { type: GraphQLString },
    image: { type: GraphQLString },
  },
})

const HoldingWeaponType = new GraphQLObjectType({
  name: 'HoldingWeaponType',
  fields: {
    weapon: { type: MushroomInGameWeaponType },
    count: { type: GraphQLInt },
  },
})

const MushroomInGameParticipantType = new GraphQLObjectType({
  name: 'MushroomInGameParticipantType',
  fields: {
    holdingWeapons: { type: new GraphQLList(HoldingWeaponType) },
    score: { type: GraphQLFloat },
    level: { type: GraphQLInt },
    wallet: { type: WalletType },
  },
})

const GameMushroomType = new GraphQLObjectType({
  name: 'GameMushroomType',
  fields: {
    id: { type: GraphQLInt },
    status: { type: GraphQLString }, // started || waiting || aborted
    startTime: { type: GraphQLFloat },
    endTime: { type: GraphQLFloat },
    waitingRemainBlockCount: { type: GraphQLFloat },
    startedRemainBlockCount: { type: GraphQLFloat },
    participants: { type: new GraphQLList(MushroomInGameParticipantType) },
  },
})

const GameMushroomInformationType = new GraphQLObjectType({
  name: 'GameMushroomInformationType',
  fields: {
    games: {
      type: new GraphQLList(GameMushroomType),
      resolve: () => [
        {
          id: 1,
          status: 'aborted',
          startTime: null,
          endTime: null,
          waitingRemainBlockCount: 0,
          startedRemainBlockCount: 0,
          participants: _.range(1, 10).map(() => inGameUserGeneratorWithScore(false)),
        },
        {
          id: 2,
          status: 'waiting',
          startTime: null,
          endTime: null,
          waitingRemainBlockCount: 2314,
          startedRemainBlockCount: 0,
          participants: _.range(1, 5).map(() => inGameUserGeneratorWithScore(false)),
        },
        {
          id: 3,
          status: 'started',
          startTime: moment().startOf('day').valueOf(),
          endTime: moment().endOf('day').valueOf(),
          waitingRemainBlockCount: 0,
          startedRemainBlockCount: 1314,
          participants: _.range(1, 13).map(() => inGameUserGeneratorWithScore(true)),
        },
      ],
    },
  },
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    gameMushroomInformation: {
      type: GameMushroomInformationType,
      resolve: () => ({}),
    },
    playerBook: {
      type: PlayerBookType,
      resolve: () => ({}),
    },
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
