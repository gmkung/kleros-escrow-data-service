import { getEscrowById, getEscrowsByAddress, EscrowStatus } from './index';

// Mock the console.log to avoid cluttering test output
console.log = jest.fn();

describe('Kleros Escrow Data Service', () => {
  test('getEscrowById should log the correct message', async () => {
    await getEscrowById('123');
    expect(console.log).toHaveBeenCalledWith('Fetching escrow with ID: 123');
  });

  test('getEscrowsByAddress should log the correct message', async () => {
    const address = '0x1234567890abcdef1234567890abcdef12345678';
    await getEscrowsByAddress(address);
    expect(console.log).toHaveBeenCalledWith(`Fetching escrows for address: ${address}`);
  });
}); 