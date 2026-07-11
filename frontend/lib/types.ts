export interface UserProfile {
    id: number;
    username: string;
    display_name: string;
    avatar_url: string | null;
    hearts_current: number;
    hearts_max: number;
    xp_total: number;
    gems: number;
    streak_current: number;
    streak_longest: number;
    daily_goal_xp: number;
    completed_lessons: number;
    completed_skills: number;
    daily_xp_earned: number;
    settings?: Settings;
    achievements?: UserAchievement[];
}

export interface Settings {
    sound_enabled: boolean;
    dark_mode: boolean;
    daily_goal_xp: number;
    notifications_enabled: boolean;
}

export interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: string;
    criteria_type: string;
    criteria_value: number;
}

export interface UserAchievement {
    id: number;
    achievement_id: number;
    unlocked_at: string;
    achievement: Achievement;
}

export interface Quest {
    id: number;
    quest_id: number;
    title: string;
    description: string;
    icon: string;
    target_value: number;
    progress: number;
    completed: boolean;
    claimed: boolean;
    xp_reward: number;
    gem_reward: number;
}

export interface ShopItem {
    id: number;
    name: string;
    description: string;
    type: string;
    cost_gems: number;
    icon: string;
}

export interface ClaimResponse {
    success: boolean;
    message: string;
    xp_gained: number;
    gems_gained: number;
}

export interface PurchaseResponse {
    success: boolean;
    message: string;
    gems_remaining: number;
    hearts_current: number;
}

export interface Unit {
    id: number;
    title: string;
    order_index: number;
    color_theme: string;
    skills: Skill[];
}

export interface Skill {
    id: number;
    title: string;
    icon: string;
    order_index: number;
    required_skill_id: number | null;
    status: 'locked' | 'available' | 'completed' | null;
    progress_percent: number;
    crown_level: number;
    is_legendary?: boolean;
}

export interface LessonBase {
    id: number;
    order_index: number;
    xp_reward: number;
    difficulty: number;
}

export interface SkillDetail extends Skill {
    lessons: LessonBase[];
}

export interface ExerciseOption {
    id: number;
    content: string;
    order_index: number | null;
    pair_key: string | null;
}

export interface Exercise {
    id: number;
    type: 'multiple_choice' | 'translate' | 'match_pairs' | 'fill_blank' | 'type_answer';
    prompt: string;
    order_index: number;
    options: ExerciseOption[];
}

export interface LessonStartResponse {
    attempt_id: number;
    exercises: Exercise[];
}

export interface ExerciseCheckResponse {
    correct: boolean;
    retry?: boolean;
    correct_answer: string;
    xp_delta: number;
    hearts_remaining: number;
}

export interface LessonCompleteResponse {
    xp_earned: number;
    streak_updated: boolean;
    new_streak: number;
    hearts_remaining: number;
}

export interface GuidebookSection {
    id: number;
    order_index: number;
    heading: string;
    body_text: string;
    example_sentence: string | null;
    example_translation: string | null;
}

export interface GuidebookExerciseOption {
    id: number;
    content: string;
    is_correct: boolean;
    pair_key: string | null;
    order_index: number | null;
}

export interface GuidebookExercise {
    id: number;
    type: string;
    prompt: string;
    order_index: number;
    options: GuidebookExerciseOption[];
}

export interface GuidebookLesson {
    id: number;
    order_index: number;
    xp_reward: number;
    exercises: GuidebookExercise[];
}

export interface GuidebookSkill {
    id: number;
    title: string;
    icon: string;
    order_index: number;
    lessons: GuidebookLesson[];
}

export interface Guidebook {
    id: number;
    skill_id: number;
    title: string;
    summary: string;
    sections: GuidebookSection[];
    skills: GuidebookSkill[];
}
