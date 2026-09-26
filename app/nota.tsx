import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { VistaDibujo } from '@/components/VistaDibujo';
import { Particulas } from '@/components/Particulas';
import { Flecha } from '@/components/Iconos';
import { hiloDeNotas, leerDibujo, marcarNotaVista, type Nota } from '@/lib/autor';
import { fechaCorta } from '@/lib/fechas';
import { useSesion } from '@/lib/sesion';
import { colores, radios } from '@/lib/tema';

// El buzón de notas: lo último que te dejó el otro, el historial de las dos
// partes, y el botón para responder. Las notas del otro se marcan como vistas
// al entrar, así él (o ella) ve en su teléfono que ya la leyeron.
export default function Buzon() {
  const router = useRouter();
  const { rol } = useSesion();
  const yo = rol ?? 'ella';
  const [hilo, setHilo] = useState<Nota[]>([]);
  const [dibujos, setDibujos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);

  useFocusEffect(useCallback(() => {
    let vivo = true;
    (async () => {
      const notas = await hiloDeNotas(40);
      if (!vivo) return;
      setHilo(notas);
      setCargando(false);

      // Marcar como vistas las del otro que aún no lo estaban.
      for (const n of notas.filter((x) => x.autor_rol !== yo && !x.visto_en)) {
        marcarNotaVista(n.id).catch(() => {});
      }

      // Traer los dibujos (son archivos aparte en el bucket).
      for (const n of notas.filter((x) => x.dibujo_path)) {
        leerDibujo(n.dibujo_path!)
          .then((svg) => { if (vivo && svg) setDibujos((prev) => ({ ...prev, [n.id]: svg })); })
          .catch(() => {});
      }
    })().catch(() => setCargando(false));
    return () => { vivo = false; };
  }, [yo]));

  const ultima = hilo.find((n) => n.autor_rol !== yo) ?? null;
  const resto = hilo.filter((n) => n.id !== ultima?.id);

  return (
    <Pantalla>
      <Particulas tipo="corazones" densidad={12} duracion={2400} />
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}>
          <Flecha color={colores.carbon} />
        </Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Notas</Texto>
      </View>

      {ultima ? (
        <Tarjeta style={{ gap: 14 }}>
          <Texto variante="etiqueta">Lo último que te dejó</Texto>
          {dibujos[ultima.id] ? <VistaDibujo svg={dibujos[ultima.id]} alto={260} /> : null}
          {ultima.texto ? (
            <Texto variante="manuscritaGrande" style={{ fontSize: 22, lineHeight: 30 }}>{ultima.texto}</Texto>
          ) : null}
          <Texto variante="apoyo" style={{ textAlign: 'right' }}>{fechaCorta(ultima.creado_en)}</Texto>
        </Tarjeta>
      ) : (
        <Tarjeta style={{ gap: 8 }}>
          <Texto variante="titulo">Todavía no hay nada</Texto>
          <Texto variante="apoyo">
            {cargando ? 'Buscando…' : 'Nadie ha dejado una nota aún. Empieza tú.'}
          </Texto>
        </Tarjeta>
      )}

      <BotonKawaii titulo="Dejarle una nota" onPress={() => router.push('/escribir-nota')} />

      {resto.length ? (
        <Tarjeta fondo={colores.cremaClaro} sinSombra style={{ gap: 14 }}>
          <Texto variante="etiqueta">Antes</Texto>
          {resto.map((n) => (
            <View key={n.id} style={[estilos.vieja, n.autor_rol === yo && estilos.mia]}>
              <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.gris }}>
                {n.autor_rol === yo ? 'Tú' : 'Él/Ella'} · {fechaCorta(n.creado_en)}
                {n.autor_rol === yo && n.visto_en ? ' · la vio' : ''}
              </Texto>
              {dibujos[n.id] ? <VistaDibujo svg={dibujos[n.id]} alto={130} fondo={colores.crema} /> : null}
              {n.texto ? <Texto style={{ fontSize: 15 }}>{n.texto}</Texto> : null}
            </View>
          ))}
        </Tarjeta>
      ) : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  vieja: { gap: 6, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: colores.rosaClaro },
  mia: { borderLeftColor: colores.menta },
});
