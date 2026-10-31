import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default environment values or runtime overrides
const STORAGE_KEY_URL = 'brightloop_supabase_url';
const STORAGE_KEY_ANON = 'brightloop_supabase_anon_key';

// Fallback dummy URL & dummy key to prevent createClient throwing on unconfigured load
const DUMMY_URL = 'https://placeholder-brightloop.supabase.co';
const DUMMY_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

/**
 * Validates that a string is a well-formed HTTP/HTTPS URL
 */
export function isValidSupabaseUrl(candidate?: string | null): boolean {
  if (!candidate || typeof candidate !== 'string') return false;
  const trimmed = candidate.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  try {
    const parsed = new URL(trimmed);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function getSupabaseCredentials(): {
  url: string;
  anonKey: string;
  isConfigured: boolean;
  urlIsKey: boolean;
  rawUrl: string;
} {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

  const storedUrl = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_URL) || '').trim() : '';
  const storedKey = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY_ANON) || '').trim() : '';

  const rawUrl = storedUrl || envUrl || '';
  const rawAnonKey = storedKey || envKey || '';

  // Auto-normalize "xyz.supabase.co" to "https://xyz.supabase.co"
  let normalizedUrl = rawUrl;
  if (normalizedUrl && !/^https?:\/\//i.test(normalizedUrl) && normalizedUrl.includes('.supabase.co')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Detect if the user mistakenly put their publishable or secret key into the URL slot
  const urlIsKey =
    rawUrl.startsWith('sb_publishable_') ||
    rawUrl.startsWith('sb_secret_') ||
    rawUrl.startsWith('eyJ');

  const isValidUrl = isValidSupabaseUrl(normalizedUrl);

  const isConfigured = Boolean(
    !urlIsKey &&
    isValidUrl &&
    rawAnonKey &&
    !normalizedUrl.includes('your-project-id') &&
    !normalizedUrl.includes('placeholder-brightloop') &&
    !rawAnonKey.includes('your-supabase-anon')
  );

  return {
    url: isValidUrl ? normalizedUrl : '',
    anonKey: rawAnonKey,
    isConfigured,
    urlIsKey,
    rawUrl,
  };
}

export function saveRuntimeSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    let cleanUrl = url.trim();
    if (cleanUrl && !/^https?:\/\//i.test(cleanUrl) && cleanUrl.includes('.supabase.co')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    if (cleanUrl) localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);

    // Reinitialize client
    reinitializeSupabaseClient();
  }
}

let currentClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!currentClient) {
    const creds = getSupabaseCredentials();

    const effectiveUrl = creds.isConfigured && isValidSupabaseUrl(creds.url)
      ? creds.url
      : DUMMY_URL;

    const effectiveKey = creds.isConfigured && creds.anonKey
      ? creds.anonKey
      : DUMMY_ANON;

    try {
      currentClient = createClient(effectiveUrl, effectiveKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client with configured URL, using fallback dummy client:', err);
      try {
        currentClient = createClient(DUMMY_URL, DUMMY_ANON, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
      } catch (fatalErr) {
        console.error('Fatal createClient error:', fatalErr);
      }
    }
  }
  return currentClient!;
}

export function reinitializeSupabaseClient(): SupabaseClient {
  currentClient = null;
  return getSupabase();
}

// Export singleton instance safe against runtime exceptions
export const supabase = getSupabase();

/**
 * Live connection test with detailed diagnostic messages
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tablesFound?: string[];
  error?: string;
}> {
  const creds = getSupabaseCredentials();

  if (creds.urlIsKey) {
    return {
      connected: false,
      message: `Your VITE_SUPABASE_URL contains an API key ("${creds.rawUrl.slice(0, 18)}...") instead of your Project URL. A Supabase Project URL looks like "https://<your-project-id>.supabase.co".`,
      error: 'Invalid supabaseUrl: API key provided instead of HTTP/HTTPS URL',
    };
  }

  if (!creds.isConfigured) {
    return {
      connected: false,
      message: 'Supabase credentials not configured or incomplete. Please provide a valid project URL (https://xyz.supabase.co) and publishable anon key.',
    };
  }

  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('plans')
      .select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'Successfully reached Supabase project! The tables have not been created yet — run supabase_schema.sql in the Supabase SQL Editor.',
          error: error.message,
        };
      }
      return {
        connected: false,
        message: `Connection error from Supabase: ${error.message} (Code: ${error.code || 'unknown'})`,
        error: error.message,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to live Supabase PostgreSQL database!',
    };
  } catch (err: any) {
    return {
      connected: false,
      message: err.message || 'Failed to reach Supabase endpoint.',
      error: String(err),
    };
  }
}
