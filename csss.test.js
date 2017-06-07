let validatePath = require('./lib/helpers').validatePath;

let validPath = './scaffoldTpl';
let inValidPath = '*/,js';

describe('Testing csss.validatePath', () => {
  test('test validating existing path', () => {
    expect(validatePath(validPath)).toBe(true);
  });
  test('test validating invalid path', () => {
    expect(validatePath(inValidPath)).toBe(false);
  });
});
