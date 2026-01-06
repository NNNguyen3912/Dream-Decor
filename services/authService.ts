/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Type definitions cho Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                    }) => void;
                    prompt: () => void;
                    renderButton: (
                        element: HTMLElement,
                        options: {
                            theme?: 'outline' | 'filled_blue' | 'filled_black';
                            size?: 'large' | 'medium' | 'small';
                            type?: 'standard' | 'icon';
                            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
                            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
                            logo_alignment?: 'left' | 'center';
                            width?: number;
                            locale?: string;
                        }
                    ) => void;
                    disableAutoSelect: () => void;
                    revoke: (email: string, callback: () => void) => void;
                };
            };
        };
    }
}

export interface GoogleUser {
    email: string;
    name: string;
    picture: string;
    sub: string; // Google user ID
}

// Decode JWT token từ Google
const decodeJwt = (token: string): GoogleUser | null => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error('Lỗi decode JWT:', e);
        return null;
    }
};

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

let currentUser: GoogleUser | null = null;
let onUserChangeCallback: ((user: GoogleUser | null) => void) | null = null;

// Khởi tạo Google Identity Services
export const initGoogleAuth = (onUserChange: (user: GoogleUser | null) => void): void => {
    onUserChangeCallback = onUserChange;

    // Kiểm tra user đã lưu trong localStorage
    const savedUser = localStorage.getItem('google_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            onUserChange(currentUser);
        } catch (e) {
            localStorage.removeItem('google_user');
        }
    }

    // Chờ Google script load
    const checkGoogle = setInterval(() => {
        if (window.google?.accounts?.id) {
            clearInterval(checkGoogle);
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: true,
            });
        }
    }, 100);
};

// Xử lý response từ Google
const handleCredentialResponse = (response: { credential: string }): void => {
    const user = decodeJwt(response.credential);
    if (user) {
        currentUser = user;
        localStorage.setItem('google_user', JSON.stringify(user));
        onUserChangeCallback?.(user);
    }
};

// Hiển thị popup đăng nhập
export const signInWithGoogle = (): void => {
    if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
    } else {
        console.error('Google Identity Services chưa sẵn sàng');
    }
};

// Render nút đăng nhập Google
export const renderGoogleButton = (element: HTMLElement): void => {
    if (window.google?.accounts?.id) {
        window.google.accounts.id.renderButton(element, {
            theme: 'filled_blue',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'pill',
            locale: 'vi_VN',
        });
    }
};

// Đăng xuất
export const signOut = (): void => {
    if (currentUser && window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
    }
    currentUser = null;
    localStorage.removeItem('google_user');
    onUserChangeCallback?.(null);
};

// Lấy user hiện tại
export const getCurrentUser = (): GoogleUser | null => {
    return currentUser;
};
