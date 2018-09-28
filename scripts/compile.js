const solc = require('solc')
const path = require('path')
const fs = require('fs')


const compile = ({ contractPathFromRoot }) => {
  const inboxPath = path.resolve(process.env.PWD, contractPathFromRoot)
  const source = fs.readFileSync(inboxPath, 'utf8')
  return solc.compile(source, 1)
}

module.exports = compile
