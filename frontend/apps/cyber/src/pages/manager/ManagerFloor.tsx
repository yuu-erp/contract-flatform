import { FloorView } from '../shared/FloorView'
import { useManagerBranch } from './ManagerLayout'

export function ManagerFloor() {
  return <FloorView branchId={useManagerBranch()} />
}
