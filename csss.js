#! /usr/bin/env node
'use strict';

let fs = require('fs-extra');
let path = require('path');
let yargv = require('yargs');
const validateNPM = require('validate-npm-package-name');
const execFile = require('child_process').execFile;
const prompt = require('prompt');
const filepath = require('filepath');
const isValidPath = require('is-valid-path');
const isRelativePath = require('is-relative-path');
const colors = require('colors/safe');
const util = require('util');

// configure prompt
prompt.message = '';
prompt.delimiter = colors.green(':');

const defaultNPMName = 'my-staffbase-backend';

const scaffoldFolder = path.resolve(__dirname, './scaffoldTpl');

yargv
  .usage('Usage: create-staffbase-sso-server <project-directory> [Options]')
  // .command('<path>', 'Create a sample server for Staffbase-SSO', function(yargs) {
  //   return yargs.option('name')
  // })
  // .describe('<path>', 'Path where the template would be generated')
  // .default('_.0', process.cwd(), 'Current working directory')
  .alias('name', 'N')
  .default('name', defaultNPMName)
  .string('name')
  // .nargs('name', 1)
  .describe('name', 'a sepcific package.json name of your app')
  .version('0.0.1')
  .help('help')
  .epilogue(`for more information,\please see the README at:
    http://www.github.com/Staffbase/create-staffbase-sso-server/master/README.MD`);

// console.log('YARGS Parsed Data:\n', util.inspect(yargv.argv, {colors: true}));

let packageJSON = fs.readJSONSync(path.join(scaffoldFolder, 'package.json'));

// const defaultNPMName = process.cwd().substr(process.cwd().lastIndexOf('/') + 1);

// Defaults package name to current folder name
let nameParam = yargv.argv.N || yargv.argv.name || defaultNPMName;

// console.log('Default name param:', nameParam);
// console.log('Default Path:', passedPath);
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
          colors.yellow('The directory you specified already exists. It directory will be overridden!')
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
/**
 * Prompt cli options from user if not provided in args.
 * @param  {String} dstPath The file Path where app is to be generated
 * @param  {String} name name of app in package.json
 * @return {Promise}      Promise resolved when entered values are correct
 */
function promptOptions(dstPath, name) {
  const promptSchema = {
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
      path: {
        description: 'Please enter the folder path for the App',
        type: 'string',
        message:
          'Entered path is invalid or an already present file on the File System. Please enter a correct filepath,',
        default: getDefPath(prompt.history, dstPath),
        required: true,
        conform: validatePath,
      },
      override: {
        message:
          colors.yellow('The directory you specified already exists. It directory will be overridden!')
            + '\nDo you wish to proceed (y)es|(n)o?',
        validator: /y[es]*|n[o]?/,
        warning: 'Must respond yes or no',
        default: 'yes',
        ask: function() {
          let chkPath = dstPath;
          if (prompt.history('path')) {
            chkPath = prompt.history('path').value;
          }
          return filepath.create(chkPath).exists();
        },
      },
    },
  };
  return new Promise( function(resolve, reject) {
    prompt.start()
    .get(promptSchema, function(err, res) {
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
 * @param {String}  nameVal name value that should be replaced
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
 * @param  {String} dstPath Path of the folder where the packages need to be installed.
 * @return {Promise}      Promise resolved when the packages are successfulyl installed.
 */
function installDeps(dstPath) {
  console.log('Installing dependencies...');
  const opts = {
    cwd: path.resolve(dstPath),
  };
  return new Promise( (resolve, reject) => {
    execFile('npm', ['install'], opts, (err, stdout, stderr) => {
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

let promptRes = {};
// Run the promise chain for the whole process
promptName(nameParam)
.then(function(pathResp) {
  const nameRecv = pathResp.name;
  Object.assign(promptRes, pathResp);
  return promptPath(nameRecv);
})
.then(function(pathResp) {
  if (pathResp.override === 'n' || pathResp.override === 'no') {
    return Promise.reject(console.log(colors.green('Good Bye!')));
  }
  Object.assign(promptRes, pathResp);
  const pathRecv = pathResp.path;
  return(copyContents(pathRecv));
})
.then((res) => {
  return replacePackageJSON(promptRes.path, promptRes);
})
.then((res) => {
  return installDeps(promptRes.path);
})
.then(console.log)
.catch(function(err) {
  if (err.message === 'canceled') {
    return console.log(colors.green('\nGood Bye!'));
  }
  if (err.message) {
    console.log('An error occured.', err);
  }
});
