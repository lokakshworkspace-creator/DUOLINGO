import { UserProfile, Unit, SkillDetail, LessonStartResponse, ExerciseCheckResponse, LessonCompleteResponse, Quest, ShopItem, ClaimResponse, PurchaseResponse, Settings, UserAchievement } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
    let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string> || {}),
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers, cache: 'no-store' });
    
    if (!response.ok) {
        if (response.status === 401 && token) {
            localStorage.removeItem('token');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            // Throw so no downstream code runs on a stale/redirected session
            throw new Error('Session expired. Please log in again.');
        }

        let detailMessage = `Request failed (${response.status})`;
        try {
            const errData = await response.json();
            if (errData && typeof errData.detail === 'string') {
                detailMessage = errData.detail;
            } else if (errData && errData.detail) {
                detailMessage = JSON.stringify(errData.detail);
            }
        } catch (e) {
            // fallback
        }
        throw new Error(detailMessage);
    }
    
    return response;
}

export async function fetchProfile(): Promise<UserProfile> {
    const res = await fetchWithAuth(`${API_BASE}/profile`);
    return res.json();
}

export async function fetchPath(): Promise<{ units: Unit[] }> {
    const res = await fetchWithAuth(`${API_BASE}/path`);
    return res.json();
}

export async function fetchSkill(skillId: number): Promise<SkillDetail> {
    const res = await fetchWithAuth(`${API_BASE}/skills/${skillId}`);
    return res.json();
}

export async function startLesson(skillId: number): Promise<LessonStartResponse> {
    const res = await fetchWithAuth(`${API_BASE}/lesson/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId })
    });
    return res.json();
}

export async function checkExercise(attemptId: number, exerciseId: number, answer: string): Promise<ExerciseCheckResponse> {
    const res = await fetchWithAuth(`${API_BASE}/exercise/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt_id: attemptId, exercise_id: exerciseId, answer })
    });
    return res.json();
}

export async function completeLesson(attemptId: number): Promise<LessonCompleteResponse> {
    const res = await fetchWithAuth(`${API_BASE}/lesson/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attempt_id: attemptId })
    });
    return res.json();
}

export async function startLegendary(skillId: number): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/legendary/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_id: skillId })
    });
    return res.json();
}

export async function checkLegendary(sessionId: number, exerciseId: number, answer: string): Promise<ExerciseCheckResponse> {
    const res = await fetchWithAuth(`${API_BASE}/legendary/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, exercise_id: exerciseId, answer })
    });
    return res.json();
}

export async function completeLegendary(sessionId: number, correctCount: number, wrongCount: number): Promise<any> {
    const res = await fetchWithAuth(`${API_BASE}/legendary/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, correct_count: correctCount, wrong_count: wrongCount })
    });
    return res.json();
}

export async function jumpToSkill(skillId: number): Promise<{message: string}> {
    const res = await fetchWithAuth(`${API_BASE}/skills/${skillId}/jump`, { method: 'POST' });
    return res.json();
}

export async function refillHearts(): Promise<{ hearts_current: number }> {
    const res = await fetchWithAuth(`${API_BASE}/hearts/refill`, { method: 'POST' });
    return res.json();
}

export async function fetchLeaderboard(): Promise<UserProfile[]> {
    const res = await fetchWithAuth(`${API_BASE}/leaderboard`);
    return res.json();
}

export async function fetchQuests(): Promise<Quest[]> {
    const res = await fetchWithAuth(`${API_BASE}/quests`);
    return res.json();
}

export async function claimQuest(questId: number): Promise<ClaimResponse> {
    const res = await fetchWithAuth(`${API_BASE}/quests/${questId}/claim`, { method: 'POST' });
    return res.json();
}

export async function fetchShopItems(): Promise<ShopItem[]> {
    const res = await fetchWithAuth(`${API_BASE}/shop/items`);
    return res.json();
}

export async function purchaseItem(itemId: number): Promise<PurchaseResponse> {
    const res = await fetchWithAuth(`${API_BASE}/shop/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId })
    });
    return res.json();
}

export async function refillHeartsGems(): Promise<{ hearts_current: number }> {
    const res = await fetchWithAuth(`${API_BASE}/hearts/refill-gems`, { method: 'POST' });
    return res.json();
}

export async function fetchSettings(): Promise<Settings> {
    const res = await fetchWithAuth(`${API_BASE}/settings`);
    return res.json();
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
    const res = await fetchWithAuth(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function fetchAchievements(): Promise<any[]> {
    const res = await fetchWithAuth(`${API_BASE}/achievements`);
    return res.json();
}

// Authentication API
export async function login(data: any): Promise<{ access_token: string }> {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });
    if (!res.ok) {
        let detailMessage = 'Login failed';
        try {
            const err = await res.json();
            if (err.detail) detailMessage = err.detail;
        } catch (e) {}
        throw new Error(detailMessage);
    }
    return res.json();
}

export async function register(data: any): Promise<{ access_token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        let detailMessage = 'Registration failed';
        try {
            const err = await res.json();
            if (err.detail) detailMessage = err.detail;
        } catch (e) {}
        throw new Error(detailMessage);
    }
    return res.json();
}

export async function fetchMe(): Promise<UserProfile> {
    const res = await fetchWithAuth(`${API_BASE}/auth/me`);
    return res.json();
}

export async function fetchGuidebook(skillId: number): Promise<import('./types').Guidebook> {
    const res = await fetchWithAuth(`${API_BASE}/guidebooks/${skillId}`);
    return res.json();
}

export async function fetchUnitGuidebook(unitId: number): Promise<import('./types').Guidebook> {
    const res = await fetchWithAuth(`${API_BASE}/units/${unitId}/guidebook`);
    return res.json();
}
