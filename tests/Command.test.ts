import { Command } from '../src';

describe('Command tests', () => {
    test('given typeof Command, it should return function', () => {
        expect(typeof Command).toBe('function');
    });
});
