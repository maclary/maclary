import { Plugin } from '../src';

describe('Plugin tests', () => {
    test('given typeof Plugin, it should return function', () => {
        expect(typeof Plugin).toBe('function');
    });
});
