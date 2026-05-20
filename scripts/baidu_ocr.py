#!/usr/bin/env python3
"""
百度OCR调用脚本
"""

import base64
import json
import requests
from pathlib import Path

# 百度OCR配置
API_KEY = "nEdSzzyvYJmUBomRkCLumaRA"
SECRET_KEY = "9xKirjmL0GccORd4wbFeE7wYF7aseL0A"


def get_access_token():
    """获取access_token"""
    auth_url = f"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id={API_KEY}&client_secret={SECRET_KEY}"
    try:
        resp = requests.get(auth_url, timeout=10)
        resp.raise_for_status()
        result = resp.json()
        return result.get('access_token')
    except Exception as e:
        print(f"获取access_token失败: {e}")
        return None


def ocr_general(image_path: str) -> dict:
    """通用文字识别"""
    # 获取token
    access_token = get_access_token()
    if not access_token:
        return {"error": "无法获取access_token"}

    # 调用API
    ocr_url = f"https://aip.baidubce.com/rpc/2.0/ocr/v1/general?access_token={access_token}"

    # 读取图片并转base64
    with open(image_path, 'rb') as f:
        img_base64 = base64.b64encode(f.read()).decode('utf-8')

    data = {'image': img_base64}

    try:
        resp = requests.post(ocr_url, json=data, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


def ocr_general_basic(image_path: str) -> dict:
    """通用文字识别（基础版，无logo）"""
    access_token = get_access_token()
    if not access_token:
        return {"error": "无法获取access_token"}

    ocr_url = f"https://aip.baidubce.com/rpc/2.0/ocr/v1/general_basic?access_token={access_token}"

    with open(image_path, 'rb') as f:
        img_base64 = base64.b64encode(f.read()).decode('utf-8')

    data = {'image': img_base64}

    try:
        resp = requests.post(ocr_url, json=data, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e)}


def print_result(result: dict):
    """打印OCR结果"""
    if "error" in result:
        print(f"错误: {result['error']}")
        return

    words = result.get('words_result', [])
    if not words:
        print("未识别到文字")
        return

    print(f"\n识别到 {len(words)} 行文字:")
    print("-" * 50)
    for i, item in enumerate(words, 1):
        words_text = item.get('words', '')
        print(f"{i}. {words_text}")


def main():
    """主函数"""
    import sys

    if len(sys.argv) < 2:
        print("用法: python baidu_ocr.py <图片路径>")
        print("示例: python baidu_ocr.py test.jpg")
        return 1

    image_path = sys.argv[1]

    if not Path(image_path).exists():
        print(f"文件不存在: {image_path}")
        return 1

    print(f"正在识别: {image_path}")

    # 使用基础版
    result = ocr_general_basic(image_path)
    print_result(result)

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
