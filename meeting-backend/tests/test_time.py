from app.utils.time import format_duration, format_timestamp


def test_format_duration_rounds_to_minutes():
    assert format_duration(61) == "1 min"
    assert format_duration(91) == "2 min"


def test_format_timestamp():
    assert format_timestamp(0) == "00:00"
    assert format_timestamp(125) == "02:05"

