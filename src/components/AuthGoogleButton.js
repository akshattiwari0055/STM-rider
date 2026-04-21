"use client";

import { useGoogleLogin } from '@react-oauth/google';

export default function AuthGoogleButton({
  enabled,
  loading,
  mode = 'signin',
  onSuccess,
  onError,
}) {
  const label = mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google';

  const login = useGoogleLogin({
    onSuccess,
    onError,
    flow: 'auth-code', // or 'implicit' — match whatever you were using before
  });

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-center text-sm text-gray-500">
        Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to enable Google authentication.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => login()}
        className="w-full rounded-full border border-black/35 bg-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
      >
        <div className="flex items-center justify-center gap-4 px-6 py-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.31 2.57c1.93-1.78 3.04-4.4 3.04-7.51 0-.72-.07-1.41-.19-2.08z"/>
              <path fill="#34A853" d="M12 22c2.76 0 5.08-.91 6.77-2.47l-3.31-2.57c-.92.62-2.09.99-3.46.99-2.66 0-4.91-1.79-5.72-4.19l-3.42 2.64A10.23 10.23 0 0 0 12 22"/>
              <path fill="#4A90E2" d="M6.28 13.76A6.15 6.15 0 0 1 5.96 12c0-.61.11-1.2.32-1.76L2.86 7.6A10.23 10.23 0 0 0 1.8 12c0 1.64.39 3.19 1.06 4.4z"/>
              <path fill="#FBBC05" d="M12 6.05c1.5 0 2.85.52 3.91 1.54l2.93-2.93C17.07 2.96 14.76 2 12 2 7.95 2 4.46 4.3 2.86 7.6l3.42 2.64C7.09 7.84 9.34 6.05 12 6.05"/>
            </svg>
          </div>
          <span className="text-[1.05rem] font-semibold text-[#1f1f1f]">{label}</span>
        </div>
      </button>

      {loading && (
        <p className="text-center text-sm text-gray-400">Finishing Google authentication...</p>
      )}
    </div>
  );
}