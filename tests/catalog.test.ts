import { describe, expect, it } from 'vitest';
import { SERVICE_CATALOG } from '../src/services/catalog.js';
import { validateAppName } from '../src/generator.js';

describe('gas-devkit', () => {
  it('includes all advanced services', () => expect(SERVICE_CATALOG).toHaveLength(21));
  it('validates safe app names', () => {
    expect(validateAppName('my-gas-app')).toBe(true);
    expect(validateAppName('../unsafe')).not.toBe(true);
  });
});
