import { describe, expect, it } from 'vitest'
import { validateCreateAgentForm } from '../src/lib/validate-create-agent'

describe('validateCreateAgentForm', () => {
  it('bắt buộc tên cửa hàng và dịch vụ hợp lệ', () => {
    const errors = validateCreateAgentForm({
      owner: '0x123',
      storeName: '',
      storeAddress: '',
      note: '',
      storePhone: 'abc',
      allowedServices: 4,
    })
    expect(errors.storeName).toBeTruthy()
    expect(errors.storePhone).toBeTruthy()
    expect(errors.allowedServices).toBeTruthy()
  })

  it('chấp nhận hồ sơ tối thiểu hợp lệ', () => {
    const errors = validateCreateAgentForm({
      owner: '0x03EAa08274B9A4155D27652991Fbd9E1cb304027',
      storeName: 'Cyber Quận 1',
      storeAddress: '',
      note: '',
      storePhone: '028 3822 0000',
      allowedServices: 3,
    })
    expect(Object.keys(errors)).toHaveLength(0)
  })
})