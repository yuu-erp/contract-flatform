#!/usr/bin/env bash
# Kiểm luật kiến trúc (docs/02-kien-truc.md mục 4, ADR 0029, 0034):
#   L1  phụ thuộc chỉ đi xuống: modules → shared → tenant → kernel; module không import nhau
#   L2  kernel/, tenant/, shared/, libraries/ không biết tên module
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0

# L1 — check <thư mục nguồn> <regex đường dẫn import bị cấm> <lý do>
check() {
  [[ -d "$1" ]] || return 0
  local hits
  hits=$(grep -rnE "^\s*import\s[^;]*[\"'][^\"']*($2)[^\"']*[\"']" "$1" --include='*.sol' || true)
  if [[ -n "$hits" ]]; then echo "LỖI L1 $3:"; echo "$hits"; fail=1; fi
}
check src/libraries   'kernel/|tenant/|shared/|modules/|migration/|interfaces/' "libraries/ chỉ chứa logic thuần, không import gì trong src/"
check src/interfaces  'kernel/|tenant/|shared/|modules/|migration/'             "interfaces/ không import contract cụ thể"
check src/kernel      'tenant/|shared/|modules/|migration/'                     "kernel (T0) chỉ phụ thuộc kernel"
check src/tenant      'shared/|modules/|migration/'                             "tenant (T1) không phụ thuộc tầng trên"
check src/shared      'modules/|migration/'                                     "shared (T2) không phụ thuộc module"
check src/modules     'migration/'                                             "module không phụ thuộc migration"
if [[ -d src/modules ]]; then
  for m in src/modules/*/; do
    name=$(basename "$m")
    for other in src/modules/*/; do
      o=$(basename "$other"); [[ "$o" == "$name" ]] && continue
      hits=$(grep -rnE "^\s*import\s[^;]*[\"'][^\"']*modules/$o/[^\"']*[\"']" "$m" --include='*.sol' || true)
      if [[ -n "$hits" ]]; then echo "LỖI L1 module $name import module $o:"; echo "$hits"; fail=1; fi
    done
  done
fi

# L2 — tên module dưới T3. Ngoại lệ tạm thời là nợ kiến trúc có hạn (docs/02 mục 10), xoá khi xử lý xong.
L2_PATTERN='\b(SERVICE_(NET|IQR|LOYALTY)|ServiceMask\.(NET|IQR|LOYALTY)|uint16 internal constant (NET|IQR|LOYALTY)\b)'
L2_ALLOW=(
  "src/libraries/ServiceMask.sol"          # N1 — thay bằng Registry (Baseline tuần 3)
  "src/tenant/branch/BranchRegistry.sol"   # N1
  "src/shared/payment/SalesSettings.sol"   # N1
  "src/libraries/LedgerMetrics.sol"        # N2 — slot bộ đếm theo moduleId
)
l2_hits=$(grep -rnE "$L2_PATTERN" src/kernel src/tenant src/shared src/libraries --include='*.sol' || true)
if [[ -n "$l2_hits" ]]; then
  while IFS= read -r line; do
    file=${line%%:*}
    allowed=0
    for a in "${L2_ALLOW[@]}"; do [[ "$file" == "$a" ]] && allowed=1; done
    if [[ $allowed -eq 0 ]]; then echo "LỖI L2 nền tảng biết tên module: $line"; fail=1; fi
  done <<< "$l2_hits"
  n=$(printf '%s\n' "$l2_hits" | wc -l | tr -d ' ')
  echo "cảnh báo L2: $n chỗ nền tảng còn biết tên module, đang được miễn tạm (nợ N1, N2 — docs/02 mục 10)"
fi

[[ $fail -eq 0 ]] && echo "phụ thuộc: ok"
exit $fail
