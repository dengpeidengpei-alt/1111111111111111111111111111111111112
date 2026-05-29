# Claude Hooks 备份恢复指南

## 加密备份
- 文件: `.claude/hooks-backup.tar.enc`
- GitHub: `https://github.com/dengpeidengpei-alt/1111111111111111111111111111111111112`

## 密码
`devillor810524`

## 解密命令
```bash
node -e "
const fs = require('fs');
const crypto = require('crypto');
const data = fs.readFileSync('.claude/hooks-backup.tar.enc');
const iv = data.subarray(0, 16);
const tag = data.subarray(16, 32);
const encrypted = data.subarray(32);
const key = crypto.scryptSync('devillor810524', 'salt', 32);
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
let content = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
const fs2 = require('fs');
const blocks = content.split('---ENDOFFILE---\n');
blocks.forEach(block => {
  if (block.startsWith('FILE:')) {
    const fileMatch = block.match(/FILE:(.+?)\nSIZE:(\d+)\n([\s\S]+)/);
    if (fileMatch) {
      fs2.writeFileSync('.claude/hooks/' + fileMatch[1], fileMatch[3]);
    }
  }
});
console.log('恢复完成');
"
```

## 备份内容
- 49个 hook 文件
- 最后更新: 2026-05-29
