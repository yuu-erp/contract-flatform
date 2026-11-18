#!/usr/bin/env python3
"""Sinh dữ liệu thô kiểm kê hệ cũ meta-iqr cho GĐ0 (tasks/00-kiem-ke-he-cu.md).

CHỈ ĐỌC meta-iqr / FE / qt-core / qt-widget. Không đọc .env, không gọi chain,
không chép địa chỉ từ deployments/*.json (chỉ lấy tên contract từ script deploy).

Build meta-iqr vào cache/legacy-iqr/ của repo này (không ghi vào checkout meta-iqr).

Kết quả (ghi đè mỗi lần chạy, không sửa tay):
  docs/legacy/generated/contracts.md        mọi file .sol + trạng thái gợi ý + bytecode + số dòng
  docs/legacy/generated/state/<C>.md        mọi biến storage của contract đang deploy (từ storageLayout)
  docs/legacy/generated/abi/<C>.md          hàm/event của contract đang deploy
  docs/legacy/generated/client-hits.md      nơi client nhắc tên hàm/event (gợi ý cho 01-abi-client.md)
  docs/legacy/layout/<C>.json               storageLayout đầy đủ (cho extractor đọc biến internal)

Dùng:
  python3 scripts/legacy/inventory.py            # build nếu chưa có, rồi sinh
  python3 scripts/legacy/inventory.py --rebuild  # build lại meta-iqr
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys
from collections import defaultdict

ROOT = pathlib.Path(__file__).resolve().parents[2]
REPOS = ROOT.parent.parent  # gitm/repos
IQR = REPOS / "contract" / "meta-iqr"
CLIENTS = {
    "FE": REPOS / "fe" / "metanode-cyber-game",
    "qt-core": REPOS / "cpp-qt" / "qt-core" / "src" / "sidebar-cyber",
    "qt-widget": REPOS / "cpp-qt" / "qt-widget",
}
BUILD = ROOT / "cache" / "legacy-iqr"
OUT_DOCS = ROOT / "docs" / "legacy"
GEN = OUT_DOCS / "generated"

SKIP_DIRS = {".deps", "artifacts", ".states", "node_modules"}
SKIP_PREFIXES = ("contracts/net_repo/lib/",)  # bản sao OZ
DEPLOY_SCRIPTS = ["scripts/create_system.js", "script/DeployNetCafeV3.s.sol"]
MODULES = [  # (tiền tố đường dẫn, module)
    ("contracts/shared/", "shared"),
    ("contracts/system/", "system"),
    ("contracts/branch/", "system"),
    ("contracts/net_repo/", "net"),
    ("contracts/iqr/", "iqr"),
    ("contracts/loyalty/", "loyalty"),
    ("contracts/robot/", "robot"),
    ("contracts/sc-robotcontroller/", "robot"),
    ("contracts/interfaces/", "interfaces"),
    ("contracts/lib/", "lib"),
    ("contracts/test/", "test"),
    ("contracts/", "root"),
]
DECL_RE = re.compile(r"^\s*(abstract\s+contract|contract|interface|library)\s+([A-Za-z_]\w*)\s*(?:is\s+([^{]+))?\{",
                     re.M)


def git_head(path):
    try:
        return subprocess.run(["git", "-C", str(path), "rev-parse", "--short", "HEAD"], capture_output=True,
                              text=True, check=True).stdout.strip()
    except subprocess.CalledProcessError:
        return "?"


def sol_files():
    files = []
    for p in sorted((IQR / "contracts").rglob("*.sol")):
        rel = p.relative_to(IQR)
        if any(part in SKIP_DIRS for part in rel.parts) or str(rel).startswith(SKIP_PREFIXES):
            continue
        files.append(rel)
    return files


def module_of(rel):
    s = str(rel)
    for prefix, mod in MODULES:
        if s.startswith(prefix):
            return mod
    return "?"


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)


def deployed_names():
    """Tên contract được script deploy tạo ra (chỉ tên, không địa chỉ)."""
    found = defaultdict(set)
    for rel in DEPLOY_SCRIPTS:
        p = IQR / rel
        if not p.exists():
            continue
        text = p.read_text(errors="replace")
        for m in re.finditer(r"deploy(?:Impl|Proxy)\(\s*wallet\s*,\s*['\"]([A-Za-z_]\w*)['\"]", text):
            found[m.group(1)].add(rel)
        for m in re.finditer(r"getContractFactory\(\s*['\"]([A-Za-z_]\w*)['\"]", text):
            if m.group(1) != "ERC1967Proxy":
                found[m.group(1)].add(rel)
        for m in re.finditer(r"\bnew\s+([A-Z]\w*)\s*\(", text):
            found[m.group(1)].add(rel)
    return found


def build(rebuild):
    out = BUILD / "out"
    if out.exists() and not rebuild:
        return out
    BUILD.mkdir(parents=True, exist_ok=True)
    print("build meta-iqr (via_ir, có thể mất vài phút)…", file=sys.stderr)
    r = subprocess.run(
        ["forge", "build", "--skip", "test/**", "--skip", "script/**", "--out", str(out), "--cache-path",
         str(BUILD / "cache"), "--extra-output", "storageLayout", "--sizes"],
        cwd=IQR, capture_output=True, text=True)
    (BUILD / "build.log").write_text(r.stdout + r.stderr)
    if not out.exists():
        sys.exit(f"build lỗi, xem {BUILD / 'build.log'}")
    return out


def load_artifacts(out):
    arts = {}
    for p in out.rglob("*.json"):
        try:
            d = json.loads(p.read_text())
        except (json.JSONDecodeError, UnicodeDecodeError):
            continue
        target = (d.get("metadata") or {}).get("settings", {}).get("compilationTarget") or {}
        for path, name in target.items():
            arts[(path, name)] = d
    return arts


def size_of(art):
    obj = ((art or {}).get("deployedBytecode") or {}).get("object", "")
    obj = obj[2:] if obj.startswith("0x") else obj
    return len(obj) // 2


def kind_of_type(label):
    if label.startswith("mapping("):
        return "mapping"
    if label.endswith("]"):
        return "mảng"
    if label.startswith("struct "):
        return "struct"
    return "scalar"


def guess_status(rel, decls, deployed, bases_of_deployed):
    s = str(rel).lower()
    names = [n for _, n in decls]
    kinds = {k for k, _ in decls}
    if "robot" in s:
        return "bỏ (Robot)"
    if " copy" in s or "/temp" in s:
        return "bản sao"
    if any(x in s for x in ("/legacy/", "contract_old", "/v2/", "order_new")):
        return "legacy"
    if "mock" in s or s.startswith("contracts/test/"):
        return "mock"
    if any(n in deployed for n in names):
        return "đang deploy"
    if any(n in bases_of_deployed for n in names):
        return "base của contract đang deploy"
    if kinds and kinds <= {"interface"}:
        return "interface"
    if kinds and kinds <= {"library"}:
        return "library"
    return "chưa rõ"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rebuild", action="store_true")
    args = ap.parse_args()

    out = build(args.rebuild)
    arts = load_artifacts(out)
    deployed = deployed_names()
    files = sol_files()

    # khai báo + quan hệ kế thừa (regex trên nguồn đã bỏ chú thích)
    decls_by_file, bases = {}, {}
    for rel in files:
        src = strip_comments((IQR / rel).read_text(errors="replace"))
        decls = []
        for m in DECL_RE.finditer(src):
            kind = "abstract" if m.group(1).startswith("abstract") else m.group(1)
            decls.append((kind, m.group(2)))
            if m.group(3):
                bases[(str(rel), m.group(2))] = [b.strip().split("(")[0].strip() for b in m.group(3).split(",")]
        decls_by_file[rel] = decls

    # contract đang deploy: lấy bản không nằm trong legacy/copy/robot
    live = {}
    for rel in files:
        st = guess_status(rel, decls_by_file[rel], set(), set())
        if st in ("bỏ (Robot)", "bản sao", "legacy", "mock"):
            continue
        for kind, name in decls_by_file[rel]:
            if name in deployed and kind == "contract":
                live[name] = str(rel)

    by_name = defaultdict(list)
    for (path, name), b in bases.items():
        by_name[name].append(b)
    closure = set()
    stack = list(live)
    while stack:
        n = stack.pop()
        for bl in by_name.get(n, []):
            for b in bl:
                if b not in closure:
                    closure.add(b)
                    stack.append(b)

    GEN.mkdir(parents=True, exist_ok=True)
    (GEN / "state").mkdir(exist_ok=True)
    (GEN / "abi").mkdir(exist_ok=True)
    (OUT_DOCS / "layout").mkdir(exist_ok=True)
    head = (f"> Sinh bởi `scripts/legacy/inventory.py` từ meta-iqr `{git_head(IQR)}`. "
            "Không sửa tay; chạy lại script. Trạng thái là **gợi ý**, bảng chính thức ở `../00-danh-muc-contract.md`.\n\n")

    # 1. danh mục
    rows = []
    for rel in files:
        decls = decls_by_file[rel]
        st = guess_status(rel, decls, set(live), closure)
        sizes = []
        for kind, name in decls:
            a = arts.get((str(rel), name))
            if a and kind in ("contract",) and size_of(a):
                sizes.append(f"{name} {size_of(a) / 1024:.1f}")
        src_scripts = sorted({s for _, n in decls for s in deployed.get(n, ())})
        lines = sum(1 for _ in (IQR / rel).open(errors="replace"))
        decl_txt = ", ".join(f"{n} ({k})" if k != "contract" else n for k, n in decls) or "—"
        rows.append(f"| `{rel}` | {decl_txt} | {module_of(rel)} | {st} | "
                    f"{', '.join('`' + s + '`' for s in src_scripts) or '—'} | {'; '.join(sizes) or '—'} | {lines} |")
    over = [r for r in rows if any(float(x.split()[-1]) > 24.0 for x in r.split(" | ")[5].split("; ") if x != "—")]
    (GEN / "contracts.md").write_text(
        "# Danh mục file .sol (thô)\n\n" + head +
        f"Tổng: **{len(files)}** file (bỏ `.deps/`, `artifacts/`, `.states/`, `net_repo/lib/` sao chép OZ). "
        f"Contract deploy theo script: {len(live)}. File có contract > 24 KB: {len(over)}.\n\n"
        "| File | Khai báo | Module | Trạng thái gợi ý | Script deploy | Bytecode KB | Dòng |\n"
        "|---|---|---|---|---|---|---|\n" + "\n".join(rows) + "\n")

    # 2. state + layout + abi cho contract đang deploy
    summary = []
    for name, path in sorted(live.items()):
        a = arts.get((path, name))
        if not a:
            summary.append(f"| {name} | `{path}` | không có artifact | | | |")
            continue
        layout = a.get("storageLayout") or {"storage": [], "types": {}}
        (OUT_DOCS / "layout" / f"{name}.json").write_text(json.dumps(layout, indent=1) + "\n")
        types = layout.get("types") or {}
        st_rows, counts = [], defaultdict(int)
        for v in layout.get("storage", []):
            tl = types.get(v["type"], {}).get("label", v["type"])
            k = "gap" if v["label"].startswith("__gap") else kind_of_type(tl)
            counts[k] += 1
            origin = v.get("contract", "").split(":")[-1]
            st_rows.append(f"| {v['slot']} | {v['offset']} | `{v['label']}` | `{tl}` | {k} | {origin} |")
        (GEN / "state" / f"{name}.md").write_text(
            f"# {name} — storage\n\n" + head + f"Nguồn: `{path}`. Layout đầy đủ: `../../layout/{name}.json`.\n\n"
            "| Slot | Offset | Biến | Kiểu | Loại | Khai báo ở |\n|---|---|---|---|---|---|\n" + "\n".join(st_rows) + "\n")
        fns, evs = [], []
        sel = a.get("methodIdentifiers") or {}
        sig_by_sel = {v: k for k, v in sel.items()}
        for item in a.get("abi", []):
            if item["type"] == "function":
                sig = f"{item['name']}({','.join(i['type'] for i in item['inputs'])})"
                selector = sel.get(sig, "")
                mut = item.get("stateMutability", "")
                rw = "đọc" if mut in ("view", "pure") else "ghi"
                outs = ",".join(o["type"] for o in item.get("outputs", []))
                fns.append(f"| `{sig}` | `{selector}` | {rw} ({mut}) | `{outs}` |")
            elif item["type"] == "event":
                evs.append(f"| `{item['name']}({','.join(i['type'] for i in item['inputs'])})` |")
        (GEN / "abi" / f"{name}.md").write_text(
            f"# {name} — ABI\n\n" + head + f"## Hàm ({len(fns)})\n\n| Chữ ký | Selector | Đọc/ghi | Trả về |\n"
            "|---|---|---|---|\n" + "\n".join(sorted(fns)) + f"\n\n## Event ({len(evs)})\n\n| Event |\n|---|\n" +
            "\n".join(sorted(evs)) + "\n")
        summary.append(f"| {name} | `{path}` | {size_of(a) / 1024:.1f} | {sum(counts.values()) - counts['gap']} | "
                       f"{counts['mapping']} / {counts['mảng']} / {counts['struct']} / {counts['scalar']} | "
                       f"{len(fns)} / {len(evs)} |")
    (GEN / "deployed.md").write_text(
        "# Contract đang deploy (theo script)\n\n" + head +
        f"Suy từ {', '.join('`' + s + '`' for s in DEPLOY_SCRIPTS)} (tên contract trong `deployImpl`/`deployProxy`/"
        "`getContractFactory`/`new`). Đối chiếu với danh sách agent/chi nhánh thật khi người dùng gửi.\n\n"
        "| Contract | File | KB | Biến storage (trừ gap) | mapping / mảng / struct / scalar | Hàm / event |\n"
        "|---|---|---|---|---|---|\n" + "\n".join(summary) + "\n")

    # 3. client hits
    names = defaultdict(set)  # tên hàm/event -> contract
    for name, path in live.items():
        for item in (arts.get((path, name)) or {}).get("abi", []):
            if item["type"] in ("function", "event"):
                names[item["name"]].add(name)
    pat = re.compile(r"""(?:['"`]([A-Za-z_]\w*)['"`])|(?:\.([A-Za-z_]\w*)\s*\()""")
    exts = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".qml", ".cpp", ".hpp", ".h", ".cc"}
    skip = {"node_modules", "dist", "build", ".turbo", ".next", "coverage", ".git", "out"}
    hits = defaultdict(lambda: defaultdict(list))
    for client, base in CLIENTS.items():
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.suffix not in exts or any(part in skip for part in p.parts) or not p.is_file():
                continue
            if "abi" in p.name.lower() and client == "FE":
                continue  # file định nghĩa ABI chứa mọi tên; nơi gọi mới có ích
            try:
                text = p.read_text(errors="replace")
            except OSError:
                continue
            for i, line in enumerate(text.splitlines(), 1):
                for m in pat.finditer(line):
                    n = m.group(1) or m.group(2)
                    if n in names and len(n) > 3:
                        hits[n][client].append(f"{p.relative_to(base)}:{i}")
    hrows = []
    for n in sorted(names):
        cells = []
        for c in CLIENTS:
            lst = hits[n][c]
            cells.append(f"{len(lst)}: " + ", ".join(f"`{x}`" for x in lst[:4]) + (" …" if len(lst) > 4 else "")
                         if lst else "—")
        hrows.append(f"| `{n}` | {', '.join(sorted(names[n]))} | " + " | ".join(cells) + " |")
    heads = " — ".join(f"{c} `{git_head(b)}`" for c, b in CLIENTS.items())
    (GEN / "client-hits.md").write_text(
        "# Tên hàm/event được client nhắc tới (thô)\n\n" + head +
        f"Client: {heads}. Khớp chuỗi `'tên'` hoặc `.tên(`; có thể trùng tên giữa contract, phải xác minh tay. "
        "Bỏ file ABI của FE (tên chứa `abi`). Tên ≤ 3 ký tự bị bỏ.\n\n"
        "| Tên | Contract có tên này | " + " | ".join(CLIENTS) + " |\n|---|---|" + "---|" * len(CLIENTS) + "\n" +
        "\n".join(hrows) + "\n")

    print(f"{len(files)} file .sol, {len(live)} contract đang deploy, "
          f"{sum(1 for n in names if any(hits[n].values()))}/{len(names)} tên có client nhắc → {GEN.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
