#! /usr/bin/env node
'use strict';

var fs = require('fs-extra');
var path = require('path');
var argv = require('minimist')(process.argv.slice(2));
var yargv = require('yargs');
const packageName = 'create-staffbase-sso-server';
const validateNPM = require("validate-npm-package-name")
const execFile = require('child_process').execFile;
const util = require('util');
const prompt = require('prompt');
const filepath = require('filepath');
const isValidPath = require('is-valid-path');
const isRelativePath = require('is-relative-path');
const colors = require('colors/safe');

// configure prompt
prompt.message = '';
prompt.delimiter = colors.green(":");

let cwd = process.cwd;
const scaffoldFolder = path.resolve(__dirname, './scaffoldTpl');

yargv
  .usage('Usage: create-staffbase-sso-server <project-directory> [Options]')
  // .command('<path>', 'Create a sample server for Staffbase-SSO', function(yargs) {
  //   return yargs.option('name')
  // })
  // .describe('<path>', 'Path where the template would be generated')
  // .default('_.0', process.cwd(), 'Current working directory')
  .alias('name', 'N')
  // .default('name', process.cwd().substr(process.cwd().lastIndexOf('/') + 1), 'Current Directory Name')
  .string('name')
  // .nargs('name', 1)
  .describe('name', 'a sepcific package.json name of your app')
  .version('0.0.1')
  .help('help')
  .epilogue('for more information, please see the README at http://github.com/Staffbase/create-staffbase-sso-server/master/README.MD')

// console.log('YARGS Parsed Data:\n', util.inspect(yargv.argv, {colors: true}));

let packageJSON = fs.readJSONSync(path.join(scaffoldFolder, 'package.json'));

// Defaults package name to current folder name
let nameParam = yargv.argv.N || yargv.argv.name || process.cwd().substr(process.cwd().lastIndexOf('/') + 1);
// Defaults path to current folder path
let passedPath = yargv.argv._[0] || path.join(process.cwd(), 'server');

// console.log('Default name param:', nameParam);
// console.log('Default Path:', passedPath);
prompt.override = {
  name: yargv.argv.N,
  path: yargv.argv._[0]
};
/**
 * Prompt cli options from user if not provided in args.
 * @param  {String} dstPath The file Path where app is to be generated
 * @param  {String} name name of app in package.json
 * @return {Promise}      Promise resolved when entered values are correct
 */
function promptOptions(dstPath, name) {
  // console.log("promptOptions", dstPath, name);

  const promptSchema = {
    properties: {
      name: {
        description: 'Please enter npm compatible name',
        type: 'string',
        default: name,
        message: 'Name must be npm.js compatible',
        required: true,
        conform: function(value) {
          console.log('Validating name',value);
          return validateNPM(value).validForNewPackages
        }
      },
      path: {
        description: 'Please enter the folder path for the App',
        type: 'string',
        message: 'Entered path is invalid or an already present file on the File System. Please enter a correct filepath,',
        default: dstPath,
        required: true,
        conform: validatePath,
      },
      override: {
        message: colors.yellow('The directory you specified already exists. It directory will be overridden!') +  '\nDo you wish to proceed (y)es|(n)o?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'yes',
        ask: function() {
          let chkPath = dstPath;
          if (prompt.history('path')) {
            chkPath = prompt.history('path').value;
          }
          return filepath.create(chkPath).exists();
        }
      }
    }
  };
  return new Promise( function(resolve, reject) {
    prompt.start()
    .get(promptSchema, function(err ,res) {
      // console.log('PROMPT OUTPUT:\n', err, res);
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

/**
 * Checks if the path specified is valid for setting up the template.
 * Valid means if the path is a valid path and it is not a File (not a folder).
 * @param {String}  path  The path to be checked
 * @return {Boolean}
 */
function validatePath(path) {
  if (isValidPath(path) === false) {
    return false;
  }
  // console.log(colors.red('Here now', isValidPath(path)));
  try {
    let fp = filepath.create(path);
    // console.log(colors.yellow(fp));
    return !(fp.isFile());
  } catch (err) {
    console.log(err);
  }
}
/**
 * Checks if a folder exists
 * @param  {[type]} folderPath [description]
 * @return {[type]}            [description]
 */
function folderExists(folderPath) {
  try {
    let fp = filepath.create(folderPath);
    return fp.exists();
  } catch (err) {
    console.log(colors.red(err));
  }
}

/**
 * Copy contants from the Scaffold Template to the specified folder
 * @param  {String} dstDir THe destination directory where files are to be copied
 * @return {Promise}    Promise resolved when the copy process is complete. Rejected
 * if there is some error in copying files.
 */
function copyContents(dstDir) {
  // console.log("copyContents");
  const scaffoldFolder = path.resolve(__dirname, './scaffoldTpl');
  return fs.copy(scaffoldFolder, dstDir);
}
/**
 * Repace the package.json file from copied fromplate to the new generated one.
 * @return {Promise} Promise resolved when the Package.json is successfully replaced.
 * @param {String}  dstPath  The path of the folder where the package.json needs to be replaced
 * Rejected if there is some error in creating new Package.json file.
 */
function replacePackageJSON(dstPath, nameVal) {
  // console.log("replacePackageJSON");
  let newPackageJSON = Object.assign({}, packageJSON, {name: nameVal});
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
 * @param  {String} path Path of the folder where the packages need to be installed.
 * @return {Promise}      Promise resolved when the packages are successfulyl installed.
 */
function installDeps(dstPath) {
  console.log('Installing dependencies...');
  const opts = {
    cwd: path.resolve(dstPath)
  }
  return new Promise( (resolve, reject) => {
    const child = execFile('npm', ['install'], opts, (err, stdout, stderr) => {
      // console.log(colors.red('Inside Child result', stderr, stdout, err));
      if (err) {
        // console.log(colors.red(err));
        reject(err);
      } else {
        // console.log(colors.green('Inside Child result', stderr, stdout, err));
        resolve(stdout);
      }
    });
  });
}

promptOptions(passedPath, nameParam)
.then(function(promptRes) {
  if (promptRes.override === 'n' || promptRes.override === 'no') {
    return console.log(colors.green('Good Bye!'));
  }
  console.log('\nSetting up your project in: ', promptRes.path);
  // @TODO Don't do anything if the user don't want to override.
  return copyContents(promptRes.path)
  .then((res) => {
    return replacePackageJSON(promptRes.path, promptRes.name)
  })
  .then((res) => {
    return installDeps(promptRes.path);
  })
  .then(console.log)
})
.catch(function(err) {
  if (err.message === 'canceled') {
    return console.log(colors.green('\nGood Bye!'));
  }
  console.log('An error occured.', err);
})
