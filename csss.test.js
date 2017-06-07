let csss = require('./csss');

let validPath = './scaffoldTpl';
let inValidPath = '*/,js';

describe('Testing csss.validatePath', () => {
  test('test validating existing path', () => {
    expect(csss.validatePath(validPath)).toBe(true);
  });
  test('test validating invalid path', () => {
    expect(csss.validatePath(inValidPath)).toBe(false);
  });
});
