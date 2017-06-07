const isValidPath = require('is-valid-path');
const filepath = require('filepath');
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
  try {
    let fp = filepath.create(path);
    // console.log(colors.yellow(fp));
    return !(fp.isFile());
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  validatePath: validatePath,
};
