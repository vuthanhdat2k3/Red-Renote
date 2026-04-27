from app.services.audio_processor import AudioProcessor


def test_chunk_audio_for_streaming_uses_overlap():
    audio = b"abcdef"
    chunks = AudioProcessor.chunk_audio_for_streaming(
        audio,
        chunk_size_ms=3,
        overlap_ms=1,
        sample_rate=10,
        sample_width=100,
    )

    assert chunks == [b"abc", b"cde", b"ef"]
