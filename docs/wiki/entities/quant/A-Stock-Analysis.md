---
type: entity
category: quant
key: A股分析 (A-Stock-Analysis)
source: Claude-Evo research
date: 2026-05-20
layer: 3.0
rating: 4
---

# A股分析 (A-Stock-Analysis)

## Overview
- **全称**: A股市场技术分析与量化投资
- **本质**: 通过数学统计方法识别市场规律，辅助投资决策
- **核心问题**: 选股、择时、风控三大难题

## 核心方法

### 1. 技术分析 (Technical Analysis)

#### K线形态 (Candlestick Patterns)

| 形态 | 信号强度 | 适用场景 |
|------|----------|----------|
| 锤子线 | 底部反转 | 短线抄底 |
| 吞没形态 | 趋势反转 | 中期拐点 |
| 旗形整理 | 持续形态 | 趋势中继 |
| 头肩顶/底 | 趋势反转 | 大周期顶底 |

```python
import pandas as pd
import numpy as np

def detect_hammer(df: pd.DataFrame, body_ratio: float = 0.3) -> pd.Series:
    """
    锤子线检测：下影线是实体2倍以上

    Args:
        df: 包含 high, low, open, close 的DataFrame
        body_ratio: 实体占整根K线的比例阈值
    """
    body = abs(df['close'] - df['open'])
    upper_shadow = df['high'] - df[['open', 'close']].max(axis=1)
    lower_shadow = df[['open', 'close']].min(axis=1) - df['low']

    is_hammer = (
        (lower_shadow > 2 * body) &  # 下影线是实体2倍以上
        (upper_shadow < body * 0.5) &  # 上影线很短
        (body < (df['high'] - df['low']) * body_ratio)  # 实体较小
    )
    return is_hammer

def detect_engulfing(df: pd.DataFrame) -> pd.Series:
    """
    吞没形态检测：今日实体完全包裹昨日实体
    """
    prev_body = abs(df['open'].shift(1) - df['close'].shift(1))
    curr_body = abs(df['close'] - df['open'])

    # 今日上涨且吞没昨日下跌
    bullish_engulf = (
        (df['close'] > df['open']) &  # 今日收阳
        (df['open'].shift(1) > df['close'].shift(1)) &  # 昨日收阴
        (df['open'] <= df['close'].shift(1)) &  # 今日开盘 <= 昨日收盘
        (df['close'] >= df['open'].shift(1))  # 今日收盘 >= 昨日开盘
    )

    # 今日下跌且吞没昨日上涨
    bearish_engulf = (
        (df['close'] < df['open']) &  # 今日收阴
        (df['open'].shift(1) < df['close'].shift(1)) &  # 昨日收阳
        (df['open'] >= df['close'].shift(1)) &  # 今日开盘 >= 昨日收盘
        (df['close'] <= df['open'].shift(1))  # 今日收盘 <= 昨日开盘
    )

    return bullish_engulf | bearish_engulf
```

#### 均线系统 (Moving Average System)

| 均线 | 周期 | 适用场景 |
|------|------|----------|
| MA5 | 短线 | 短期趋势 |
| MA20 | 中线 | 中期趋势 |
| MA60 | 长线 | 长期趋势 |
| MA120 | 半年线 | 牛熊分界 |

```python
def ma_cross_strategy(df: pd.DataFrame,
                     short: int = 5,
                     long: int = 20) -> pd.DataFrame:
    """
    均线金叉死叉策略

    金叉: 短期均线从下方穿过长期均线 → 买入信号
    死叉: 短期均线从上方穿过长期均线 → 卖出信号
    """
    df = df.copy()
    df['ma_short'] = df['close'].rolling(short).mean()
    df['ma_long'] = df['close'].rolling(long).mean()

    # 金叉 (买入)
    df['golden_cross'] = (
        (df['ma_short'] > df['ma_long']) &
        (df['ma_short'].shift(1) <= df['ma_long'].shift(1))
    )

    # 死叉 (卖出)
    df['death_cross'] = (
        (df['ma_short'] < df['ma_long']) &
        (df['ma_short'].shift(1) >= df['ma_long'].shift(1))
    )

    return df

def macd_strategy(df: pd.DataFrame,
                  fast: int = 12,
                  slow: int = 26,
                  signal: int = 9) -> pd.DataFrame:
    """
    MACD策略: DIF与DEA金叉买入，死叉卖出
    """
    df = df.copy()
    ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
    ema_slow = df['close'].ewm(span=slow, adjust=False).mean()

    df['DIF'] = ema_fast - ema_slow
    df['DEA'] = df['DIF'].ewm(span=signal, adjust=False).mean()
    df['MACD'] = (df['DIF'] - df['DEA']) * 2  # 柱状图

    # 金叉买入
    df['macd_golden'] = (
        (df['DIF'] > df['DEA']) &
        (df['DIF'].shift(1) <= df['DEA'].shift(1))
    )

    # 死叉卖出
    df['macd_death'] = (
        (df['DIF'] < df['DEA']) &
        (df['DIF'].shift(1) >= df['DEA'].shift(1))
    )

    return df
```

### 2. 量化策略 (Quantitative Strategy)

#### 因子选股 (Factor-Based Stock Selection)

| 因子类型 | 因子名 | 逻辑 |
|----------|--------|------|
| 估值因子 | PE、PB | 低估值=安全边际 |
| 成长因子 | 净利润增速、营收增速 | 高成长=高收益 |
| 质量因子 | ROE、毛利率 | 好公司=高壁垒 |
| 动量因子 | 20日收益率 | 强者恒强 |

