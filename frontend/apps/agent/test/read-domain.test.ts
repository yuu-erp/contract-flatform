import { describe, expect, it } from 'vitest'
import { readDomainParam, withDomain } from '../src/lib/read-domain'

describe('readDomainParam', () => {
  it('chuẩn hoá trim và chữ thường', () => {
    expect(readDomainParam('?domain=%20Q1.VN%20')).toBe('q1.vn')
  })
})

describe('withDomain', () => {
  it('giữ domain trên link hash', () => {
    expect(withDomain('/staff', 'q1.vn')).toBe('?domain=q1.vn#/staff')
  })
})