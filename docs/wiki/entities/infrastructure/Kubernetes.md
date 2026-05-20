---
type: entity
category: infrastructure
key: Kubernetes
source: Claude-Evo research
date: 2026-05-20
---

# Kubernetes (K8s) - 容器编排

## Overview

开源容器编排平台，自动化容器的部署、扩缩容、网络和运维。用于AI生产环境：模型服务集群、Agent工作流编排、GPU资源管理。

**核心能力**:
- 声明式部署（YAML配置）
- 自动扩缩容（HPA/VPA）
- 服务发现与负载均衡
- GPU调度（nvidia-device-plugin）
- 滚动更新与回滚

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     Control Plane                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │ │
│  │  │ API      │  │ Scheduler│  │ etcd     │  │ CCM     │ │ │
│  │  │ Server   │  │          │  │          │  │         │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                      Worker Nodes                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │ │
│  │  │ Node 1  │  │ Node 2  │  │ Node 3  │              │ │
│  │  │ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │              │ │
│  │  │ │Pod  │ │  │ │Pod  │ │  │ │Pod  │ │              │ │
│  │  │ │GPU  │ │  │ │GPU  │ │  │ │     │ │              │ │
│  │  │ └─────┘ │  │ └─────┘ │  │ └─────┘ │              │ │
│  │  └──────────┘  └──────────┘  └──────────┘              │ │
│  │  ┌─────────────────────────────────────────┐          │ │
│  │  │       nvidia-device-plugin              │          │ │
│  │  │    (GPU Scheduling & Isolation)         │          │ │
│  │  └─────────────────────────────────────────┘          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Essential Commands

```bash
# 集群操作
kubectl get nodes
kubectl cluster-info
kubectl describe node <node-name>

# Pod管理
kubectl get pods -A
kubectl logs -f <pod-name>
kubectl exec -it <pod-name> -- /bin/bash
kubectl delete pod <pod-name>

# 部署管理
kubectl apply -f deployment.yaml
kubectl rollout restart deployment/<name>
kubectl rollout history deployment/<name>
kubectl rollout undo deployment/<name>

# 扩缩容
kubectl scale deployment/<name> --replicas=3
kubectl autoscale deployment/<name> --min=2 --max=10 --cpu-percent=70
```

## YAML Examples

### LLM Inference Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qwen-inference
  labels:
    app: qwen-inference
spec:
  replicas: 2
  selector:
    matchLabels:
      app: qwen-inference
  template:
    metadata:
      labels:
        app: qwen-inference
    spec:
      containers:
      - name: vllm
        image: vllm/vllm-openai:latest
        ports:
        - containerPort: 8000
        env:
        - name: MODEL
          value: "Qwen/Qwen2.5-7B-Instruct"
        resources:
          limits:
            nvidia.com/gpu: 1
            memory: "16Gi"
            cpu: "4"
          requests:
            nvidia.com/gpu: 1
            memory: "8Gi"
            cpu: "2"
        args:
        - --gpu-memory-utilization
        - "0.9"
        - --max-model-len
        - "8192"
      nodeSelector:
        gpu: "true"
      tolerations:
      - key: "nvidia.com/gpu"
        operator: "Exists"
        effect: "NoSchedule"
```

### Service with LoadBalancer

```yaml
apiVersion: v1
kind: Service
metadata:
  name: qwen-inference-svc
spec:
  type: LoadBalancer
  selector:
    app: qwen-inference
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
```

### HPA for Auto-scaling

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: qwen-inference-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: qwen-inference
  minReplicas: 1
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### ConfigMap for Agent Config

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: agent-config
data:
  MODEL_NAME: "qwen2.5:7b"
  MAX_TOKENS: "4096"
  TEMPERATURE: "0.7"
  API_BASE: "http://qwen-inference-svc"
```

## GPU Scheduling

```bash
# 检查GPU节点
kubectl get nodes -l gpu=true

# 在指定GPU上调度
kubectl label nodes <node> gpu=true

# 查看GPU资源
kubectl describe node <node> | grep -A5 "nvidia.com/gpu"

# GPU配额 (LimitRange)
apiVersion: v1
kind: LimitRange
metadata:
  name: gpu-limit
spec:
  limits:
  - type: "nvidia.com/gpu"
    min: "1"
    max: "4"
    default:
      nvidia.com/gpu: "1"
```

## AI Stack Example

```yaml
# docker-compose替代: AI Stack on K8s
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: agent-runtime
spec:
  replicas: 3
  selector:
    matchLabels:
      app: agent-runtime
  template:
    spec:
      containers:
      - name: agent
        image: my-agent:latest
        env:
        - name: LLM_API_BASE
          value: "http://qwen-inference-svc:8000/v1"
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"

---
apiVersion: v1
kind: Service
metadata:
  name: agent-runtime-svc
spec:
  clusterIP: None  # Headless for StatefulSet-like behavior
  selector:
    app: agent-runtime
  ports:
  - port: 8080
    targetPort: 8080
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Pod pending (GPU) | Check `kubectl describe pod` - likely no GPU node matching |
| OOMKilled | Increase memory limits, check HPA |
| CrashLoopBackOff | `kubectl logs` - usually config or dependency issue |
| ImagePullBackOff | Check image name, registry auth |
| GPU not allocated | Verify nvidia-device-plugin running, node has GPU label |

```bash
# Debug commands
kubectl get events --sort-by=.lastTimestamp
kubectl describe pod <pod> -n <namespace>
kubectl top nodes  # 需要metrics-server
kubectl api-resources  # 查看所有资源类型
```

## Cross-refs

- [[infrastructure/Docker.m[[knowledge/Design-Toolkit]]] — K8s容器运行时基础
- [[infrastructure/Local-LLM-Deployment.m[[knowledge/Design-Toolkit]]] — 部署架构参考
- [[infrastructure/vLLM.m[[knowledge/Design-Toolkit]]] — vLLM K8s部署
- [[infrastructure/Ollama.m[[knowledge/Design-Toolkit]]] — 轻量级K8s部署方案