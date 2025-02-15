import { AVATAR_BASE_URL } from '@/api/config';

export function getAvatarUrl(avatarName) {
    if (!avatarName) {
        return `${AVATAR_BASE_URL}/default-avatar.png`;
    }
    if (avatarName.startsWith('http')) {
        return avatarName;
    }
    return `${AVATAR_BASE_URL}/${avatarName}`;
} 