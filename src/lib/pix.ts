function getEMVValue(id: string, val: string): string {
  const len = String(val.length).padStart(2, '0');
  return `${id}${len}${val}`;
}

export function generatePixEMV(
  chave: string,
  beneficiary: string,
  city: string,
  valueCents: number
): string {
  const valueInReais = (valueCents / 100).toFixed(2);
  let payload = getEMVValue('00', '01');
  const gui = getEMVValue('00', 'br.gov.bcb.pix');
  const key = getEMVValue('01', chave);
  payload += getEMVValue('26', gui + key);
  payload += getEMVValue('52', '0000');
  payload += getEMVValue('53', '986');
  payload += getEMVValue('54', valueInReais);
  payload += getEMVValue('58', 'BR');
  payload += getEMVValue('59', beneficiary.substring(0, 25));
  payload += getEMVValue('60', city.substring(0, 15));
  payload += getEMVValue('62', getEMVValue('05', '***'));
  payload += '6304';

  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    const byte = payload.charCodeAt(i);
    crc ^= byte << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc = crc << 1;
    }
  }
  const crcHex = (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return payload + crcHex;
}