```python
def factor_portfolio(df: pd.DataFrame,
                     factors: list[st[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]],
                     weights: list[floa[[knowledge/Design-Toolkit]],
                     top_n: int = 50) -> pd.DataFrame:
    """
    多因子选股组合

    Args:
        factors: ['pe', 'roe', 'momentum'] 等因子列表
        weights: 各因子权重 [0.3, 0.4, 0.3]
        top_n: 选取前N只股票
    """
    df = df.copy()

    # 因子打分 (标准化后等权求和)
    scores = pd.DataFrame(index=df.index)
    for factor, weight in zip(factors, weights):
        if factor == 'pe':
            # 市盈率越低越好，取负数
            scores[facto[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = -df[facto[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]].rank(ascending=True)
        elif factor == 'roe':
            # ROE越高越好
            scores[facto[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = df[facto[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]].rank(ascending=False)
        elif factor == 'momentum':
            # 动量越高越好
            scores[facto[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]] = df[facto[[knowledge/Learnings-Lo[[knowledge/Design-Toolkit]]].rank(ascending=False)

    # 加权综合得分
    df['composite_score'] = (scores * weights).sum(axis=1)

    # 选取得分最高的前N只
    df = df.sort_values('composite_score', ascending=False)
    return df.head(top_n)
```

#### 趋势跟踪 (Trend Following)

```python
def turtle_trade(df: pd.DataFrame,
                 entry_window: int = 20,
                 exit_window: int = 10,
                 atr_period: int = 14,
                 atr_multiplier: float = 2.0) -> pd.DataFrame:
    """
    海龟交易策略:
    - 入场: 价格突破20日高点
    - 止损: 跌破2倍ATR
    - 出场: 价格跌破10日低点
    """
    df = df.copy()

    # ATR计算
    high_low = df['high'] - df['low']
    high_close = abs(df['high'] - df['close'].shift(1))
    low_close = abs(df['low'] - df['close'].shift(1))
    tr = pd.concat([high_low, high_close, low_clos[[Self-Healing-Loop]], axis=1).max(axis=1)
    df['atr'] = tr.rolling(atr_period).mean()

    # 突破信号
    df['entry_signal'] = df['high'] > df['high'].rolling(entry_window).max().shift(1)

    # 止损线
    df['stop_loss'] = df['close'] - atr_multiplier * df['atr']

    # 出场信号
    df['exit_signal'] = df['low'] < df['low'].rolling(exit_window).min().shift(1)

    return df
```

## 技术分析 vs 量化投资 对比表

| 维度 | 技术分析 | 量化投资 |
|------|----------|----------|
| 方法论 | 图表形态、经验规则 | 数学模型、统计检验 |
| 决策方式 | 主观判断 | 系统化执行 |
| 优势 | 直观、快速 | 可回测、低偏差 |
| 劣势 | 主观性强、难复制 | 模型风险、市场适应性 |
| 适用场景 | 短线交易、个股分析 | 中长线组合、风险控制 |
| 数据需求 | 价格数据 | 多维度市场数据 |
| 执行频率 | 高频 | 低频到高频 |

## 应用场景

### 1. 选股 (Stock Screening)
- 均线多头排列筛选
- 突破新高筛选
- 因子打分筛选

### 2. 择时 (Market Timing)
- MACD金叉死叉判断
- 布林带上下轨操作
- 趋势线突破确认

### 3. 风控 (Risk Management)
- 止损设置 (ATR倍数)
- 仓位管理 (凯利公式)
- 分散配置 (行业轮动)

## A股特殊规则

| 规则 | 说明 | 影响 |
|------|------|------|
| 涨跌停板 | ±10% (ST ±5%) | 极端行情无法买入卖出 |
| T+1交易 | 当日买入次日卖出 | 当日追高风险大 |
| 涨停板排队 | 涨幅达到上限后排队 | 买不进是常态 |
| 涨跌停龙虎榜 | 异常波动需披露 | 短线资金关注点 |

## 经典书籍

| 书名 | 作者 | 核心内容 |
|------|------|----------|
| 《日本蜡烛图技术》 | Steve Nison | K线形态学入门经典 |
| 《以交易为生》 | Alexander Elder | 交易心理与系统 |
| 《海龟交易法则》 | Curtis Faith | 趋势跟踪量化系统 |
| 《期货市场技术分析》 | John Murphy | 技术分析百科全书 |
| 《量化投资》 | Ernest Chan | 量化策略实战 |

## Cross-refs

- [[quant/A股技术分析策略.m[[knowledge/Design-Toolkit]]] — 具体技术指标与信号系统
- [[knowledge/Knowledge-Graph.m[[knowledge/Design-Toolkit]]] — 知识图谱辅助选股分析
- [[ml/Embedding.m[[knowledge/Design-Toolkit]]] — 文本嵌入用于新闻舆情分析
- [[ml/RAG.m[[knowledge/Design-Toolkit]]] — 财报研报智能检索问答
- [[ml/Agentic-RAG.m[[knowledge/Design-Toolkit]]] — Agent驱动智能投研
- [[memory/Mem0.m[[knowledge/Design-Toolkit]]] — 投资记忆与偏好学习
- [[ml/Transformer.m[[knowledge/Design-Toolkit]]] — Transformer用于时序预测

## Related Projects

- `E:\Claude\Claude-Work\a_stock_quant_system/` — 量化交易系统
- `E:\Claude\Claude-Work\a_stock_trader/` — A股交易策略
- `E:\Claude\Claude-Work\LSTM-Neural-Network-for-Time-Series-Prediction/` — 时序预测模型