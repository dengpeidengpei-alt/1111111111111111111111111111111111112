"""
后期流程：OCR产出 → 索引 → 反思 → 入库
Usage: python postprocess_ocr.py [repo_name]
  repo_name: 十万金方 (default) | 全民献方
"""
import json, re, os, sys, time
from pathlib import Path

KB_PATH = "E:/Claude/Claude-Work/knowledge_base.json"
OCR_BASE = "E:/Claude/ocr_output"
REPO = sys.argv[1] if len(sys.argv) > 1 else "十万金方"

def load_kb():
    with open(KB_PATH, encoding='utf-8') as f:
        return json.load(f)

def save_kb(kb):
    kb['last_updated'] = time.strftime("%Y-%m-%d")
    with open(KB_PATH, 'w', encoding='utf-8') as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)

def get_ocr_files(repo):
    dir_path = os.path.join(OCR_BASE, repo)
    if not os.path.isdir(dir_path):
        print(f"Directory not found: {dir_path}")
        return []
    files = sorted([f for f in os.listdir(dir_path)
                    if f.endswith('.txt') and 'test' not in f
                    and 'batch_log' not in f
                    and not f.startswith('第') and '_索引' not in f
                    and '反思' not in f and '总索引' not in f
                    and f != os.path.basename(__file__)])
    return files, dir_path

def extract_vol_info(filename):
    m = re.search(r'第(\d+)辑', filename)
    if m: return int(m.group(1))
    m = re.search(r'第(\d+)集', filename)
    if m: return int(m.group(1))
    return None

def count_formulas(text):
    return len(re.findall(r'第[一二三四五六七八九十百零\d]+方', text))

def extract_categories(text):
    # Try standard pattern first (works on clean text)
    cats = re.findall(r'([一-鿿]{2,6})类[（(](\d+)方[）)]', text)
    seen = []
    for name, count in cats:
        clean = re.sub(r'[\s]', '', name)
        if clean and clean not in [s[0] for s in seen]:
            seen.append((clean, int(count)))
    # If few matches, try broader: any N个字 followed by 类（N方）
    if len(seen) < 5:
        cats2 = re.findall(r'([一-鿿]{2,8})类[（(](\d+)方[）)]', text)
        seen2 = []
        for name, count in cats2:
            clean = re.sub(r'[\s]', '', name)
            if clean and clean not in [s[0] for s in seen2]:
                seen2.append((clean, int(count)))
        return seen2
    return seen

def extract_donors(text):
    d = re.findall(r'([一-鿿]{2,8})同志献方', text)
    return sorted(set(x.strip() for x in d if x.strip()))

def build_index(repo, filepath, vol_num):
    with open(filepath, encoding='utf-8') as f:
        text = f.read()
    total = count_formulas(text)
    chars = len(text)
    cats = extract_categories(text)
    donors = extract_donors(text)

    out_dir = os.path.dirname(filepath)
    out_path = os.path.join(out_dir, f'第{vol_num}辑_索引.txt') if vol_num else \
               os.path.join(out_dir, f'{os.path.basename(filepath).replace(".txt","")}_索引.txt')

    lines = []
    lines.append('=' * 60)
    lines.append(f'{repo} 第{vol_num}辑 - 索引目录' if vol_num else f'{repo} - 索引目录')
    lines.append('OCR提取自扫描PDF，原文未修改')
    lines.append('=' * 60)
    lines.append(f'总计: {total} 首方剂, {chars} 字')
    lines.append(f'献方人: {len(donors)} 位')
    lines.append('')
    lines.append('--- 病证分类 ---')
    for name, count in cats:
        lines.append(f'  {name}类: {count}方')
    lines.append('')
    lines.append('--- 献方人（前50） ---')
    for d in donors[:50]:
        lines.append(f'  {d}')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    return out_path, total, chars, len(cats), len(donors)

def build_reflection(repo, filepath, vol_num, total, chars, cats_count, donors_count):
    out_dir = os.path.dirname(filepath)
    out_path = os.path.join(out_dir, f'第{vol_num}辑_反思报告.txt') if vol_num else \
               os.path.join(out_dir, f'{os.path.basename(filepath).replace(".txt","")}_反思报告.txt')

    text = []
    text.append('=' * 60)
    text.append(f'{repo} 第{vol_num}辑 - 学习反思报告' if vol_num else f'{repo} - 学习反思报告')
    text.append('OCR提取自扫描PDF，原文未修改')
    text.append('=' * 60)
    text.append('')
    text.append(f'统计: {total} 方, {chars} 字, {cats_count} 类病证, {donors_count} 献方人')
    text.append('')
    text.append('质量评估:')
    text.append('  需人工复核OCR准确率，注意繁体→简体转换误差')
    text.append('')
    text.append('待办:')
    text.append('  1. 人工抽检10%条目验证OCR质量')
    text.append('  2. 与其他辑次交叉索引')
    text.append('  3. 按药物/病证建立关联图谱')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(text))
    return out_path

