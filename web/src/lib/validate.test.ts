import { describe, expect, it } from 'vitest'
import { validateBranchForm, type BranchFormValues } from './validate'

const VALID: BranchFormValues = {
  domain: 'cafe-q1',
  name: 'Chi nhánh 1',
  location: 'Q1',
  phone: '+84 28 1234 5678',
  longlat: '10.77,106.70',
  note: '',
  net: true,
  iqr: false,
  loyalty: true,
  tzOffsetMinutes: '420',
}

describe('validateBranchForm', () => {
  it('nhận BranchInit hợp lệ', () => {
    expect(validateBranchForm(VALID)).toEqual({})
  })

  it('từ chối domain hoa, loyalty một mình, múi giờ và toạ độ sai', () => {
    const errors = validateBranchForm({
      ...VALID,
      domain: 'Cafe',
      net: false,
      iqr: false,
      loyalty: true,
      tzOffsetMinutes: '900',
      longlat: 'abc',
      name: '',
    })
    expect(errors.domain).toBeTruthy()
    expect(errors.services).toBeTruthy()
    expect(errors.tzOffsetMinutes).toBeTruthy()
    expect(errors.longlat).toBeTruthy()
    expect(errors.name).toBeTruthy()
  })

  it('cho phép toạ độ rỗng và SĐT rỗng', () => {
    expect(validateBranchForm({ ...VALID, longlat: '', phone: '' })).toEqual({})
  })
})
