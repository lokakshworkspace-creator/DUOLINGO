from sqlalchemy.orm import Session
from datetime import datetime, date, timezone
from app.models.progress import Quest, UserQuest, QuestType


def _utc_today() -> date:
    """Return today's date in UTC, consistently."""
    return datetime.now(timezone.utc).date()


def assign_daily_quests(db: Session, user_id: int):
    """Assign today's quests if not already assigned. Uses UTC dates consistently."""
    today = _utc_today()

    # Check if any quests are already assigned for today (UTC)
    existing = db.query(UserQuest).filter(UserQuest.user_id == user_id).all()
    today_quests = [
        uq for uq in existing
        if uq.assigned_date and uq.assigned_date.replace(tzinfo=timezone.utc).date() == today
    ]
    if today_quests:
        return today_quests

    # Assign all daily quests for today
    quests = db.query(Quest).filter(Quest.is_daily == True).all()
    new_user_quests = []
    now_utc = datetime.now(timezone.utc).replace(tzinfo=None)  # store as naive UTC
    for q in quests:
        uq = UserQuest(
            user_id=user_id, quest_id=q.id,
            progress=0, completed=False, claimed=False,
            assigned_date=now_utc
        )
        db.add(uq)
        new_user_quests.append(uq)
    db.commit()
    for uq in new_user_quests:
        db.refresh(uq)
    return new_user_quests


def get_user_quests(db: Session, user_id: int):
    """Get today's quests for user, assigning if needed. Deduplicates if necessary."""
    today = _utc_today()
    existing = db.query(UserQuest).filter(UserQuest.user_id == user_id).all()
    today_quests = [
        uq for uq in existing
        if uq.assigned_date and uq.assigned_date.replace(tzinfo=timezone.utc).date() == today
    ]

    # Deduplicate if race condition created multiple
    seen_quest_ids = set()
    deduped = []
    to_delete = []
    for uq in today_quests:
        if uq.quest_id in seen_quest_ids:
            to_delete.append(uq)
        else:
            seen_quest_ids.add(uq.quest_id)
            deduped.append(uq)
            
    if to_delete:
        for uq in to_delete:
            db.delete(uq)
        db.commit()
        today_quests = deduped

    if not today_quests:
        today_quests = assign_daily_quests(db, user_id)

    for uq in today_quests:
        db.refresh(uq)
    return today_quests


def update_quest_progress(db: Session, user_id: int, event_type: str, amount: int = 1):
    """Update quest progress after a game event.
    event_type: 'xp_earned', 'lesson_completed', 'perfect_lesson', 'practice_lesson'
    """
    today = _utc_today()
    user_quests = db.query(UserQuest).filter(UserQuest.user_id == user_id).all()
    today_quests = [
        uq for uq in user_quests
        if uq.assigned_date
        and uq.assigned_date.replace(tzinfo=timezone.utc).date() == today
        and not uq.claimed
    ]

    type_map = {
        'xp_earned': QuestType.earn_xp,
        'lesson_completed': QuestType.complete_lessons,
        'perfect_lesson': QuestType.perfect_lesson,
        'practice_lesson': QuestType.practice_lesson,
    }

    target_type = type_map.get(event_type)
    if not target_type:
        return

    for uq in today_quests:
        quest = db.query(Quest).filter(Quest.id == uq.quest_id).first()
        if quest and quest.type == target_type:
            uq.progress = min(uq.progress + amount, quest.target_value)
            if uq.progress >= quest.target_value:
                uq.completed = True

    db.commit()


def claim_quest_reward(db: Session, user_id: int, user_quest_id: int):
    """Claim reward for a completed quest. Returns (rewards_dict, error_str)."""
    uq = db.query(UserQuest).filter(
        UserQuest.id == user_quest_id,
        UserQuest.user_id == user_id
    ).first()

    if not uq:
        return None, "Quest not found"
    if not uq.completed:
        return None, "Quest not yet completed"
    if uq.claimed:
        return None, "Quest already claimed"

    quest = db.query(Quest).filter(Quest.id == uq.quest_id).first()
    if not quest:
        return None, "Quest definition not found"

    uq.claimed = True

    # Award rewards
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    xp_gained = quest.xp_reward
    gems_gained = quest.gem_reward

    if xp_gained > 0:
        user.xp_total += xp_gained
        from app.models.progress import XPHistory, XPSource
        db.add(XPHistory(
            user_id=user_id,
            amount=xp_gained,
            source=XPSource.achievement,
            created_at=datetime.now(timezone.utc).replace(tzinfo=None)
        ))
    if gems_gained > 0:
        user.gems += gems_gained

    db.commit()
    return {"xp_gained": xp_gained, "gems_gained": gems_gained}, None
