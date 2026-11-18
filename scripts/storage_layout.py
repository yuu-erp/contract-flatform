#!/usr/bin/env python3
"""Kiểm storage layout chỉ nối thêm (append-only) cho contract upgradeable.

Hai loại mục trong storage-layouts/contracts.txt (mỗi dòng một mục, '#' là chú thích):
  impl  <path:Contract>   contract UUPS: phải KHÔNG có biến state thường (dùng ERC-7201)
  harness <path:Contract> harness trong test/layout/: layout struct namespaced, so với snapshot

Lệnh:
  scripts/storage_layout.py snapshot   ghi snapshot mới cho mọi harness (chỉ khi thêm struct mới
                                       hoặc sau khi review chấp nhận thay đổi)
  scripts/storage_layout.py check      so hiện tại với snapshot; lỗi nếu xoá/đổi chỗ/đổi kiểu
"""
import json
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LAYOUT_DIR = ROOT / "storage-layouts"
LIST_FILE = LAYOUT_DIR / "contracts.txt"


def entries():
    for raw in LIST_FILE.read_text().splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        kind, target = line.split()
        if kind not in ("impl", "harness"):
            sys.exit(f"contracts.txt: loại '{kind}' không hợp lệ")
        yield kind, target


def inspect(target):
    out = subprocess.run(
        ["forge", "inspect", target.split(":")[-1], "storageLayout", "--json"],
        cwd=ROOT, check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(out)


def flatten(layout):
    """Trải phẳng layout thành danh sách (đường dẫn, slot tuyệt đối, offset, kiểu) theo thứ tự khai báo."""
    types = layout.get("types") or {}
    rows = []

    def walk(members, prefix, base_slot):
        for m in members:
            path = prefix + m["label"]
            slot = base_slot + int(m["slot"])
            t = types[m["type"]]
            rows.append((path, slot, m["offset"], t["label"]))
            if t.get("encoding") == "inplace" and t.get("members"):
                walk(t["members"], path + ".", slot)

    walk(layout.get("storage") or [], "", 0)
    return rows


def snapshot_path(target):
    name = target.split(":")[-1]
    return LAYOUT_DIR / f"{name}.json"


def cmd_snapshot():
    for kind, target in entries():
        if kind != "harness":
            continue
        rows = flatten(inspect(target))
        snapshot_path(target).write_text(json.dumps(rows, indent=1, ensure_ascii=False) + "\n")
        print(f"đã ghi {snapshot_path(target).relative_to(ROOT)} ({len(rows)} trường)")


def cmd_check():
    errors = []
    for kind, target in entries():
        layout = inspect(target)
        if kind == "impl":
            if layout.get("storage"):
                labels = ", ".join(m["label"] for m in layout["storage"])
                errors.append(f"{target}: có biến state thường ({labels}); dùng storage ERC-7201")
            continue
        snap = snapshot_path(target)
        if not snap.exists():
            errors.append(f"{target}: chưa có snapshot, chạy 'snapshot' rồi review")
            continue
        old = [tuple(r) for r in json.loads(snap.read_text())]
        new = flatten(layout)
        new_by_path = {r[0]: r for r in new}
        for r in old:
            cur = new_by_path.get(r[0])
            if cur is None:
                errors.append(f"{target}: trường '{r[0]}' bị xoá hoặc đổi tên")
            elif cur != r:
                errors.append(f"{target}: trường '{r[0]}' đổi vị trí/kiểu {r[1:]} → {cur[1:]}")
        if not errors and len(new) > len(old):
            print(f"{target}: thêm {len(new) - len(old)} trường mới; chạy 'snapshot' sau review")
    if errors:
        print("\n".join("LỖI " + e for e in errors))
        sys.exit(1)
    print("storage layout: ok")


if __name__ == "__main__":
    {"snapshot": cmd_snapshot, "check": cmd_check}.get(
        sys.argv[1] if len(sys.argv) > 1 else "", lambda: sys.exit(__doc__)
    )()
