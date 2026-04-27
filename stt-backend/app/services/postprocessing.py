import re
from typing import Any


class TextPostProcessor:
    VIETNAMESE_FIXES = {
        "hoà": "hòa",
        "goá": "góa",
        "loà": "lòa",
        "ngoà": "ngòa",
        "toà": "tòa",
        "xoà": "xòa",
        "thuỷ": "thủy",
        "uỷ": "ủy",
        "quí": "quý",
    }

    def __init__(self, use_llm: bool = False):
        self.use_llm = use_llm

    def add_punctuation(self, text: str) -> str:
        text = re.sub(r"\s+", " ", text).strip()
        if not text:
            return text
        if text[-1] not in ".!?":
            text += "."
        return text

    def capitalize(self, text: str) -> str:
        def repl(match: re.Match[str]) -> str:
            return match.group(1) + match.group(2).upper()

        text = text[:1].upper() + text[1:] if text else text
        return re.sub(r"(^|[.!?]\s+)([a-zà-ỹ])", repl, text)

    def fix_vietnamese_errors(self, text: str) -> str:
        for wrong, right in self.VIETNAMESE_FIXES.items():
            text = re.sub(rf"\b{wrong}\b", right, text, flags=re.IGNORECASE)
        return text

    async def refine_with_llm(self, text: str) -> str:
        return text

    def process(self, text: str, segments: list[dict[str, Any]]) -> dict[str, Any]:
        processed = self.fix_vietnamese_errors(text)
        processed = self.add_punctuation(processed)
        processed = self.capitalize(processed)
        return {"text": processed, "segments": segments}

