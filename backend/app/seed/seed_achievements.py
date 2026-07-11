import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from app.core.database import SessionLocal
from app.models.user import Achievement, CriteriaType

def run():
    db = SessionLocal()
    try:
        # Update existing 5 achievements with rewards
        existing_rewards = {
            "First Steps": {"xp_reward": 10, "gem_reward": 5},
            "Scholar": {"xp_reward": 20, "gem_reward": 10},
            "Champion": {"xp_reward": 50, "gem_reward": 25},
            "Weekend Warrior": {"xp_reward": 20, "gem_reward": 10},
            "Unstoppable": {"xp_reward": 50, "gem_reward": 25},
        }

        for title, rewards in existing_rewards.items():
            ach = db.query(Achievement).filter(Achievement.title == title).first()
            if ach:
                ach.xp_reward = rewards["xp_reward"]
                ach.gem_reward = rewards["gem_reward"]

        # 6 New achievements (Wait, there are 7 in the list below, let me keep them all to be complete)
        new_achievements = [
            {
                "title": "Flawless",
                "description": "Complete a perfect lesson",
                "icon": "🎯",
                "criteria_type": CriteriaType.perfect_lessons,
                "criteria_value": 1,
                "xp_reward": 20,
                "gem_reward": 10
            },
            {
                "title": "Legend",
                "description": "Earn 1000 XP",
                "icon": "👑",
                "criteria_type": CriteriaType.xp_total,
                "criteria_value": 1000,
                "xp_reward": 100,
                "gem_reward": 50
            },
            {
                "title": "Monthly Master",
                "description": "Reach a 30 day streak",
                "icon": "📅",
                "criteria_type": CriteriaType.streak,
                "criteria_value": 30,
                "xp_reward": 150,
                "gem_reward": 75
            },
            {
                "title": "Unit Champion",
                "description": "Complete your first unit",
                "icon": "🏅",
                "criteria_type": CriteriaType.units_completed,
                "criteria_value": 1,
                "xp_reward": 50,
                "gem_reward": 25
            },
            {
                "title": "Course Conqueror",
                "description": "Complete a full course",
                "icon": "🎓",
                "criteria_type": CriteriaType.courses_completed,
                "criteria_value": 1,
                "xp_reward": 500,
                "gem_reward": 250
            },
            {
                "title": "Careful Learner",
                "description": "Finish a lesson without losing hearts",
                "icon": "🛡️",
                "criteria_type": CriteriaType.no_heart_loss_lessons,
                "criteria_value": 1,
                "xp_reward": 15,
                "gem_reward": 10
            },
            {
                "title": "Legendary Master",
                "description": "Complete a legendary challenge",
                "icon": "🦅",
                "criteria_type": CriteriaType.legendary_completed,
                "criteria_value": 1,
                "xp_reward": 100,
                "gem_reward": 50
            }
        ]

        for ach_data in new_achievements:
            ach = db.query(Achievement).filter(Achievement.title == ach_data["title"]).first()
            if not ach:
                new_ach = Achievement(**ach_data)
                db.add(new_ach)
            else:
                for k, v in ach_data.items():
                    setattr(ach, k, v)

        db.commit()
        print("Achievements backfilled successfully.")
    except Exception as e:
        print(f"Error backfilling achievements: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    run()
