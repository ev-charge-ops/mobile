import { snapSliderValue } from '@/components/ui/slider';

describe('snapSliderValue', () => {
  it('snaps to the step inside the range', () => {
    expect(snapSliderValue(82.4, 50, 100, 5)).toBe(80);
    expect(snapSliderValue(83, 50, 100, 5)).toBe(85);
    expect(snapSliderValue(120, 50, 100, 5)).toBe(100);
    expect(snapSliderValue(-4, 2, 60, 1)).toBe(2);
  });
});
