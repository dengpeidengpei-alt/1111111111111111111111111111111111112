---
type: entity
category: quant
key: A股技术分析策略
source: Claude-Evo research
date: 2026-05-14
layer: 2.0
rating: 4
---

# A股技术分析策略

> 专注A股市场的技术指标体系、信号系统、板块联动与实战策略

## Overview

- **本质**: 通过价格/量能/均线等历史数据，预测未来股价走势
- **核心问题**: 选时(何时买)、选方向(买多买空)、风控(止损止盈)
- **适用周期**: 短线(日内→数日)、中线(周→月)

---

## 一、技术指标体系

### 1.1 趋势类指标

#### MACD (Moving Average Convergence Divergence)

```python
class MACD:
    """
    MACD = DIF - DEA
    DIF = EMA(close, 12) - EMA(close, 26)
    DEA = EMA(DIF, 9)
    """

    def __init__(self, fast=12, slow=26, signal=9):
        self.fast = fast
        self.slow = slow
        self.signal = signal

    def compute(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        ema_fast = df['close'].ewm(span=self.fast, adjust=False).mean()
        ema_slow = df['close'].ewm(span=self.slow, adjust=False).mean()

        df['DIF'] = ema_fast - ema_slow
        df['DEA'] = df['DIF'].ewm(span=self.signal, adjust=False).mean()
        df['MACD_hist'] = (df['DIF'] - df['DEA']) * 2  # 柱状图

        return df

    def cross_signals(self, df) -> dict:
        """金叉死叉信号"""
        dif = df['DIF']
        dea = df['DEA']

        # 金叉: DIF从下穿上DEA
        golden = (dif > dea) & (dif.shift(1) <= dea.shift(1))
        # 死叉: DIF从上穿下DEA
        death = (dif < dea) & (dif.shift(1) >= dea.shift(1))

        # 零轴金叉死叉 (更可靠)
        zero_cross_up = (dif > 0) & (dif.shift(1) <= 0)  # 上穿零轴
        zero_cross_down = (dif < 0) & (dif.shift(1) >= 0)  # 下穿零轴

        return {
            'golden': golden,
            'death': death,
            'zero_cross_up': zero_cross_up,
            'zero_cross_down': zero_cross_down
        }
```

**MACD实战参数表**

| 参数组合 | 适用场景 | 信号特征 |
|---------|---------|---------|
| (12,26,9) | 标准 | 平衡，适合日线 |
| (6,13,5) | 短线敏感 | 快速响应，信号多 |
| (19,39,9) | 长线稳健 | 过滤噪音，滞后 |
| (5,35,5) | 期货 | 高频交易 |

**MACD背离判断**

```
顶背离: 股价创新高，DIF未创新高 → 看跌
底背离: 股价创新低，DIF未创新低 → 看涨

判断标准:
1. 价格两个峰值连成线，DIF对应两个峰值连成线，方向相反
2. 背离发生在0轴附近可靠性更高
3. 三次背离信号最强
```

#### KDJ (随机指标)

```python
class KDJ:
    """
    RSV = (Close - Lowest_n) / (Highest_n - Lowest_n) * 100
    K = 2/3 * prev_K + 1/3 * RSV
    D = 2/3 * prev_D + 1/3 * K
    J = 3*K - 2*D
    """

    def __init__(self, n=9, m1=3, m2=3):
        self.n = n  # RSV周期
        self.m1 = m1  # K平滑
        self.m2 = m2  # D平滑

    def compute(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        low_n = df['low'].rolling(self.n).min()
        high_n = df['high'].rolling(self.n).max()

        rsv = (df['close'] - low_n) / (high_n - low_n) * 100
        rsv = rsv.fillna(50)

        # K,D计算
        df['K'] = rsv.ewm(alpha=1/self.m1, adjust=False).mean()
        df['D'] = df['K'].ewm(alpha=1/self.m2, adjust=False).mean()
        df['J'] = 3 * df['K'] - 2 * df['D']

        return df

    def cross_signals(self, df) -> dict:
        """KDJ金叉死叉"""
        k = df['K']
        d = df['D']

        # 金叉
        golden = (k > d) & (k.shift(1) <= d.shift(1))
        # 死叉
        death = (k < d) & (k.shift(1) >= d.shift(1))

        # 超买超卖
        overbought = df['K'] > 80  # 超买区
        oversold = df['K'] < 20   # 超卖区

        return {
            'golden': golden,
            'death': death,
            'overbought': overbought,
            'oversold': oversold
        }
```

#### 布林带 (Bollinger Bands)

