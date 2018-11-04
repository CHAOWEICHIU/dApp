const graphql = require('graphql')
const Web3 = require('web3')
const _ = require('lodash')
const moment = require('moment')
const fetch = require('node-fetch')
const random = require('random-number-generator')
const { networks } = require('../../truffle')
const { div, mul } = require('../../utils/calculation')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLFloat,
} = graphql

const rpcEndpoint = `http://${networks.development.host}:${networks.development.port}`
const MushroomContract = require('../../build/contracts/Mushroom.json')

const web3 = new Web3(new Web3.providers.HttpProvider(rpcEndpoint))
const {
  utils,
  eth: {
    getBalance,
  },
} = web3

const mushroom = new web3.eth.Contract(
  MushroomContract.abi,
  MushroomContract.networks['5777'].address,
)

const {
  methods: {
    getGuCoin,
    getPlayerGame,
  },
} = mushroom

const MushroomGameType = new GraphQLObjectType({
  name: 'MushroomGameType',
  fields: {
    id: { type: GraphQLInt },
  },
})


const MushroomUserType = new GraphQLObjectType({
  name: 'MushroomUserType',
  fields: {
    balanceEth: {
      type: GraphQLString,
      resolve: ({ address }) => getBalance(address)
        .then(balance => div(balance, utils.unitMap.ether)),
    },
    balanceGu: {
      type: GraphQLString,
      resolve: ({ address }) => getGuCoin(address).call()
        .then(balance => balance),
    },
    game: {
      type: MushroomGameType,
      resolve: ({ address }) => getPlayerGame(address).call()
        .then(res => (res['0'] === false ? null : ({ id: res['1'] }))),
    },
  },
})

const MushroomType = new GraphQLObjectType({
  name: 'MushroomType',
  fields: {
    userInfo: {
      args: { address: { type: GraphQLString } },
      type: MushroomUserType,
      resolve: (parent, { address }) => ({ address }),
    },
  },
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

// const inGameUserGeneratorWithScore = (withScore) => {
//   const score = random(2000, 1)
//   const level = random(6, 1)
//   const weapons = _.range(0, 4).map((i) => {
//     const count = random(10, 0)
//     return ({
//       weapon: WEAPONS[i],
//       count,
//     })
//   })
//   return ({
//     score: withScore ? score : 0,
//     level: withScore ? level : 0,
//     holdingWeapons: withScore ? weapons.filter(a => a.count !== 0) : null,
//   })
// }

// const MushroomInGameWeaponType = new GraphQLObjectType({
//   name: 'MushroomInGameWeaponType',
//   fields: {
//     name: { type: GraphQLString },
//     feature: { type: GraphQLString },
//     image: { type: GraphQLString },
//   },
// })

// const HoldingWeaponType = new GraphQLObjectType({
//   name: 'HoldingWeaponType',
//   fields: {
//     weapon: { type: MushroomInGameWeaponType },
//     count: { type: GraphQLInt },
//   },
// })

// const MushroomInGameParticipantType = new GraphQLObjectType({
//   name: 'MushroomInGameParticipantType',
//   fields: {
//     holdingWeapons: { type: new GraphQLList(HoldingWeaponType) },
//     score: { type: GraphQLFloat },
//     level: { type: GraphQLInt },
//     wallet: { type: WalletType },
//   },
// })

// const GameMushroomTeamMemberType = new GraphQLObjectType({
//   name: 'GameMushroomTeamMemberType',
//   fields: {
//     level: { type: GraphQLInt },
//     wallet: { type: WalletType },
//   },
// })

// const GameMushroomTeamType = new GraphQLObjectType({
//   name: 'GameMushroomTeamType',
//   fields: {
//     index: { type: GraphQLInt },
//     score: { type: GraphQLFloat },
//     members: { type: new GraphQLList(GameMushroomTeamMemberType) },
//   },
// })

// const GameMushroomType = new GraphQLObjectType({
//   name: 'GameMushroomType',
//   fields: {
//     id: { type: GraphQLInt },
//     status: { type: GraphQLString }, // started || waiting || aborted || ended
//     startTime: { type: GraphQLFloat },
//     endTime: { type: GraphQLFloat },
//     waitingRemainBlockCount: { type: GraphQLFloat },
//     startedRemainBlockCount: { type: GraphQLFloat },
//     teams: { type: new GraphQLList(GameMushroomTeamType) },
//   },
// })

// const GameMushroomInformationType = new GraphQLObjectType({
//   name: 'GameMushroomInformationType',
//   fields: {
//     games: {
//       type: new GraphQLList(GameMushroomType),
//       resolve: () => [
//         {
//           id: 1,
//           status: 'aborted',
//           startTime: null,
//           endTime: null,
//           waitingRemainBlockCount: 0,
//           startedRemainBlockCount: 0,
//           teams: _.range(1, 10).map(() => inGameUserGeneratorWithScore(false)),
//         },
//         {
//           id: 2,
//           status: 'waiting',
//           startTime: null,
//           endTime: null,
//           waitingRemainBlockCount: 2314,
//           startedRemainBlockCount: 0,
//           teams: _.range(1, 5).map(() => inGameUserGeneratorWithScore(false)),
//         },
//         {
//           id: 3,
//           status: 'started',
//           startTime: moment().startOf('day').valueOf(),
//           endTime: moment().endOf('day').valueOf(),
//           waitingRemainBlockCount: 0,
//           startedRemainBlockCount: 1314,
//           teams: _.range(1, 13).map(() => inGameUserGeneratorWithScore(true)),
//         },
//       ],
//     },
//   },
// })

module.exports = MushroomType
