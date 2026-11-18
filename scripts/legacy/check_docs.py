#!/usr/bin/env python3
"""Kiểm tiêu chí nghiệm thu đo được của GĐ0 trên docs/legacy/.

  python3 scripts/legacy/check_docs.py catalog          00-danh-muc-contract.md đủ mọi file .sol, trạng thái hợp lệ
  python3 scripts/legacy/check_docs.py dict <file.md>   từ điển dữ liệu: mỗi contract đủ biến storage, đủ cột
  python3 scripts/legacy/check_docs.py all              chạy tất cả (catalog + 5 file từ điển)

Nguồn đối chiếu là docs/legacy/generated/ (chạy `make legacy-inventory` trước).
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
LEG = ROOT / "docs" / "legacy"
GEN = LEG / "generated"
STATUSES = {"đang deploy", "base", "legacy", "bản sao", "mock", "interface", "library", "bỏ (Robot)", "không dùng"}
CLASSES = {"A", "B", "C", "D"}
DICTS = ["10-du-lieu-shared.md", "11-du-lieu-system.md", "12-du-lieu-net.md", "13-du-lieu-iqr.md",
         "14-du-lieu-loyalty.md"]


def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def check_catalog():
    errs = []
    gen_files = re.findall(r"^\| `(contracts/[^`]+)`", (GEN / "contracts.md").read_text(), re.M)
    text = (LEG / "00-danh-muc-contract.md").read_text()
    sec = text.split("## Toàn bộ file", 1)[-1]
    rows = [cells(l) for l in sec.splitlines() if l.startswith("| `contracts/")]
    got = {r[0].strip("`") for r in rows}
    for f in sorted(set(gen_files) - got):
        errs.append(f"thiếu file {f}")
    for f in sorted(got - set(gen_files)):
        errs.append(f"file không có trong meta-iqr: {f}")
    for r in rows:
        if len(r) < 4 or r[3] not in STATUSES:
            errs.append(f"{r[0]}: trạng thái '{r[3] if len(r) > 3 else ''}' không thuộc {sorted(STATUSES)}")
    print(f"catalog: {len(rows)}/{len(gen_files)} file")
    return errs


def state_vars(contract):
    p = GEN / "state" / f"{contract}.md"
    if not p.exists():
        return None
    out = []
    for l in p.read_text().splitlines():
        if l.startswith("| ") and not l.startswith("| Slot") and "`" in l:
            c = cells(l)
            if not c[2].strip("`").startswith("__gap"):
                out.append(c[2].strip("`"))
    return out


def check_dict(name):
    errs = []
    text = (LEG / name).read_text()
    sections = re.split(r"^## ", text, flags=re.M)[1:]
    if not sections or all(s.startswith("<Contract>") for s in sections):
        return [f"{name}: chưa có mục contract nào"]
    for sec in sections:
        contract = sec.split("\n", 1)[0].strip().split()[0]
        if contract.startswith("<"):
            errs.append(f"{name}: còn mục mẫu '## {contract}'")
            continue
        expected = state_vars(contract)
        if expected is None:
            continue  # mục không phải contract đang deploy (vd. ghi chú chung)
        rows = []
        for l in sec.splitlines():
            if l.startswith("| ") and not l.startswith("| Slot") and not l.startswith("|---"):
                c = cells(l)
                if len(c) >= 9 and c[0].isdigit():
                    rows.append(c)
        got = [r[1].strip("`") for r in rows]
        miss = [v for v in expected if v not in got]
        extra = [v for v in got if v not in expected]
        if miss:
            errs.append(f"{name} {contract}: thiếu {len(miss)} biến: {', '.join(miss[:8])}{' …' if len(miss) > 8 else ''}")
        if extra:
            errs.append(f"{name} {contract}: biến không có trong layout: {', '.join(extra[:8])}")
        for r in rows:
            if r[6] not in CLASSES:
                errs.append(f"{name} {contract}.{r[1]}: lớp '{r[6]}' không thuộc A/B/C/D")
            if not r[4] or not r[7]:
                errs.append(f"{name} {contract}.{r[1]}: thiếu cột Cách đọc hoặc Vòng lặp")
        print(f"{name} {contract}: {len(rows)}/{len(expected)} biến")
    return errs


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "catalog":
        errs = check_catalog()
    elif cmd == "dict" and len(sys.argv) > 2:
        errs = check_dict(pathlib.Path(sys.argv[2]).name)
    elif cmd == "all":
        errs = check_catalog()
        for d in DICTS:
            errs += check_dict(d)
    else:
        sys.exit(__doc__)
    if errs:
        print("\n".join("LỖI " + e for e in errs))
        sys.exit(1)
    print("ok")


if __name__ == "__main__":
    main()
