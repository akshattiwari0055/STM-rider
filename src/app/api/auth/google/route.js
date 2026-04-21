import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/db';
import { User } from '@/models/User';
import { createUserToken, setAuthCookie } from '@/lib/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request) {
  try {
    const { credential } = await request.json();

    if (!process.env.GOOGLE_CLIENT_ID) {
      return NextResponse.json({ error: 'Google auth is not configured yet.' }, { status: 500 });
    }

    if (!credential) {
      return NextResponse.json({ error: 'Google credential is required.' }, { status: 400 });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      return NextResponse.json({ error: 'Unable to verify Google account.' }, { status: 400 });
    }

    await connectDB();

    const normalizedEmail = payload.email.toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        name: payload.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        authProvider: 'google',
        googleId: payload.sub,
        avatar: payload.picture || null,
        isEmailVerified: true,
      });
    } else {
      user.authProvider = user.authProvider || 'google';
      user.googleId = payload.sub;
      user.avatar = payload.picture || user.avatar;
      user.isEmailVerified = true;
      await user.save();
    }

    const token = await createUserToken(user);
    const response = NextResponse.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });

    return setAuthCookie(response, token);
  } catch (error) {
    return NextResponse.json({ error: 'Google sign-in failed. Please try again.' }, { status: 500 });
  }
}
