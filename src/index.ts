import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'

const fs = require('fs')
const dotEnvParseVariables = require('dotenv-parse-variables')
const firstRun = require('first-run')

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
        if (err) return resolve(false);
        return resolve(true)
      })
    })
  }

  generateConst(data: any) {

    const output = `// Generated on ${new Date()}
export const environment = {
  /* tslint:disable */
  ${DifferentNgEnv.stringify(data)}
  /* tslint:enable */
};
`

    fs.writeFile('./src/environments/environment.ts', output, (err: any) => {
      if (err) {
        this.log(err)
      }
      this.log('Angular environment file generated')
    })
  }

  async run() {
    const {args, flags} = this.parse(DifferentNgEnv)

    if (flags.clear) {
      firstRun.clear()
    }
    // firstRun.clear()
    if (firstRun()) {
      if (await cli.confirm('This seems to be the first time you run this command, would you like to allow this command to do required changes?')) {
        const envExample = '.env.example'

        if (!await DifferentNgEnv.fileExists(envExample)) {
          fs.closeSync(fs.openSync(envExample, 'w'))
        }

        fs.appendFileSync('.gitignore', 'src/environments')

      }
    }

    const envVars = require('dotenv-safe').config({
      allowEmptyValues: true
    })
    const parsedVars = dotEnvParseVariables(envVars.required)

    this.generateConst(parsedVars)
    // const name = flags.name || 'world'
    // this.log(`hello ${name} from ./src/index.ts`)
    // if (args.file && flags.force) {
    //   this.log(`you input --force and --file: ${args.file}`)
    // }
  }
}

export = DifferentNgEnv
