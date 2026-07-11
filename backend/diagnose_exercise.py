"""
Diagnostic script: checks actual DB content for all exercise types,
prints repr() and byte-length of correct_answer strings,
and checks for Unicode normalization differences (NFC vs NFD).
"""
import sys
import unicodedata
sys.path.insert(0, '.')

from app.core.database import SessionLocal
from app.models.lesson import Exercise, ExerciseType, ExerciseOption

db = SessionLocal()

exercises = db.query(Exercise).all()

print("=" * 80)
print(f"Total exercises: {len(exercises)}")
print("=" * 80)

for ex in exercises:
    opts_correct = db.query(ExerciseOption).filter(
        ExerciseOption.exercise_id == ex.id,
        ExerciseOption.is_correct == True
    ).all()

    if ex.type == ExerciseType.translate:
        # translate: join ordered correct options by space
        opts_ordered = sorted(opts_correct, key=lambda o: o.order_index)
        correct_answer = " ".join(o.content for o in opts_ordered)
    elif ex.type in (ExerciseType.multiple_choice, ExerciseType.fill_blank, ExerciseType.type_answer):
        opt = opts_correct[0] if opts_correct else None
        correct_answer = opt.content if opt else "!!! NO CORRECT OPTION !!!"
    else:
        correct_answer = "(match_pairs — skip)"

    if ex.type == ExerciseType.match_pairs:
        continue

    nfc = unicodedata.normalize('NFC', correct_answer)
    nfd = unicodedata.normalize('NFD', correct_answer)

    normalized_mismatch = (nfc != nfd)

    # Check for invisible chars / smart quotes
    has_invisible = any(unicodedata.category(c) in ('Cf', 'Zs') and c != ' ' for c in correct_answer)
    has_smart_quotes = any(c in '\u2018\u2019\u201c\u201d' for c in correct_answer)

    flag = ""
    if not opts_correct:
        flag = "  *** NO CORRECT OPTION — ALWAYS WRONG ***"
    if normalized_mismatch:
        flag += "  *** NFD != NFC MISMATCH ***"
    if has_invisible:
        flag += "  *** INVISIBLE CHARS ***"
    if has_smart_quotes:
        flag += "  *** SMART QUOTES ***"

    print(f"[{ex.type.value:16s}] id={ex.id:3d}  correct_answer={repr(correct_answer)}")
    print(f"  bytes(UTF-8) len={len(correct_answer.encode('utf-8'))}  chars={len(correct_answer)}")
    print(f"  NFC repr   : {repr(nfc)}")
    print(f"  NFD repr   : {repr(nfd)}")
    if flag:
        print(f"  {flag}")
    print()

db.close()
print("Diagnosis complete.")
