"use client";

import { GoogleLogin } from '@react-oauth/google';

export default function AuthGoogleButton({
  enabled,
  loading,
  mode = 'signin',
  onSuccess,
  onError,
}) {
  const text = mode === 'signup' ? 'signup_with' : 'signin_with';

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-center text-sm text-gray-500">
        Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to enable Google authentication.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="google-auth-shell flex w-full justify-center overflow-hidden rounded-full border border-black/30 bg-white px-2 py-2 shadow-[0_14px_30px_rgba(0,0,0,0.18)]">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          theme="outline"
          shape="pill"
          size="large"
          text={text}
          width="100%"
          logo_alignment="left"
        />
      </div>

      {loading && (
        <p className="text-center text-sm text-gray-400">Finishing Google authentication...</p>
      )}
    </div>
  );
}
