#!/usr/bin/env python3
"""Luật L5 (docs/02-kien-truc.md): runtime > 20 KB là cảnh báo, phải có kế hoạch tách ghi ở docs/02 mục 10.
Đọc JSON từ `forge build --sizes --json` qua stdin. Trần cứng 24 KB do chính `forge build --sizes` chặn."""
import json, sys

WARN = 20 * 1024
# Contract đã vượt ngưỡng cảnh báo và đã có kế hoạch tách (mã nợ ở docs/02 mục 10).
PLANNED = {"Ledger": "N3", "AgentUserRegistry": "N4"}

data = json.load(sys.stdin)
fail = False
for name, s in sorted(data.items(), key=lambda kv: -kv[1]["runtime_size"]):
    size = s["runtime_size"]
    if size <= WARN:
        continue
    debt = PLANNED.get(name)
    if debt:
        print(f"cảnh báo L5: {name} {size} B > 20 KB, còn {s['runtime_margin']} B — đã có kế hoạch ({debt})")
    else:
        print(f"LỖI L5: {name} {size} B > 20 KB mà chưa có kế hoạch tách (thêm vào docs/02 mục 10 và PLANNED)")
        fail = True
print("kích thước: ok" if not fail else "kích thước: lỗi")
sys.exit(1 if fail else 0)
