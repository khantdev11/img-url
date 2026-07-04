import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
    const slug = request.nextUrl.pathname.replace('/', '');
    if (!slug || slug === 'api' || slug.includes('.')) return NextResponse.next();

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const { data } = await supabase.from('links').select('original_url').eq('slug', slug).single();

    if (data) {
        return NextResponse.redirect(new URL(data.original_url));
    }
    return NextResponse.next();
}