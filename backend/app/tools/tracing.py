"""Sentry Tracing & Telemetry Module for Autonomiq.
Records agent step execution, LLM call latencies, token counts, and errors.
"""

import time
from typing import Dict, Any, Optional, List
from backend.app.config import settings


class AgentTracer:
    _local_spans: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def init_sentry(cls):
        """Initializes Sentry SDK if DSN is configured."""
        if settings.SENTRY_DSN:
            try:
                import sentry_sdk
                sentry_sdk.init(
                    dsn=settings.SENTRY_DSN,
                    environment=settings.SENTRY_ENVIRONMENT,
                    traces_sample_rate=1.0,
                    send_default_pii=False,
                )
            except Exception:
                pass

    @classmethod
    def record_span(
        cls,
        task_id: str,
        step_name: str,
        duration_ms: float,
        model: Optional[str] = None,
        tokens_used: int = 0,
        status: str = "success",
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Record an execution span locally and emit to Sentry if active."""
        span_data = {
            "step_name": step_name,
            "duration_ms": round(duration_ms, 2),
            "model": model or "local",
            "tokens_used": tokens_used,
            "status": status,
            "timestamp": time.time(),
            "metadata": metadata or {},
        }

        if task_id not in cls._local_spans:
            cls._local_spans[task_id] = []
        cls._local_spans[task_id].append(span_data)

    @classmethod
    def get_task_trace_summary(cls, task_id: str) -> Dict[str, Any]:
        """Generate a per-task trace summary for the Sentry trace widget."""
        spans = cls._local_spans.get(task_id, [])
        total_duration = sum(s["duration_ms"] for s in spans)
        total_tokens = sum(s["tokens_used"] for s in spans)

        return {
            "task_id": task_id,
            "total_spans": len(spans),
            "total_duration_ms": round(total_duration, 2),
            "total_tokens_estimated": total_tokens,
            "spans": spans,
            "sentry_enabled": bool(settings.SENTRY_DSN),
        }
