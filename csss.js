#! /usr/bin/env node
'use strict';
const fs = require('fs-extra');
const path = require('path');
const yargv = require('yargs');
const validateNPM = require('validate-npm-package-name');
const execFile = require('child_process').execFile;
const prompt = require('prompt');
const filepath = require('filepath');
const validatePath = require('./lib/helpers').validatePath;
const isRelativePath = require('is-relative');
const colors = require('colors/safe');

// configure prompt
prompt.message = '';
prompt.delimiter = colors.green(':');
// set default values
const defaultNPMName = 'my-staffbase-backend';
const scaffoldFolder = path.resolve(__dirname, './scaffoldTpl');
const scaffoldFolderTS = path.resolve(__dirname, './scaffoldTplTS');

yargv
    .usage('Usage: create-staffbase-sso-server <project-directory> [Options]')
    .alias('name', 'N')
    .string('name')
    .describe('name', 'a specific package.json name of your app')
    .version('0.0.1')
    .help('help')
    .epilogue(`for more information, please see the README at:
    http://www.github.com/Staffbase/create-staffbase-sso-server/master/README.MD`);
const packageJSON = fs.readJSONSync(path.join(scaffoldFolder, 'package.json'));
const packageJsonTS = fs.readJSONSync(path.join(scaffoldFolderTS, 'package.json'));
// Defaults package name to current folder name
const nameParam = yargv.argv.N || yargv.argv.name || defaultNPMName;
prompt.override = {
  name: yargv.argv.N,
  path: yargv.argv._[0],
};
/**
 * Prompts user for just the npm name value.
 * @param  {String} name name of app in package.json
 * @return {[type]}      Promise resolved when correct name is entered. Resolved with prompt object
 */
function promptName(name) {
  const namePromptSchema = {
    properties: {
      name: {
        description: 'What is the npm name of your plugin?',
        type: 'string',
        default: name,
        message: 'Name must be npm.js compatible',
        required: true,
        conform: function(value) {
          return validateNPM(value).validForNewPackages;
        },
      },
    },
  };
  return new Promise(function(resolve, reject) {
    prompt.start()
        .get(namePromptSchema, function(err, res) {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        });
  });
}
/**
 * Prompt path and ask to override folder if it exists
 * @param {String} promtedName
 * @return {[type]}         [description]
 */
function promptPath(promtedName) {
  const defPath = path.resolve(path.join(process.cwd(), promtedName));
  const pathPromptSchema = {
    properties: {
      path: {
        description: 'Please enter the folder path for the App',
        type: 'string',
        message:
          'Entered path is invalid or an already present file on the File System. Please enter a correct filepath,',
        default: defPath,
        required: true,
        conform: validatePath,
      },
      override: {
        message:
          colors.yellow('The directory you specified already exists. It will be overridden!')
            + '\nDo you wish to proceed (y)es|(n)o?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'yes',
        ask: function() {
          let chkPath = defPath;
          if (prompt.history('path')) {
            chkPath = prompt.history('path').value;
          }
          return filepath.create(chkPath).exists();
        },
      },
    },
  };
  return new Promise(function(resolve, reject) {
    prompt.get(pathPromptSchema, function(err, res) {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

function promptIsTypescript(isTypescript) {
  const promptIsTypescriptSchema = {
    properties: {
      isTypescript: {
        description: 'Do you want a typescript ready project?',
        type: 'boolean',
        default: false,
        required: true
      },
    }
  }
}

/**
 * Copy content from the Scaffold Template to the specified folder
 * @param  {String} dstDir THe destination directory where files are to be copied
 * @return {Promise}    Promise resolved when the copy process is complete. Rejected
 * if there is some error in copying files.
 */
function copyContents(dstDir) {
  // console.log(colors.blue('Copying from:' + path.resolve(__dirname, './scaffoldTpl')));
  const scaffoldFolder = path.resolve(__dirname, './scaffoldTpl');
  return fs.copy(scaffoldFolder, dstDir);
}
/**
 * Repace the package.json file from copied fromplate to the new generated one.
 * @return {Promise} Promise resolved when the Package.json is successfully replaced.
 * @param {String}  dstPath  The path of the folder where the package.json needs to be replaced
 * @param {String}  nameVal name value that should be replaced
 * Rejected if there is some error in creating new Package.json file.
 */
function replacePackageJSON(dstPath, nameVal) {
  // console.log("replacePackageJSON");
  const newPackageJSON = Object.assign({}, packageJSON, {name: nameVal});
  const curDir = path.resolve(dstPath);
  const packagePath = path.resolve(path.join(curDir, 'package.json'));
  return fs.remove(packagePath)
      .then(function(data) {
        // console.log(colors.yellow('Writing json...'));
        return fs.writeJson(packagePath, newPackageJSON, {spaces: 2});
      });
}
/**
 * Installs the node modules in the folder where the template was created.
 * The function runs "npm install" command.
 * @param  {String} dstPath Path of the folder where the packages need to be installed.
 * @return {Promise}      Promise resolved when the packages are successfulyl installed.
 */
function installDeps(dstPath) {
  console.log(colors.italic('\nInstalling dependencies...'));
  const opts = {
    cwd: path.resolve(dstPath),
  };
  return new Promise( (resolve, reject) => {
    execFile('npm', ['install'], opts, (err, stdout, stderr) => {
      // console.log(colors.red('Inside Child result', stderr, stdout, err));
      if (err) {
        // console.log(colors.red(err));
        return reject(err);
      }
      return resolve(stdout);
    });
  });
}



/**
 * Removes the target directory if it exists.
 * @param  {String} dstPath Path of target directory.
 * @return {Promise}         Promise resolved when the directory is removed or the directory doesn't exist,
 * rejected when there is an error in removing the directory.
 */
function removeExistingFolder(dstPath) {
  const fp = filepath.create(dstPath);
  if (fp.exists()) {
    return fs.remove(fp.toString())
        .then(function() {
          console.log(colors.red('Removing existing folder and its contents...'));
          return dstPath;
        });
  } else {
    return Promise.resolve(dstPath);
  }
}

/**
 *
 * @return {Promise<void>}
 */
const startPrompt = async () => {
  try {
    let promptRes = {};
    const {name} = await promptName(nameParam);
    promptRes.name = name;
    const {override, path} = await promptPath(name);
    if (override === 'n' || override === 'no') {
      return Promise.reject(console.log(colors.green('Good Bye!')));
    }
    promptRes.path = path;
    if (isRelativePath(path)) {
      promptRes.path = path.resolve(path.join(process.cwd(), path));
    }
    await removeExistingFolder(promptRes.path);
    await copyContents(promptRes.path);
    await replacePackageJSON(promptRes.path, name);
    const npmOutput = await installDeps(promptRes.path);
    console.log(colors.yellow(npmOutput));
    console.log(colors.green(`
Your application setup is complete!
Please see the generated README.MD file to get more details about next steps.
You can find your application template in: ${promptRes.path}.
    `));
  } catch (err) {
    if (err.message === 'canceled') {
      return console.log(colors.green('\nGood Bye!'));
    }
    if (err.message) {
      console.log('An error occurred.', err);
    }
  }
};
startPrompt();

module.exports = {
  validatePath: validatePath,
};
