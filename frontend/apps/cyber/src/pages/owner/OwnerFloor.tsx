import { useState } from 'react'
import { useOwnerBranches } from '../../data/hooks'
import { BranchPicker } from '../../domain'
import { FloorView } from '../shared/FloorView'

/** Phòng máy của từng chi nhánh (chủ agent xem mọi chi nhánh). */
export function OwnerFloor() {
  const branches = useOwnerBranches()
  const [branchId, setBranchId] = useState(branches[0]!.id)
  return <FloorView branchId={branchId} switcher={<BranchPicker branches={branches} value={branchId} onChange={setBranchId} />} />
}
