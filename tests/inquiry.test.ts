import { describe, expect, it } from 'vitest';

import { FIELD_LIMITS, cleanField, cleanInquiry, validateInquiry } from '@/contact/inquiry';

describe('cleanField', () => {
  it('trims surrounding whitespace', () => {
    expect(cleanField('  hello  ', 50)).toBe('hello');
  });

  it('truncates past the limit', () => {
    expect(cleanField('x'.repeat(200), 10)).toBe('x'.repeat(10));
  });

  it('turns anything that is not a string into an empty string', () => {
    expect(cleanField(undefined, 10)).toBe('');
    expect(cleanField(null, 10)).toBe('');
    expect(cleanField(42, 10)).toBe('');
    expect(cleanField({ toString: () => 'sneaky' }, 10)).toBe('');
  });
});

describe('cleanInquiry', () => {
  it('pulls the four fields out of an untrusted payload', () => {
    expect(
      cleanInquiry({
        name: '  Ada  ',
        email: 'ada@example.com',
        company: 'Analytical Engines',
        message: '  Hello  ',
        website: 'http://spam.example',
        somethingElse: 'ignored',
      }),
    ).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      company: 'Analytical Engines',
      message: 'Hello',
    });
  });

  it('never throws on a hostile payload', () => {
    expect(cleanInquiry({})).toEqual({ name: '', email: '', company: '', message: '' });
    expect(cleanInquiry({ name: [], email: {}, company: 0, message: false })).toEqual({
      name: '',
      email: '',
      company: '',
      message: '',
    });
  });

  it('truncates each field at its own limit', () => {
    const inquiry = cleanInquiry({
      name: 'n'.repeat(500),
      email: 'e'.repeat(500),
      company: 'c'.repeat(500),
      message: 'm'.repeat(9000),
    });

    expect(inquiry.name).toHaveLength(FIELD_LIMITS.name);
    expect(inquiry.email).toHaveLength(FIELD_LIMITS.email);
    expect(inquiry.company).toHaveLength(FIELD_LIMITS.company);
    expect(inquiry.message).toHaveLength(FIELD_LIMITS.message);
  });
});

describe('validateInquiry', () => {
  const valid = { name: 'Ada', email: 'ada@example.com', company: '', message: 'Hello' };

  it('accepts a complete Inquiry, company optional', () => {
    expect(validateInquiry(valid)).toBeNull();
  });

  it('names the missing name', () => {
    expect(validateInquiry({ ...valid, name: '' })).toBe('missing-name');
  });

  it('names the missing message', () => {
    expect(validateInquiry({ ...valid, message: '' })).toBe('missing-message');
  });

  it.each([
    'not-an-email',
    'no@tld',
    '@example.com',
    'spaces in@example.com',
    'trailing@example.c',
    '',
  ])('rejects %j as an email', (email) => {
    expect(validateInquiry({ ...valid, email })).toBe('invalid-email');
  });

  it.each(['ada@example.com', 'a.b+tag@sub.example.co.uk', "o'hara@example.io"])(
    'accepts %j as an email',
    (email) => {
      expect(validateInquiry({ ...valid, email })).toBeNull();
    },
  );

  it('reports the first problem, checking name before email', () => {
    expect(validateInquiry({ name: '', email: 'bad', company: '', message: '' })).toBe('missing-name');
  });
});
