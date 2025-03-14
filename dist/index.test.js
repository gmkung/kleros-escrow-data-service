"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
// Mock the console.log to avoid cluttering test output
console.log = jest.fn();
describe('Kleros Escrow Data Service', () => {
    test('getEscrowById should log the correct message', async () => {
        await (0, index_1.getEscrowById)('123');
        expect(console.log).toHaveBeenCalledWith('Fetching escrow with ID: 123');
    });
    test('getEscrowsByAddress should log the correct message', async () => {
        const address = '0x1234567890abcdef1234567890abcdef12345678';
        await (0, index_1.getEscrowsByAddress)(address);
        expect(console.log).toHaveBeenCalledWith(`Fetching escrows for address: ${address}`);
    });
});
