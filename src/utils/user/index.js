import { API_BASE_URL } from '@/api/config';

const AVATAR_BASE_URL = `${API_BASE_URL}/static/img/avatar`;

export function getAvatarUrl(avatarName) {
    if (!avatarName) {
        return `${API_BASE_URL}/static/img/default-avatar.png`;
    }
    if (avatarName.startsWith('http')) {
        return avatarName;
    }
    return `${AVATAR_BASE_URL}/${avatarName}`;
} 