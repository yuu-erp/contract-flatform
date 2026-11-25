import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KpiTile } from '../src/components/KpiTile'

describe('KpiTile', () => {
  it('does not show NaN when current and previous are zero', () => {
    render(<KpiTile label="Doanh thu" value={0n} previous={0n} format="vnd" />)
    expect(screen.queryByText(/NaN/i)).toBeNull()
    expect(screen.getByText('0 ₫')).toBeTruthy()
  })

  it('shows absolute delta when previous is negative', () => {
    render(<KpiTile label="Doanh thu" value={50_000n} previous={-10_000n} format="vnd" />)
    expect(screen.getByText(/60\.000 ₫ so kỳ trước/)).toBeTruthy()
    expect(screen.queryByText(/NaN/i)).toBeNull()
  })
})