import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? '',
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
)

export async function urlFirmada(path: string | null, segundos = 3600) {
  if (!path) return null
  const { data } = await supabase.storage.from('media').createSignedUrl(path, segundos)
  return data?.signedUrl ?? null
}
