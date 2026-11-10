import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY = 'triskell_supabase_config';

export const DEFAULT_SUPABASE_CONFIG = {
  url: 'https://qlpuwpktenwmptpnlusu.supabase.co',
  anonKey: 'sb_publishable_RAyfFJ0HivXJMr4quVilow_97KJWY3L'
};

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isEnabled: boolean;
}

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || DEFAULT_SUPABASE_CONFIG.url,
        anonKey: parsed.anonKey || DEFAULT_SUPABASE_CONFIG.anonKey,
        isEnabled: parsed.isEnabled !== undefined ? parsed.isEnabled : false
      };
    }
  } catch (e) {
    console.error('Error reading supabase config:', e);
  }
  return {
    url: DEFAULT_SUPABASE_CONFIG.url,
    anonKey: DEFAULT_SUPABASE_CONFIG.anonKey,
    isEnabled: false // Default to local for zero friction, user can enable anytime
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  const cfg = config || getStoredSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) return null;

  try {
    if (!supabaseInstance || config) {
      supabaseInstance = createClient(cfg.url, cfg.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
    }
    return supabaseInstance;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url: string, anonKey: string): Promise<{
  success: boolean;
  status: 'connected' | 'auth_required' | 'error';
  message: string;
}> {
  try {
    const client = createClient(url, anonKey);
    const { data, error } = await client.from('teachers').select('*').limit(1);

    if (!error) {
      return {
        success: true,
        status: 'connected',
        message: 'Conexión establecida con éxito con Supabase.'
      };
    }

    if (error.code === '42501' || error.message.includes('permission denied')) {
      return {
        success: true,
        status: 'auth_required',
        message: 'Conectado con el servidor de Supabase. RLS (Row Level Security) requiere iniciar sesión o habilitar permisos anon.'
      };
    }

    return {
      success: false,
      status: 'error',
      message: `Error de Supabase: ${error.message} (Código ${error.code})`
    };
  } catch (e: any) {
    return {
      success: false,
      status: 'error',
      message: `No se pudo conectar: ${e?.message || 'URL inválida'}`
    };
  }
}
