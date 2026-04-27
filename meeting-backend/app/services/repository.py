import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.orm import Session

from app.models.database import SessionLocal, ai_messages, meetings, tasks, transcript_items
from app.models.schemas import SegmentInput
from app.utils.time import format_duration, format_timestamp, now_utc

SPEAKER_COLORS = ["#E50914", "#005AAB", "#147A4D", "#8B0000", "#6B7280"]


class MeetingRepository:
    def session(self) -> Session:
        return SessionLocal()

    def create_from_transcript(
        self,
        *,
        title: str,
        owner_user_id: str,
        transcript: str,
        project: str,
        participants: int,
        tags: list[str],
        segments: list[SegmentInput],
        audio_url: str = "",
        duration_seconds: float = 0.0,
        status: str = "processing",
    ) -> dict[str, Any]:
        meeting_id = f"meeting-{uuid.uuid4()}"
        now = now_utc()
        if not segments and transcript.strip():
            segments = [SegmentInput(start=0, end=duration_seconds or 0, text=transcript.strip())]

        with self.session() as session:
            session.execute(
                insert(meetings).values(
                    id=meeting_id,
                    owner_user_id=owner_user_id,
                    title=title,
                    date=datetime.now().strftime("%b %-d, %Y"),
                    duration=format_duration(duration_seconds),
                    participants=max(1, participants),
                    project=project,
                    audio_url=audio_url,
                    summary="",
                    key_takeaways=[],
                    decisions=[],
                    risks=[],
                    follow_ups=[],
                    status=status,
                    tags=tags,
                    mindmap={"id": "node-root", "label": title, "type": "root", "children": []},
                    created_at=now,
                    updated_at=now,
                )
            )
            self.replace_transcript_items(session, meeting_id, segments)
            session.commit()
            return self.get(meeting_id, session=session)

    def replace_transcript_items(self, session: Session, meeting_id: str, segments: list[SegmentInput]) -> None:
        session.execute(delete(transcript_items).where(transcript_items.c.meeting_id == meeting_id))
        rows = []
        for index, segment in enumerate(segments, start=1):
            rows.append(
                {
                    "id": f"tr-{uuid.uuid4()}",
                    "meeting_id": meeting_id,
                    "position": index,
                    "speaker": segment.speaker or "Speaker",
                    "speaker_color": SPEAKER_COLORS[(index - 1) % len(SPEAKER_COLORS)],
                    "timestamp": format_timestamp(segment.start),
                    "text": segment.text,
                    "is_highlighted": False,
                }
            )
        if rows:
            session.execute(insert(transcript_items), rows)

    def get(self, meeting_id: str, session: Session | None = None) -> dict[str, Any]:
        owns_session = session is None
        session = session or self.session()
        try:
            row = session.execute(select(meetings).where(meetings.c.id == meeting_id)).mappings().first()
            if row is None:
                raise KeyError(meeting_id)
            return dict(row)
        finally:
            if owns_session:
                session.close()

    def get_transcript_text(self, meeting_id: str) -> str:
        with self.session() as session:
            rows = (
                session.execute(
                    select(transcript_items.c.text)
                    .where(transcript_items.c.meeting_id == meeting_id)
                    .order_by(transcript_items.c.position)
                )
                .scalars()
                .all()
            )
            return "\n".join(rows)

    def get_tasks(self, meeting_id: str) -> list[dict[str, Any]]:
        with self.session() as session:
            rows = (
                session.execute(select(tasks).where(tasks.c.meeting_id == meeting_id).order_by(tasks.c.created_at))
                .mappings()
                .all()
            )
            return [dict(row) for row in rows]

    def get_transcript_items(self, meeting_id: str) -> list[dict[str, Any]]:
        with self.session() as session:
            rows = (
                session.execute(
                    select(transcript_items)
                    .where(transcript_items.c.meeting_id == meeting_id)
                    .order_by(transcript_items.c.position)
                )
                .mappings()
                .all()
            )
            return [dict(row) for row in rows]

    def get_ai_messages(self, meeting_id: str) -> list[dict[str, Any]]:
        with self.session() as session:
            rows = (
                session.execute(
                    select(ai_messages).where(ai_messages.c.meeting_id == meeting_id).order_by(ai_messages.c.position)
                )
                .mappings()
                .all()
            )
            return [dict(row) for row in rows]

    def get_detail(self, meeting_id: str) -> dict[str, Any]:
        meeting = self.get(meeting_id)
        meeting["tasks"] = self.get_tasks(meeting_id)
        meeting["transcript"] = self.get_transcript_items(meeting_id)
        meeting["ai_messages"] = self.get_ai_messages(meeting_id)
        return meeting

    def update_llm_result(self, meeting_id: str, result: dict[str, Any]) -> dict[str, Any]:
        now = now_utc()
        with self.session() as session:
            session.execute(
                update(meetings)
                .where(meetings.c.id == meeting_id)
                .values(
                    summary=result.get("summary", ""),
                    key_takeaways=result.get("key_takeaways", [])[:12],
                    decisions=result.get("decisions", [])[:12],
                    risks=result.get("risks", [])[:12],
                    follow_ups=result.get("follow_ups", [])[:12],
                    tags=result.get("tags", [])[:12],
                    mindmap=result.get("mindmap") or {"id": "node-root", "label": "Meeting", "type": "root", "children": []},
                    status="completed",
                    updated_at=now,
                )
            )
            session.execute(delete(tasks).where(tasks.c.meeting_id == meeting_id))
            task_rows = []
            for item in result.get("tasks", [])[:30]:
                task_rows.append(
                    {
                        "id": f"task-{uuid.uuid4()}",
                        "meeting_id": meeting_id,
                        "title": item.get("title") or item.get("task") or "Follow up",
                        "owner": item.get("owner") or item.get("assignee") or "Unassigned",
                        "deadline": item.get("deadline") or "",
                        "status": "pending",
                        "source_timestamp": item.get("source_timestamp") or item.get("timestamp") or "00:00",
                        "created_at": now,
                    }
                )
            if task_rows:
                session.execute(insert(tasks), task_rows)
            session.commit()
            return self.get(meeting_id, session=session)

    def update_status(self, meeting_id: str, status: str) -> dict[str, Any]:
        now = now_utc()
        with self.session() as session:
            session.execute(
                update(meetings)
                .where(meetings.c.id == meeting_id)
                .values(status=status, updated_at=now)
            )
            session.commit()
            return self.get(meeting_id, session=session)

    def append_chat(self, meeting_id: str, role: str, content: str, refs: list[str] | None = None) -> None:
        now = now_utc()
        with self.session() as session:
            position = (
                session.execute(
                    select(func.count()).select_from(ai_messages).where(ai_messages.c.meeting_id == meeting_id)
                ).scalar_one()
                + 1
            )
            session.execute(
                insert(ai_messages).values(
                    id=f"msg-{uuid.uuid4()}",
                    meeting_id=meeting_id,
                    position=position,
                    role=role,
                    content=content,
                    timestamp_references=refs or [],
                    created_at=now,
                )
            )
            session.commit()

    def get_chat_history(self, meeting_id: str) -> list[dict[str, str]]:
        with self.session() as session:
            rows = (
                session.execute(
                    select(ai_messages.c.role, ai_messages.c.content)
                    .where(ai_messages.c.meeting_id == meeting_id)
                    .order_by(ai_messages.c.position)
                )
                .mappings()
                .all()
            )
            return [{"role": row["role"], "content": row["content"]} for row in rows]


meeting_repository = MeetingRepository()