```python
class BollingerBands:
    """
    中轨 = MA(close, N)
    上轨 = 中轨 + 2 * STD(close, N)
    下轨 = 中轨 - 2 * STD(close, N)
    """

    def __init__(self, n=20, k=2):
        self.n = n
        self.k = k

    def compute(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df['MA'] = df['close'].rolling(self.n).mean()
        df['STD'] = df['close'].rolling(self.n).std()
        df['upper'] = df['MA'] + self.k * df['STD']
        df['lower'] = df['MA'] - self.k * df['STD']

        # 布林带收口开口
        df['bandwidth'] = (df['upper'] - df['lower']) / df['MA']
        df['position'] = (df['close'] - df['lower']) / (df['upper'] - df['lower'])

        return df

    def signals(self, df) -> dict:
        """布林带信号"""
        # 突破上轨
        break_upper = df['close'] > df['upper']
        # 跌破下轨
        break_lower = df['close'] < df['lower']
        # 中轨支撑/压力
        touch_upper = (df['high'] >= df['upper']) & (df['close'] < df['upper'])
        touch_lower = (df['low'] <= df['lower']) & (df['close'] > df['lower'])

        return {
            'break_upper': break_upper,
            'break_lower': break_lower,
            'touch_upper': touch_upper,
            'touch_lower': touch_lower
        }
```

### 1.2 量能类指标

#### VOL量价分析

```python
class VolumeAnalysis:
    """
    量价关系核心:
    - 价升量增: 多头趋势确认
    - 价升量缩: 上涨动力衰减
    - 价跌量增: 空头抛压沉重
    - 价跌量缩: 下跌可能企稳
    """

    def compute(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df['vol_ma5'] = df['volume'].rolling(5).mean()
        df['vol_ma10'] = df['volume'].rolling(10).mean()
        df['vol_ma20'] = df['volume'].rolling(20).mean()

        # 量比 (当日成交量/过去5日平均)
        df['vol_ratio'] = df['volume'] / df['vol_ma5']

        # 放量标准: 量比 > 2
        df['volume_burst'] = df['vol_ratio'] > 2

        return df

    def price_vol_divergence(self, df) -> bool:
        """
        量价背离: 价格上涨但成交量萎缩
        预警: 可能见顶
        """
        price_up = df['close'] > df['close'].shift(1)
        vol_decrease = df['volume'] < df['volume'].shift(1)

        return price_up & vol_decrease
```

### 1.3 均线系统

| 均线 | 周期 | 含义 | 实战用法 |
|------|------|------|---------|
| MA5 | 1周 | 短线生命线 | 跌破减仓 |
| MA10 | 2周 | 短期支撑 | 回踩买入 |
| MA20 | 1月 | 中期趋势 | 趋势确认 |
| MA60 | 3月 | 牛熊分界 | 多空分水岭 |
| MA120 | 6月 | 半年线 | 长线布局 |
| MA250 | 1年 | 年线 | 长期牛熊 |

**均线多头排列**: 所有均线向上发散 → 强势格局
**均线空头排列**: 所有均线向下发散 → 弱势格局
**均线缠绕**: 均线交织 → 震荡行情

---

## 二、信号系统

### 2.1 综合信号矩阵

| 信号类型 | 强度 | 触发条件 |
|---------|------|---------|
| 强烈买入 | ★★★★★ | MACD零轴上金叉 + KDJ超卖金叉 + 放量 |
| 买入 | ★★★★☆ | MACD金叉 + 均线多头排列 |
| 观望 | ★★★☆☆ | MACD纠缠 + 成交量萎缩 |
| 卖出 | ★★★★☆ | MACD死叉 + 均线空头排列 |
| 强烈卖出 | ★★★★★ | MACD零轴下死叉 + KDJ超买死叉 + 放量 |

### 2.2 指标组合策略

#### MACD + KDJ 组合

```
买入条件:
1. MACD DIF从下穿越DEA (金叉)
2. DIF在0轴上方
3. KDJ K从下穿越D (金叉)
4. KDJ在50附近或超卖区
5. 成交量放大

卖出条件:
1. MACD DIF从上穿越DEA (死叉)
2. KDJ K从上穿越D (死叉)
3. KDJ在50附近或超买区
```

#### MACD + 布林带 组合

```
买入条件:
1. 股价从下轨向上突破布林中轨
2. MACD DIF在0轴上方
3. 成交量配合

卖出条件:
1. 股价从上轨向下回落
2. MACD出现顶背离
3. 成交量萎缩
```

---

## 三、板块联动

### 3.1 板块轮动规律

| 时间特征 | 轮动规律 |
|---------|---------|
| 开盘30分钟 | 主力拉抬龙头股 |
| 上午10:00-11:30 | 跟风股补涨 |
| 下午13:00-14:30 | 板块切换 |
| 尾盘30分钟 | 护盘或砸盘 |

### 3.2 龙头股识别

```python
def find_leader_stock(stocks: pd.DataFrame, sector: str) -> dict:
    """
    龙头股特征:
    1. 率先涨停
    2. 成交量放大
    3. 连续3日涨幅超过板块
    4. 大单净流入
    """
    leaders = [[Self-Healing-Loop]]

    for _, stock in stocks.iterrows():
        score = 0

        # 涨幅领先
        if stock['pct_change'] > sector_avg_pct:
            score += 3

        # 成交量放大
        if stock['vol_ratio'] > 2:
            score += 2

        # 大单净流入
        if stock['big_net_flow'] > 0:
            score += 2

        # 涨停
        if stock['pct_change'] >= 9.9:
            score += 3

        leaders.append({'code': stock['code'], 'score': score})

    return sorted(leaders, key=lambda x: x['score'], reverse=True)
```

