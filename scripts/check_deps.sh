#!/usr/bin/env bash
# Kiểm hướng phụ thuộc giữa core/ và modules/ (bảng ở docs/06-cau-truc-thu-muc.md mục 4).
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0
# check <thư mục nguồn> <regex đường dẫn import bị cấm> <lý do>
check() {
  [[ -d "$1" ]] || return 0
  local hits
  hits=$(grep -rnE "^\s*import\s[^;]*[\"'][^\"']*($2)[^\"']*[\"']" "$1" --include='*.sol' || true)
  if [[ -n "$hits" ]]; then echo "LỖI $3:"; echo "$hits"; fail=1; fi
}
check src/libraries        'core/|modules/|interfaces/'       "libraries/ chỉ chứa logic thuần, không import gì trong src/"
check src/interfaces       'core/|modules/'                   "interfaces/ không import core/ hay modules/"
check src/core             'modules/'                         "core/ không phụ thuộc modules/"
check src/modules/net      'modules/(iqr|loyalty)/'           "NET không import IQR/Loyalty (dùng interfaces/ILoyaltyHook)"
check src/modules/iqr      'modules/(net|loyalty)/'           "IQR không import NET/Loyalty (dùng interfaces/ILoyaltyHook)"
check src/modules/loyalty  'modules/(net|iqr)/'               "Loyalty không import NET/IQR"
[[ $fail -eq 0 ]] && echo "phụ thuộc: ok"
exit $fail
