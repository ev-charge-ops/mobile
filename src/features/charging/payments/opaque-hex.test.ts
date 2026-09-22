import { toOpaqueHex } from '@/features/charging/payments/opaque-hex';

describe('toOpaqueHex', () => {
  it('keeps opaque hex colors unchanged', () => {
    expect(toOpaqueHex('#FF3B45', '#000000')).toBe('#ff3b45');
  });

  it('blends translucent rgba colors over the backdrop', () => {
    expect(toOpaqueHex('rgba(255,255,255,0.12)', '#000000')).toBe('#1f1f1f');
  });

  it('treats rgb colors as opaque', () => {
    expect(toOpaqueHex('rgb(10, 20, 30)', '#ffffff')).toBe('#0a141e');
  });
});
