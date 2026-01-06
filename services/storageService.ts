/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Grid, HomeStats, AIDesignGoal, FurnitureType } from '../types';

export interface GameSaveData {
    grid: Grid;
    stats: HomeStats;
    currentGoal: AIDesignGoal | null;
    selectedTool: FurnitureType;
    savedAt: number; // timestamp
}

const STORAGE_PREFIX = 'dream_decor_';

// Tạo key lưu trữ dựa trên email người dùng
const getStorageKey = (email: string): string => {
    return `${STORAGE_PREFIX}${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
};

// Lưu tiến trình chơi
export const saveGameProgress = (email: string, data: Omit<GameSaveData, 'savedAt'>): void => {
    try {
        const saveData: GameSaveData = {
            ...data,
            savedAt: Date.now(),
        };
        const key = getStorageKey(email);
        localStorage.setItem(key, JSON.stringify(saveData));
        console.log('Đã lưu tiến trình cho:', email);
    } catch (e) {
        console.error('Lỗi khi lưu tiến trình:', e);
    }
};

// Tải tiến trình chơi
export const loadGameProgress = (email: string): GameSaveData | null => {
    try {
        const key = getStorageKey(email);
        const data = localStorage.getItem(key);
        if (data) {
            const parsed = JSON.parse(data) as GameSaveData;
            console.log('Đã tải tiến trình cho:', email, 'Lưu lúc:', new Date(parsed.savedAt).toLocaleString('vi-VN'));
            return parsed;
        }
    } catch (e) {
        console.error('Lỗi khi tải tiến trình:', e);
    }
    return null;
};

// Xóa tiến trình chơi
export const deleteGameProgress = (email: string): void => {
    try {
        const key = getStorageKey(email);
        localStorage.removeItem(key);
        console.log('Đã xóa tiến trình cho:', email);
    } catch (e) {
        console.error('Lỗi khi xóa tiến trình:', e);
    }
};

// Kiểm tra có tiến trình đã lưu không
export const hasGameProgress = (email: string): boolean => {
    const key = getStorageKey(email);
    return localStorage.getItem(key) !== null;
};
