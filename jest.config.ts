import type { Config } from '@jest/types';

export default function (): Config.InitialOptions {
    return {
        displayName: 'MACLARY',
        preset: 'ts-jest',
        testEnvironment: 'node',
        testRunner: 'jest-circus/runner',
        testMatch: ['<rootDir>/tests/**/*test.ts'],
    };
}
