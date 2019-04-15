import {Command, flags} from '@oclif/command'
import cli from 'cli-ux'

const fs = require('fs')
const dotEnvParseVariables = require('dotenv-parse-variables')
const firstRun = require('first-run')
const shell = require('shelljs')

class DifferentNgEnv extends Command {
  static description = 'describe the command here'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    clear: flags.boolean({char: 'c'}),
    yes: flags.boolean({char: 'y'})
  }

  static stringify(obj_from_json: any): string {
    if (typeof obj_from_json !== 'object' || Array.isArray(obj_from_json)) {
      // not an object, stringify using native function
      return JSON.stringify(obj_from_json)
    }
    // Implements recursive object serialization according to JSON spec
    // but without quotes around the keys.
    let props = Object
      .keys(obj_from_json)
      .map(key => {
        return `${key}: ${DifferentNgEnv.stringify(obj_from_json[key])}`.replace(/"/g, '\'')
      })
      .join(',\n\t')
    return `${props}`
  }

  static fileExists(path: string): Promise<boolean> {
    return new Promise(resolve => {
      // Check if the file exists in the current directory.
      fs.access(path, fs.constants.F_OK, (err: Error) => {
        if (err) return resolve(false)
        return resolve(true)
      })
    })
  }

  async generateConst(data: any) {
    const filePath = './src/environments/environment.ts'
    const output = `// Generated on ${new Date()}
export const environment = {
  /* tslint:disable */
  ${DifferentNgEnv.stringify(data)}
  /* tslint:enable */
};
`

    if (!await DifferentNgEnv.fileExists(filePath)) {
      fs.mkdirSync('./src/environments', {recursive: true})
    }

    fs.writeFile(filePath, output, (err: any) => {
      if (err) {
        this.log(err)
        return
      }
      this.log('Angular environment file generated')
    })
  }

  async run() {
    const {flags} = this.parse(DifferentNgEnv)

    if (flags.clear) {
      firstRun.clear()
    }
    // firstRun.clear()
    if (firstRun()) {
      const envExample = '.env.example'
      const ignorePath = 'src/environments'
      let runPrep = false
      if (!flags.yes) {
        runPrep = await cli.confirm('This seems to be the first time you run this command, would you like to do required changes automatically?')
      } else {
        runPrep = true
      }

      if (runPrep) {
        if (!await DifferentNgEnv.fileExists(envExample)) {
          fs.closeSync(fs.openSync(envExample, 'w'))
        }

        if (await DifferentNgEnv.fileExists('.gitignore')) {
          fs.readFile('.gitignore', 'utf8', (_error: Error, contents: string) => {
            if (!contents.includes(ignorePath)) {
              fs.appendFileSync('.gitignore', ignorePath)
              this.log(`Added "${ignorePath}" to .gitignore`)
            }
          })
          if (shell.exec(`git ls-files --error-unmatch ${ignorePath}`, {silent: true}).code === 0) {
            shell.exec(`git rm --cached -r ${ignorePath}`)
            this.log(`Removed "${ignorePath}" from versioned files`)
          }
        }
      }
    }

    const envVars = require('dotenv-safe').config({
      allowEmptyValues: true
    })
    const parsedVars = dotEnvParseVariables(envVars.required)

    await this.generateConst(parsedVars)

  }
}

export = DifferentNgEnv
