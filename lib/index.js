#!/usr/bin/env node

const fs = require('fs')
const dotEnvParseVariables = require('dotenv-parse-variables')
const argv = require('yargs').argv
const shell = require('shelljs')
const pkg = require(process.cwd() + '/package.json')

function stringify(obj_from_json) {
  if (typeof obj_from_json !== 'object' || Array.isArray(obj_from_json)) {
    // not an object, stringify using native function
    return JSON.stringify(obj_from_json)
  }
  // Implements recursive object serialization according to JSON spec
  // but without quotes around the keys.
  let props = Object
    .keys(obj_from_json)
    .map(key => {
      return `${key}: ${stringify(obj_from_json[key])}`.replace(/"/g, '\'')
    })
    .join(',\n\t')
  return `${props}`
}

function fileExists(path) {
  return new Promise(resolve => {
    // Check if the file exists in the current directory.
    fs.access(path, fs.constants.F_OK, (err) => {
      if (err) return resolve(false)
      return resolve(true)
    })
  })
}

async function generateConst(data) {
  const filePath = './src/environments/environment.ts'
  const output = `// Generated on ${new Date()}
export const environment = {
  /* tslint:disable */
  pkg_version: '${pkg.version}',
  ${stringify(data)}
  /* tslint:enable */
};
`

  if (!await fileExists(filePath)) {
    fs.mkdirSync('./src/environments', {recursive: true})
  }

  fs.writeFile(filePath, output, (err) => {
    if (err) {
      console.log(err)
      return
    }
    console.log('Angular environment file generated')
  })
}

async function run() {
  const runPrep = argv.y || false
  const envExample = '.env.example'
  const ignorePath = 'src/environments'

  if (runPrep) {
    if (!await fileExists(envExample)) {
      fs.closeSync(fs.openSync(envExample, 'w'))
    }

    if (await fileExists('.gitignore')) {
      fs.readFile('.gitignore', 'utf8', (_error, contents) => {
        if (!contents.includes(ignorePath)) {
          fs.appendFileSync('.gitignore', ignorePath)
          console.log(`Added "${ignorePath}" to .gitignore`)
        }
      })
      if (shell.exec(`git ls-files --error-unmatch ${ignorePath}`, {silent: true}).code === 0) {
        shell.exec(`git rm --cached -r ${ignorePath}`)
        console.log(`Removed "${ignorePath}" from versioned files`)
      }
    }
  }
  

  const envVars = require('dotenv-safe').config({
    allowEmptyValues: true
  })
  const parsedVars = dotEnvParseVariables(envVars.required)

  await generateConst(parsedVars)
}

module.exports.run = run;

console.log(process.cwd(), pkg.version);





