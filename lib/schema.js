const graphql = require('graphql')
const Web3 = require('web3')
const { networks } = require('../truffle')
const { div } = require('../utils/calculation')

const rpcEndpoint = `http://${networks.development.host}:${networks.development.port}`
const PlayerBookContract = require('../build/contracts/PlayerBook.json')
const NumberGameContract = require('../build/contracts/NumberGame.json')

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

// const numberGame = new web3.eth.Contract(
//   NumberGameContract.abi,
//   NumberGameContract.networks['5777'].address,
// )

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLSchema,
  // GraphQLList,
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
        .then(({ addr }) => getBalance(addr)
          .then(balance => ({
            address: addr,
            balance: div(balance, utils.unitMap.ether),
          })))
      ,
    },
  }),
})

const WalletType = new GraphQLObjectType({
  name: 'WalletType',
  fields: () => ({
    address: { type: GraphQLString },
    balance: { type: GraphQLString },
    user: {
      type: UserType,
      resolve: ({ address }) => pIDxAddr_(address)
        .call()
        .then(id => plyr_(id)
          .call()
          .then(({ name, laff, claimable }) => ({
            name: utils.toUtf8(name),
            claimable: div(claimable, utils.unitMap.ether),
            id,
            laffId: laff,
          })))
      ,
    },
  }),
})

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    wallet: {
      type: WalletType,
      args: {
        address: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (parent, { address }) => getBalance(address)
        .then(balance => ({
          address,
          balance: div(balance, utils.unitMap.ether),
        }))
      ,
    },
  },
})


module.exports = new GraphQLSchema({
  query: RootQuery,
  // mutation: Mutation,
})