def build_master_index(repo, files_info):
    out_path = os.path.join(OCR_BASE, repo, '总索引.md')
    lines = []
    lines.append(f'# {repo} 总索引')
    lines.append(f'更新日期: {time.strftime("%Y-%m-%d")}')
    lines.append('')
    lines.append('| 卷次 | 方剂数 | 字数 | 献方人 | 索引 | 反思 |')
    lines.append('|------|--------|------|--------|------|------|')
    for info in files_info:
        vol, total, chars, donors_count, idx_path, ref_path = info
        idx_link = os.path.relpath(idx_path, os.path.join(OCR_BASE, repo)) if idx_path else '-'
        ref_link = os.path.relpath(ref_path, os.path.join(OCR_BASE, repo)) if ref_path else '-'
        lines.append(f'| 第{vol}辑 | {total} | {chars} | {donors_count} | {idx_link} | {ref_link} |')

    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))
    return out_path

def update_kb_entry(kb, repo, filepath, vol_num, total, chars, idx_path, ref_path, master_path):
    """Create or update KB entry for this volume"""
    desc = f"十万金方 第{vol_num}辑 - 河北省中医中药展览会验方汇集 (OCR提取原文)" if vol_num else f"{repo} - {os.path.basename(filepath)}"
    title = f"十万金方_第{vol_num}辑" if vol_num else os.path.basename(filepath).replace('.txt','')

    # Check if entry already exists by matching filename in url field
    basename = os.path.basename(filepath)
    for e in kb['knowledge_base']:
        if basename in e.get('url', ''):
            # Update existing
            e['formula_count'] = total
            e['char_count'] = chars
            e['index_file'] = os.path.relpath(idx_path, 'E:/Claude') if idx_path else ''
            e['reflection_file'] = os.path.relpath(ref_path, 'E:/Claude') if ref_path else ''
            e['notes'] = f'OCR提取自扫描PDF，原文未修改。{chars}字，{total}首方剂。权威来源，仅供参考，用药需遵医嘱。'
            return None

    # Create new entry
    nid = max((int(re.search(r'kb-(\d+)', e['id']).group(1)) for e in kb['knowledge_base'] if re.search(r'kb-(\d+)', e['id'])), default=185) + 1
    entry = {
        "id": f"kb-{nid}",
        "repo": repo,
        "type": "tcm_prescription_book",
        "description": desc,
        "url": f"Claude-Work/ocr_output/{repo}/{os.path.basename(filepath)}",
        "learned": time.strftime("%Y-%m-%d"),
        "use_case": "prescription_reference",
        "formula_count": total,
        "char_count": chars,
        "index_file": os.path.relpath(idx_path, 'E:/Claude') if idx_path else '',
        "reflection_file": os.path.relpath(ref_path, 'E:/Claude') if ref_path else '',
        "notes": f'OCR提取自扫描PDF，原文未修改。{chars}字，{total}首方剂。权威来源，仅供参考，用药需遵医嘱。'
    }
    kb['knowledge_base'].append(entry)
    return entry['id']

def main():
    files, dir_path = get_ocr_files(REPO)
    if not files:
        print(f"No OCR files found for {REPO}")
        return

    kb = load_kb()
    files_info = []

    for filename in files:
        filepath = os.path.join(dir_path, filename)
        vol_num = extract_vol_info(filename)
        print(f"\nProcessing: {filename} (vol={vol_num})")

        # 1. Build index
        idx_path, total, chars, cats_count, donors_count = build_index(REPO, filepath, vol_num)
        print(f"  Index: {idx_path} ({total} formulas)")

        # 2. Build reflection
        ref_path = build_reflection(REPO, filepath, vol_num, total, chars, cats_count, donors_count)
        print(f"  Reflection: {ref_path}")

        # 3. Update KB
        new_id = update_kb_entry(kb, REPO, filepath, vol_num, total, chars, idx_path, ref_path, None)
        if new_id:
            print(f"  KB: {new_id}")
        else:
            print(f"  KB: updated existing entry")

        files_info.append((vol_num or 0, total, chars, donors_count, idx_path, ref_path))

    # 4. Build master index
    master_path = build_master_index(REPO, files_info)
    print(f"\nMaster index: {master_path}")

    # 5. Save KB
    save_kb(kb)
    print(f"KB saved: {len(kb['knowledge_base'])} entries")

if __name__ == '__main__':
    main()
