const path = require('path')
const fs = require('fs')
const solc = require('solc')

const inboxPath = path.resolve(process.env.PWD, 'contracts', 'Inbox', 'Inbox.sol')
const source = fs.readFileSync(inboxPath, 'utf8')

console.log(solc.compile(source, 1));
