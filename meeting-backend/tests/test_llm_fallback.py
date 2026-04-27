from app.services.llm import LLMService


def test_fallback_analysis_without_api_key():
    service = LLMService()
    service._api_key = None

    result = service.analyze_meeting("Cả nhóm thống nhất hoàn thiện API.", "Standup")

    assert result["summary"] == "Cả nhóm thống nhất hoàn thiện API."
    assert result["mindmap"]["label"] == "Standup"

