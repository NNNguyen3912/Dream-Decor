
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { GoogleUser, signInWithGoogle, signOut, renderGoogleButton } from '../services/authService';

interface StartScreenProps {
  onStart: (loadSaved: boolean) => void;
  currentUser: GoogleUser | null;
  hasSavedProgress: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, currentUser, hasSavedProgress }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Render nút Google khi chưa đăng nhập
  useEffect(() => {
    if (!currentUser && googleButtonRef.current) {
      const timer = setTimeout(() => {
        if (googleButtonRef.current) {
          renderGoogleButton(googleButtonRef.current);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white font-sans p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="max-w-md w-full bg-slate-800 p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
        {/* Abstract blueprint lines decor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>

        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-black mb-1 text-sky-400 tracking-tight">
            Thiết Kế Nội Thất AI
          </h1>
          <p className="text-slate-400 mb-6 text-xs font-bold uppercase tracking-widest">
            Lập Kế Hoạch Studio Nội Thất
          </p>

          {/* Phần đăng nhập Google */}
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-700 mb-6">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.picture}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full border-2 border-sky-400"
                  />
                  <div className="text-left">
                    <p className="font-bold text-slate-200 text-sm">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="text-xs text-slate-400 hover:text-white transition-colors px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-slate-400">Đăng nhập để lưu tiến trình</p>
                <div ref={googleButtonRef} className="flex justify-center"></div>
              </div>
            )}
          </div>

          {/* Thông báo có tiến trình đã lưu */}
          {currentUser && hasSavedProgress && (
            <div className="bg-emerald-900/30 border border-emerald-700 p-3 rounded-xl mb-6 text-left">
              <p className="text-sm text-emerald-400 font-bold">Tiến trình đã lưu</p>
              <p className="text-xs text-emerald-600 mt-1">Bạn có tiến trình đã lưu trước đó.</p>
            </div>
          )}

          {/* Các nút hành động */}
          <div className="flex flex-col gap-3">
            {currentUser && hasSavedProgress && (
              <button
                onClick={() => onStart(true)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-lg"
              >
                Tiếp tục chơi
              </button>
            )}
            <button
              onClick={() => onStart(false)}
              className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 text-lg"
            >
              {hasSavedProgress ? 'Bắt đầu mới' : 'Bắt Đầu Thiết Kế'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
