"""
十万金方/全民献方 OCR Pipeline 总控
顺序: OCR + 后期流程(索引/反思/入库)

Usage:
  python run_ocr_pipeline.py                    # 十万金方 OCR → 入库
  python run_ocr_pipeline.py --repo 全民献方    # 全民献方 OCR → 入库
  python run_ocr_pipeline.py --postprocess-only # 仅后期流程(已OCR完成)
  python run_ocr_pipeline.py --ocr-only         # 仅OCR，不做后期
"""
import sys, os, subprocess, time

BASE = os.path.dirname(os.path.abspath(__file__))
OCR_SCRIPT = os.path.join(BASE, "batch_ocr_v3.py")
POST_SCRIPT = os.path.join(BASE, "postprocess_ocr.py")

def run(cmd, desc):
    print(f"\n{'='*60}")
    print(f"[Pipeline] {desc}")
    print(f"{'='*60}")
    sys.stdout.flush()
    result = subprocess.run(cmd, shell=True, cwd=BASE)
    if result.returncode != 0:
        print(f"[Pipeline] FAILED: {desc} (exit={result.returncode})")
        sys.exit(result.returncode)
    print(f"[Pipeline] OK: {desc}")
    return result

def main():
    args = sys.argv[1:]
    repo = "十万金方"
    ocr_only = False
    post_only = False

    for a in args:
        if a.startswith("--repo="):
            repo = a.split("=", 1)[1]
        elif a == "--ocr-only":
            ocr_only = True
        elif a == "--postprocess-only":
            post_only = True

    if not post_only:
        run(f"python \"{OCR_SCRIPT}\"", f"OCR: {repo}")

    if not ocr_only:
        run(f"python \"{POST_SCRIPT}\" \"{repo}\"", f"Postprocess: {repo}")

    print(f"\n[Pipeline] Complete: {repo}")

if __name__ == '__main__':
    main()
