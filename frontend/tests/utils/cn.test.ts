import { cn } from '../../src/utils/cn';

describe('cn utility', () => {
  it('combines string classnames', () => {
    expect(cn('btn', 'btn-primary')).toBe('btn btn-primary');
  });

  it('filters out falsy and boolean classnames', () => {
    expect(cn('btn', false, null, undefined, 'btn-primary')).toBe('btn btn-primary');
  });

  it('handles object argument conditionally', () => {
    expect(cn('btn', { 'btn-active': true, 'btn-disabled': false })).toBe('btn btn-active');
  });

  it('merges tailwind conflicts correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });
});
