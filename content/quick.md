# 期末速查: 公式与高频考点

## Compile 编译原理

### 主线

```text
字符流 -> token -> 语法树 -> 带属性语法树/符号表 -> IR -> 优化 IR -> 目标代码
```

### 高频必会

- [正规式](?doc=deep-dive&anchor=compile-regular-expression#reader)、[NFA/DFA/最长匹配](?doc=deep-dive&anchor=compile-nfa-dfa#reader)。
- [FIRST/FOLLOW](?doc=deep-dive&anchor=compile-first-follow#reader)、[LL(1) 表](?doc=deep-dive&anchor=compile-ll1#reader)。
- [消除左递归、提取左公因子](?doc=deep-dive&anchor=compile-left-recursion#reader)。
- [LR(0)/SLR/LR(1)/LALR 项目集和冲突](?doc=deep-dive&anchor=compile-lr-items#reader)。
- [属性文法、综合属性、继承属性](?doc=deep-dive&anchor=compile-syntax-directed#reader)。
- [三地址码、四元式](?doc=deep-dive&anchor=compile-three-address#reader)、if/while/do-while 翻译。
- [活动记录、栈/堆/静态分配](?doc=deep-dive&anchor=compile-runtime#reader)、GC。
- [基本块、CFG、DAG、数据流分析](?doc=deep-dive&anchor=compile-data-flow#reader)、循环优化。
- [寄存器分配、图着色、spilling](?doc=deep-dive&anchor=compile-register-allocation#reader)。

### 常用模板

直接左递归:

```text
A  -> A α | β
A  -> β A'
A' -> α A' | ε
```

while 翻译:

```text
L_begin:
E.code
ifFalse E.place goto L_after
S.code
goto L_begin
L_after:
```

do-while 翻译:

```text
L_begin:
S.code
E.code
ifTrue E.place goto L_begin
```

## Network 计算机网络

### [分层速记](?doc=deep-dive&anchor=network-layering#reader)

```text
应用层: HTTP DNS FTP Email DHCP
传输层: TCP UDP 端口 可靠传输 拥塞控制
网络层: IP 路由 子网 ARP ICMP NAT IPv6
链路层: 帧 MAC 交换机 VLAN CRC 滑动窗口
物理层: bit 信号 编码 调制 介质
```

### [时延](?doc=deep-dive&anchor=network-delay#reader)

```text
传输时延 = L / R
传播时延 = d / s
总时延 = 处理 + 排队 + 传输 + 传播
```

### [信道容量](?doc=deep-dive&anchor=network-nyquist-shannon#reader)

```text
Nyquist: C = 2B log2(V)
Shannon: C = B log2(1 + S/N)
dB = 10 log10(S/N)
```

### [滑动窗口](?doc=deep-dive&anchor=network-sliding-window#reader)

```text
GBN 最大窗口 = 2^k - 1
SR 最大窗口 = 2^(k-1)
```

### [子网](?doc=deep-dive&anchor=network-subnet-cidr#reader)

```text
主机位 = 32 - 前缀长度
地址数 = 2^主机位
传统可用主机数 = 2^主机位 - 2
网络地址 = IP & Mask
最长前缀匹配 = 选最具体路由
```

### [IP 分片](?doc=deep-dive&anchor=network-ip-fragment#reader)

- 每片数据长度不超过 `MTU - IP首部长度`。
- 除最后一片外, 数据长度应是 8 Byte 的整数倍。
- Fragment Offset 单位是 8 Byte。
- 前面分片 `MF=1`, 最后一片 `MF=0`。

### [TCP](?doc=deep-dive&anchor=network-tcp-handshake#reader)

```text
发送窗口 = min(rwnd, cwnd)
```

- 三次握手: SYN, SYN+ACK, ACK。
- 慢启动: 指数增长。
- 拥塞避免: 线性增长。
- 超时: 更严重, cwnd 通常回小。
- 三个重复 ACK: 快速重传/快速恢复。

## RISC-V 组成与体系结构

### [Amdahl 定律](?doc=deep-dive&anchor=riscv-amdahl#reader)

```text
Sn = 1 / ((1 - Fe) + Fe / Se)
极限 Sn <= 1 / (1 - Fe)
```

### [CPU 性能](?doc=deep-dive&anchor=riscv-cpu-performance#reader)

```text
CPU time = IC * CPI * Clock Cycle Time
CPU time = IC * CPI / Clock Rate
```

### [补码](?doc=deep-dive&anchor=riscv-twos-complement#reader)

```text
n 位补码范围 = -2^(n-1) 到 2^(n-1)-1
同号相加得异号 -> 溢出
最高位进位与次高位进位不同 -> 溢出
```

### [IEEE 754 单精度](?doc=deep-dive&anchor=riscv-ieee754#reader)

```text
1 位符号 + 8 位阶码 + 23 位尾数
value = (-1)^S * 1.fraction * 2^(E - 127)
```

### [Cache](?doc=deep-dive&anchor=riscv-cache#reader)

```text
命中率 H = 命中次数 / 总访问次数
平均访问时间 TA = H*T1 + (1-H)*T2
访问效率 e = T1 / TA
直接映像: Cache块号 = 主存块号 mod Cache块数
组相联: Cache组号 = 主存块号 mod Cache组数
```

地址划分:

```text
offset = log2(块大小 Byte)
index/set = log2(行数或组数)
tag = 地址总位数 - offset - index/set
```

### [总线](?doc=deep-dive&anchor=riscv-bus-io-dma#reader)

```text
总线带宽 = 总线宽度(bit) * 频率 / 8
```

### [RISC-V 指令速记](?doc=deep-dive&anchor=riscv-instruction-format#reader)

- `x0` 恒为 0。
- R-type: `add rd, rs1, rs2`
- I-type/load: `addi rd, rs1, imm`, `lw rd, imm(rs1)`
- S-type/store: `sw rs2, imm(rs1)`
- B-type/branch: `beq rs1, rs2, label`
- U-type: `lui`, `auipc`
- J-type: `jal`

### [流水线](?doc=deep-dive&anchor=riscv-pipeline-hazards#reader)

```text
五级: IF ID EX MEM WB
CPI = 理想CPI + 平均停顿周期
```

三类冒险:

- 结构冒险: 资源冲突。
- 数据冒险: 结果未写回就被使用。
- 控制冒险: 分支导致 PC 不确定。

load-use:

```text
lw  x1, 0(x2)
add x3, x1, x4
```

通常需要停顿 1 周期。

## Software Engineering 软件工程基础

### 主线

```text
软件危机 -> 过程模型 -> 需求工程 -> 设计 -> 实现 -> 测试 -> 维护 -> 项目管理
```

### 高频必会

- [软件 = 程序 + 数据 + 文档](?doc=deep-dive&anchor=software-crisis#reader)，软件工程三要素 = 方法、工具、过程。
- [过程模型](?doc=deep-dive&anchor=software-process-models#reader): 瀑布适合需求明确，原型适合需求不清，增量适合分批交付，螺旋强调风险，敏捷强调快速反馈。
- [需求工程](?doc=deep-dive&anchor=software-requirements#reader): 可行性分析、需求获取、需求分析建模、SRS、需求评审、变更管理。
- [DFD](?doc=deep-dive&anchor=software-dfd#reader): 外部实体、加工、数据流、数据存储。箭头是数据流，不是控制流。
- [软件设计](?doc=deep-dive&anchor=software-design#reader): 概要设计管结构，详细设计管模块内部过程。
- [高内聚低耦合](?doc=deep-dive&anchor=software-cohesion-coupling#reader): 功能内聚最好，内容耦合最差。
- [结构化设计](?doc=deep-dive&anchor=software-structured-design#reader): 变换分析看输入-处理-输出，事务分析看事务中心和多条路径。
- [测试](?doc=deep-dive&anchor=software-testing#reader): 测试是为了发现错误，不是证明无错。
- [白盒测试](?doc=deep-dive&anchor=software-white-box#reader): `V(G)=判定结点数+1`。
- [黑盒测试](?doc=deep-dive&anchor=software-black-box#reader): 等价类、边界值、因果图、判定表。
- [UML](?doc=deep-dive&anchor=software-uml#reader): 用例图看功能，类图看静态结构，顺序图看消息顺序，状态图看状态变化。
- [维护](?doc=deep-dive&anchor=software-maintenance#reader): 纠错、适应、完善、预防。
- [项目管理](?doc=deep-dive&anchor=software-project-management#reader): LOC、FP、甘特图、网络图、CMM、配置管理基线。

### 常用模板

可行性分析:

```text
技术可行性 + 经济可行性 + 操作可行性 + 法律可行性
```

SRS 质量:

```text
正确 完整 一致 可行 可理解 可验证 可修改 可追踪
```

维护分类:

```text
修错误 -> 纠错性维护
适应环境 -> 适应性维护
加功能/提性能 -> 完善性维护
提前改进质量 -> 预防性维护
```
