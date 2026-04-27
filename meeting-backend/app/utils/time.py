from datetime import datetime, timezone


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def format_duration(seconds: float | int | None) -> str:
    if not seconds:
        return "0 min"
    minutes = max(1, round(float(seconds) / 60))
    return f"{minutes} min"


def format_timestamp(seconds: float | int | None) -> str:
    total = max(0, int(seconds or 0))
    minutes = total // 60
    secs = total % 60
    return f"{minutes:02d}:{secs:02d}"

