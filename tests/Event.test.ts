import { Event } from '../src';

describe('Event tests', () => {
    test('given typeof Event, it should return function', () => {
        expect(typeof Event).toBe('function');
    });
});
