import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigurado } from './supabase';

export type Rol = 'ella' | 'autor';

export function useSesion() {
  const [sesion, setSesion] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const [rol, setRol] = useState<Rol | null>(null);

  useEffect(() => {
    if (!supabaseConfigurado) {
      setCargando(false);
      setRol('ella');
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setCargando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!sesion) return;
    supabase
      .from('usuarios')
      .select('rol')
      .eq('id', sesion.user.id)
      .maybeSingle()
      .then(({ data }) => setRol((data?.rol as Rol) ?? 'ella'));
  }, [sesion?.user.id]);

  return { sesion, cargando, rol, demo: !supabaseConfigurado };
}

export async function iniciarSesion(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
