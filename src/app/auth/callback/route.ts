import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSafeAuthRedirectPath } from '@/lib/auth-redirect';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = getSafeAuthRedirectPath(requestUrl.searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL('/admin/login?error=recovery', requestUrl.origin));
}
