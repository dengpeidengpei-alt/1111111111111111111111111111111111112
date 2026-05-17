"""Import OCR'd text files into knowledge_base.json"""
import json, os, re, time
from pathlib import Path

KB_PATH = "E:/Claude/Claude-Work/knowledge_base.json"
OCR_DIRS = {
    "十万金方": "E:/Claude/ocr_output/十万金方",
}

def load_kb():
    with open(KB_PATH, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_kb(kb):
    kb['last_updated'] = time.strftime("%Y-%m-%d")
    with open(KB_PATH, 'w', encoding='utf-8') as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(kb['knowledge_base'])} entries")

def get_next_id(kb):
    entries = kb['knowledge_base']
    max_num = 0
    for e in entries:
        m = re.search(r'kb-(\d+)', e['id'])
        if m:
            num = int(m.group(1))
            if num > max_num:
                max_num = num
    return max_num + 1

def extract_vol_info(filename):
    """Extract volume number from filename"""
    m = re.search(r'第(\d+)辑', filename)
    if m:
        return int(m.group(1))
    m = re.search(r'第(\d+)集', filename)
    if m:
        return int(m.group(1))
    if '重订' in filename:
        return 0
    return None

def build_entry(repo, filename, filepath, next_id):
    vol = extract_vol_info(filename)
    if vol is not None and vol > 0:
        desc = f"十万金方 第{vol}辑 - 河北省中医中药展览会验方汇集 (OCR提取原文)"
        title = f"十万金方_第{vol}辑"
    elif vol == 0:
        desc = "重订十万金方 - 沈洪瑞主编 (OCR提取原文)"
        title = "重订十万金方"
    else:
        desc = f"十万金方 - {filename} (OCR提取原文)"
        title = filename

    # Count pages roughly (每页约200-400 chars)
    with open(filepath, 'rb') as f:
        raw = f.read()
    text = raw.decode('utf-8', errors='replace')
    char_count = len(text)
    est_pages = max(1, char_count // 300)

    entry = {
        "id": f"kb-{next_id}",
        "repo": repo,
        "stars": None,
        "type": "tcm_prescription_book",
        "description": desc,
        "url": f"Claude-Work/ocr_output/{repo}/{filename}",
        "learned": time.strftime("%Y-%m-%d"),
        "cycle": None,
        "use_case": "prescription_reference",
        "notes": f"OCR提取自扫描PDF，原文未修改。估计{est_pages}页，{char_count}字。权威来源，仅供参考，用药需遵医嘱。"
    }
    return entry

def main():
    kb = load_kb()
    next_id = get_next_id(kb)
    print(f"Next available ID: kb-{next_id}")
    print(f"Current entries: {len(kb['knowledge_base'])}")

    new_entries = []
    for repo, dir_path in OCR_DIRS.items():
        if not os.path.exists(dir_path):
            print(f"Directory not found: {dir_path}")
            continue
        files = sorted([f for f in os.listdir(dir_path) if f.endswith('.txt') and 'test' not in f])
        print(f"\n{repo}: {len(files)} files")
        for filename in files:
            filepath = os.path.join(dir_path, filename)
            entry = build_entry(repo, filename, filepath, next_id)
            new_entries.append(entry)
            print(f"  kb-{next_id}: {filename}")
            next_id += 1

    if new_entries:
        kb['knowledge_base'].extend(new_entries)
        save_kb(kb)
        print(f"\nAdded {len(new_entries)} entries (kb-{new_entries[0]['id']} to kb-{new_entries[-1]['id']})")
    else:
        print("No new entries to add")

if __name__ == '__main__':
    main()
