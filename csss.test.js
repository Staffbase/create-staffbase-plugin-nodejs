const validatePath = require('./lib/helpers').validatePath;

const validPath = './scaffoldTpl';
const inValidPath = '*/,js';

describe('Testing csss.validatePath', () => {
  test('test validating existing path', () => {
    expect(validatePath(validPath)).toBe(true);
  });
  test('test validating invalid path', () => {
    expect(validatePath(inValidPath)).toBe(false);
  });
});
