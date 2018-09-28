const compile = require('./scripts/compile')
const { systemLogger } = require('./utils/logger')

const { contracts } = compile({ contractPathFromRoot: 'contracts/Inbox/Inbox.sol' })

const out = contracts[':Dice'].interface

systemLogger({ message: JSON.stringify(JSON.parse(out), null, 2) })
