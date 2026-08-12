import { describe, it, expect } from 'vitest';
import { generatePixEMV } from '@/lib/pix';

describe('generatePixEMV', () => {
  it('generates a valid Pix EMV payload with version 01 and BACEN GUI', () => {
    const payload = generatePixEMV('suachave@email.com', 'Pudim e Cia', 'Araraquara', 17.00);

    expect(payload).toContain('000201'); // Version 01
    expect(payload).toContain('br.gov.bcb.pix'); // BACEN GUI
    expect(payload).toContain('suachave@email.com'); // Key
    expect(payload).toContain('5303986'); // BRL Currency
    expect(payload).toContain('540517.00'); // Value
    expect(payload).toContain('5802BR'); // Country BR
    expect(payload).toContain('Pudim e Cia'); // Beneficiary
    expect(payload).toContain('Araraquara'); // City
    expect(payload).toContain('6304'); // CRC16 Header
  });

  it('appends a 4-character uppercase hex CRC16 checksum at the end', () => {
    const payload = generatePixEMV('suachave@email.com', 'Pudim e Cia', 'Araraquara', 5.00);
    const crcHex = payload.slice(-4);

    expect(crcHex).toMatch(/^[0-9A-F]{4}$/);
  });
});
