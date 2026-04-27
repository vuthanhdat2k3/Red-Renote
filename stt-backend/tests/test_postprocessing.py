from app.services.postprocessing import TextPostProcessor


def test_process_adds_punctuation_and_capitalizes():
    processor = TextPostProcessor()
    result = processor.process("xin chào đây là biên bản cuộc họp", [])

    assert result["text"] == "Xin chào đây là biên bản cuộc họp."


def test_fix_vietnamese_errors():
    processor = TextPostProcessor()

    assert processor.fix_vietnamese_errors("toà nhà hoà bình") == "tòa nhà hòa bình"

