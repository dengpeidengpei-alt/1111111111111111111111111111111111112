"""Batch OCR v3: 十万金方 PDFs via Umi-OCR API (simplified model confirmed working)"""
import requests, json, time, os, re, sys
from pathlib import Path

API = "http://127.0.0.1:1224"
BOOK_DIR = "E:/书籍/中医书籍资料/十万金方"
OUT_DIR = "E:/Claude/ocr_output/十万金方"
LOG_FILE = "E:/Claude/ocr_output/batch_log.txt"
os.makedirs(OUT_DIR, exist_ok=True)

def log(msg):
    ts = time.strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + '\n')

def natural_key(name):
    """Sort by volume number for human-friendly order"""
    nums = re.findall(r'\d+', name)
    return [int(n) if n.isdigit() else n for n in nums] if nums else [name]

def ocr_pdf(pdf_path, vol_name):
    log(f"OCR start: {vol_name}")
    opts = json.dumps({
        'doc.extractionMode': 'fullPage',
        'tbpu.parser': 'multi_para',
        'pageRangeStart': 1,
        'pageRangeEnd': -1,
    })
    for attempt in range(3):
        try:
            with open(pdf_path, 'rb') as f:
                resp = requests.post(f'{API}/api/doc/upload',
                    files={'file': f}, data={'json': opts}, timeout=120)
            data = resp.json()
            if data.get('code') == 100:
                break
            log(f"  Upload fail attempt {attempt+1}: {data}")
            time.sleep(5)
        except Exception as e:
            log(f"  Upload error attempt {attempt+1}: {e}")
            time.sleep(5)
    else:
        return False, None
    task_id = data['data']
    for i in range(600):
        time.sleep(2)
        try:
            result = requests.post(f'{API}/api/doc/result', json={
                'id': task_id, 'is_data': False
            }, timeout=15).json()
        except:
            continue
        done = result.get('is_done', False)
        pc = result.get('processed_count', 0)
        tc = result.get('pages_count', 0)
        state = result.get('state', '')
        if i % 15 == 0 or done:
            log(f"  [{i+1}] {pc}/{tc} {state}")
        if done:
            break
    if result.get('state') != 'success':
        log(f"  FAILED: {result}")
        requests.get(f'{API}/api/doc/clear/{task_id}', timeout=5)
        return False, None
    for attempt in range(3):
        try:
            resp = requests.post(f'{API}/api/doc/download', json={
                'id': task_id, 'file_types': ['txtPlain'], 'ignore_blank': True
            }, timeout=30)
            dl_data = resp.json()
            if dl_data.get('code') == 100:
                break
        except:
            time.sleep(3)
    else:
        requests.get(f'{API}/api/doc/clear/{task_id}', timeout=5)
        return False, None
    try:
        txt_raw = requests.get(dl_data['data'], timeout=30).content
    except:
        requests.get(f'{API}/api/doc/clear/{task_id}', timeout=5)
        return False, None
    safe_name = re.sub(r'[\\/:*?"<>|]', '_', vol_name)[:80]
    out_path = f'{OUT_DIR}/{safe_name}.txt'
    with open(out_path, 'wb') as f:
        f.write(txt_raw)
    requests.get(f'{API}/api/doc/clear/{task_id}', timeout=5)
    text = txt_raw.decode('utf-8', errors='replace')
    log(f"  Done: {safe_name}.txt ({len(txt_raw)} bytes, {len(text)} chars)")
    return True, out_path

log("=" * 50)
log("Batch OCR v3 started")
pdfs = sorted([f for f in os.listdir(BOOK_DIR) if f.endswith('.pdf')], key=natural_key)
log(f"Found {len(pdfs)} PDFs")
results = []
for pdf_name in pdfs:
    pdf_path = os.path.join(BOOK_DIR, pdf_name)
    vol_name = pdf_name.replace('.pdf', '')
    success, out_path = ocr_pdf(pdf_path, vol_name)
    results.append((pdf_name, success))
    log(f"  {'OK' if success else 'X'} {pdf_name}")
log("=" * 50)
ok = sum(1 for _, s in results if s)
log(f"Results: {ok}/{len(results)} succeeded")
log("Batch complete")