---

## 四、A股特殊规则与风控

### 4.1 A股特殊规则

| 规则 | 说明 | 交易影响 |
|------|------|---------|
| 涨跌停板 | ±10% (ST ±5%) | 极端行情无法买入卖出 |
| T+1交易 | 当日买入次日卖出 | 当日追高风险大 |
| 涨停板排队 | 涨幅达到上限后排队 | 买不进是常态 |
| 龙虎榜 | 异常波动需披露 | 短线资金关注点 |

### 4.2 止损设置

```python
class StopLossManager:
    """
    止损策略:
    1. 固定止损: 亏损7%止损
    2. ATR止损: 亏损2倍ATR止损
    3. 均线止损: 跌破MA5止损
    """

    def __init__(self, method='atr', atr_multiplier=2, max_loss=0.07):
        self.method = method
        self.atr_multiplier = atr_multiplier
        self.max_loss = max_loss

    def compute_stop_loss(self, df: pd.DataFrame, position_price: float) -> float:
        if self.method == 'fixed':
            return position_price * (1 - self.max_loss)
        elif self.method == 'atr':
            atr = df['atr'].iloc[-1]
            return position_price - self.atr_multiplier * atr
        elif self.method == 'ma':
            return df['ma5'].iloc[-1]
```

### 4.3 仓位管理

```python
def kelly_position(win_rate: float, avg_win: float, avg_loss: float) -> float:
    """
    凯利公式: f = (bp - q) / b
    f = 仓位比例
    b = 赔率 (avg_win / avg_loss)
    p = 胜率
    q = 败率 (1-p)
    """
    b = avg_win / avg_loss
    p = win_rate
    q = 1 - p

    f = (b * p - q) / b
    return max(0, min(f, 0.25))  # 最大仓位25%
```

---

## 五、实战案例

### 5.1 趋势跟踪策略

```python
class TrendFollowingStrategy:
    """
    海龟策略简化版:
    - 入场: 价格突破20日高点
    - 加仓: 价格突破10日高点
    - 止损: 跌破2倍ATR
    - 出场: 价格跌破10日低点
    """

    def __init__(self, entry_window=20, exit_window=10, atr_period=14):
        self.entry_window = entry_window
        self.exit_window = exit_window
        self.atr_period = atr_period

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()

        # ATR计算
        high_low = df['high'] - df['low']
        high_close = abs(df['high'] - df['close'].shift(1))
        low_close = abs(df['low'] - df['close'].shift(1))
        tr = pd.concat([high_low, high_close, low_clos[[Self-Healing-Loop]], axis=1).max(axis=1)
        df['atr'] = tr.rolling(self.atr_period).mean()

        # 突破信号
        df['entry'] = df['close'] > df['high'].rolling(self.entry_window).max().shift(1)

        # 止损
        df['stop_loss'] = df['close'] - 2 * df['atr']

        # 出场
        df['exit'] = df['close'] < df['low'].rolling(self.exit_window).min().shift(1)

        return df
```

### 5.2 均线金叉策略

```python
class MACrossStrategy:
    """
    均线金叉死叉策略:
    - 金叉: MA5上穿MA20 → 买入
    - 死叉: MA5下穿MA20 → 卖出
    """

    def __init__(self, short=5, long=20):
        self.short = short
        self.long = long

    def generate_signals(self, df: pd.DataFrame) -> pd.DataFrame:
        df = df.copy()
        df['ma_short'] = df['close'].rolling(self.short).mean()
        df['ma_long'] = df['close'].rolling(self.long).mean()

        df['golden_cross'] = (
            (df['ma_short'] > df['ma_long']) &
            (df['ma_short'].shift(1) <= df['ma_long'].shift(1))
        )

        df['death_cross'] = (
            (df['ma_short'] < df['ma_long']) &
            (df['ma_short'].shift(1) >= df['ma_long'].shift(1))
        )

        return df
```

---

## 六、策略评估指标

| 指标 | 计算方式 | 合格标准 |
|------|---------|---------|
| 夏普比率 | (策略收益 - 无风险收益) / 策略波动率 | > 1.5 |
| 最大回撤 | 策略历史最大亏损比例 | < 15% |
| 胜率 | 盈利交易次数 / 总交易次数 | > 45% |
| 盈亏比 | 平均盈利 / 平均亏损 | > 1.2 |
| 交易频率 | 年交易次数 | 视策略而定 |

---

## Cross-refs

- [[quant/A-Stock-Analysis.m[[knowledge/Design-Toolkit]]] — A股技术分析与量化投资 ★★★★☆
- [[concepts/2026-05-14_concept_quant-trading.m[[knowledge/Design-Toolkit]]] — 量化交易概念
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱辅助选股分析
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 文本嵌入用于新闻舆情分析
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 投资记忆与偏好学习

## Related Projects

- `E:\Claude\Claude-Work\a_stock_quant_system\` — 量化交易系统
- `E:\Claude\Claude-Work\a_stock_trader\` — A股交易策略