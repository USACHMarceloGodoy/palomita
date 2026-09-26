// Crear o volver a personalizar la mascota: especie, orejas, hocico, dos
// colores y nombre. Se puede cambiar cuando quieran sin perder nada.
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Cabecera } from '@/components/mascota/Cabecera';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { agregarItem, DECORACION_INICIAL, guardarMascota, guardarNecesidades, mascotaDe, necesidadesDe, rolActual } from '@/lib/mascota-virtual/datos';
import { BOCAS, ESPECIES, HOCICOS, OJOS, OREJAS, PALETA_PELAJE, PALETA_SECUNDARIA, type Boca, type Especie, type Hocico, type Mascota, type Ojos, type Orejas } from '@/lib/mascota-virtual/tipos';
import { colores, fuentes, radios } from '@/lib/tema';

export default function Personalizar() {
  const router = useRouter();
  const { nueva } = useLocalSearchParams<{ nueva?: string }>();
  const esNueva = nueva === '1';
  const [previa, setPrevia] = useState<Mascota | null>(null);
  const [especie, setEspecie] = useState<Especie>('gato');
  const [orejas, setOrejas] = useState<Orejas>('puntiagudas');
  const [hocico, setHocico] = useState<Hocico>('chico');
  const [ojos, setOjos] = useState<Ojos>('redondos');
  const [boca, setBoca] = useState<Boca>('sonrisa');
  const [c1, setC1] = useState(PALETA_PELAJE[0]);
  const [c2, setC2] = useState(PALETA_SECUNDARIA[0]);
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    rolActual().then(mascotaDe).then((m) => {
      if (!m) return;
      setPrevia(m); setEspecie(m.especie); setOrejas(m.orejas); setHocico(m.hocico); setOjos(m.ojos); setBoca(m.boca);
      setC1(m.color_pelaje); setC2(m.color_secundario); setNombre(m.nombre);
    }).catch(() => {});
  }, []);

  function elegirEspecie(id: Especie) {
    const e = ESPECIES.find((x) => x.id === id)!;
    setEspecie(id); setOrejas(e.orejas); setHocico(e.hocico); setC1(e.c1); setC2(e.c2);
    Haptics.selectionAsync().catch(() => {});
  }

  async function guardar() {
    const n = nombre.trim() || 'Palomita';
    setGuardando(true);
    try {
      const rol = await rolActual();
      await guardarMascota({
        rol, especie, orejas, hocico, ojos, boca, color_pelaje: c1, color_secundario: c2, nombre: n,
        look: previa?.look ?? {},
        decoracion: previa?.decoracion ?? DECORACION_INICIAL,
      });
      if (!previa) {
        // Kit de bienvenida: la mascota parte contenta y con algo que comer.
        await guardarNecesidades(await necesidadesDe(rol));
        await agregarItem(rol, 'manzana', 2);
        await agregarItem(rol, 'galleta', 1);
        await agregarItem(rol, 'cebo', 1);
        await agregarItem(rol, 'cana_bambu', 1);
        await agregarItem(rol, 'cojin', 1);
        await agregarItem(rol, 'cama', 1);
        await agregarItem(rol, 'pared_rosa', 1);
        await agregarItem(rol, 'suelo_madera', 1);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      if (esNueva || !previa) router.replace('/(tabs)/mascota');
      else router.back();
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Pantalla fondo={colores.rosaBase}>
      <Cabecera titulo={previa ? 'Personalizar mascota' : 'Crea tu mascota'} subtitulo={previa ? 'Cambia lo que quieras; no pierde nada.' : 'Va a vivir aquí con ustedes.'} />

      <View style={{ alignItems: 'center', paddingVertical: 6 }}>
        <MascotaVirtual especie={especie} orejas={orejas} hocico={hocico} ojos={ojos} boca={boca} c1={c1} c2={c2} look={previa?.look} size={200} />
      </View>

      <Seccion titulo="Especie">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {ESPECIES.map((e) => (
            <Pildora key={e.id} activa={especie === e.id} onPress={() => elegirEspecie(e.id)} titulo={e.nombre} />
          ))}
        </ScrollView>
      </Seccion>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Seccion titulo="Orejas" style={{ flex: 1 }}>
          <View style={estilos.rejilla}>
            {OREJAS.map((o) => (
              <Miniatura key={o.id} activa={orejas === o.id} onPress={() => setOrejas(o.id)} etiqueta={o.nombre}>
                <MascotaVirtual especie={especie} orejas={o.id} hocico={hocico} ojos={ojos} boca={boca} c1={c1} c2={c2} size={50} quieta />
              </Miniatura>
            ))}
          </View>
        </Seccion>
        <Seccion titulo="Hocico" style={{ flex: 1 }}>
          <View style={estilos.rejilla}>
            {HOCICOS.map((h) => (
              <Miniatura key={h.id} activa={hocico === h.id} onPress={() => setHocico(h.id)} etiqueta={h.nombre}>
                <MascotaVirtual especie={especie} orejas={orejas} hocico={h.id} ojos={ojos} boca={boca} c1={c1} c2={c2} size={50} quieta />
              </Miniatura>
            ))}
          </View>
        </Seccion>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Seccion titulo="Ojos" style={{ flex: 1 }}>
          <View style={estilos.rejilla}>
            {OJOS.map((o) => (
              <Miniatura key={o.id} activa={ojos === o.id} onPress={() => setOjos(o.id)} etiqueta={o.nombre}>
                <Cara especie={especie} orejas={orejas} hocico={hocico} ojos={o.id} boca={boca} c1={c1} c2={c2} />
              </Miniatura>
            ))}
          </View>
        </Seccion>
        <Seccion titulo="Boca" style={{ flex: 1 }}>
          {hocico === 'pico' ? (
            <Texto variante="apoyo" style={{ fontSize: 13 }}>Con pico no lleva boca: el pico ya lo es.</Texto>
          ) : (
            <View style={estilos.rejilla}>
              {BOCAS.map((b) => (
                <Miniatura key={b.id} activa={boca === b.id} onPress={() => setBoca(b.id)} etiqueta={b.nombre}>
                  <Cara especie={especie} orejas={orejas} hocico={hocico} ojos={ojos} boca={b.id} c1={c1} c2={c2} />
                </Miniatura>
              ))}
            </View>
          )}
        </Seccion>
      </View>

      <Seccion titulo="Color de pelaje">
        <View style={estilos.paleta}>
          {PALETA_PELAJE.map((c) => <Gota key={c} color={c} activa={c1 === c} onPress={() => setC1(c)} />)}
        </View>
      </Seccion>
      <Seccion titulo="Color secundario">
        <View style={estilos.paleta}>
          {PALETA_SECUNDARIA.map((c) => <Gota key={c} color={c} activa={c2 === c} onPress={() => setC2(c)} />)}
        </View>
      </Seccion>

      <Seccion titulo="Nombre">
        <TextInput
          value={nombre}
          onChangeText={setNombre}
          placeholder="Palomita"
          placeholderTextColor={colores.gris}
          maxLength={18}
          style={estilos.campo}
          accessibilityLabel="Nombre de la mascota"
        />
      </Seccion>

      <BotonKawaii titulo={previa ? 'Guardar cambios' : 'Crear mascota'} onPress={guardar} disabled={guardando} />
    </Pantalla>
  );
}

// Miniatura acercada a la cara, para que se note la diferencia entre ojos y bocas.
function Cara(p: { especie: Especie; orejas: Orejas; hocico: Hocico; ojos: Ojos; boca: Boca; c1: string; c2: string }) {
  return (
    <View style={{ width: 52, height: 52, overflow: 'hidden', alignItems: 'center' }}>
      <View style={{ marginTop: -30 }}>
        <MascotaVirtual {...p} size={96} quieta />
      </View>
    </View>
  );
}

function Seccion({ titulo, children, style }: { titulo: string; children: React.ReactNode; style?: object }) {
  return (
    <Tarjeta fondo={colores.crema} sinSombra style={[{ padding: 14, gap: 10 }, style]}>
      <Texto variante="etiqueta">{titulo}</Texto>
      {children}
    </Tarjeta>
  );
}

function Pildora({ titulo, activa, onPress }: { titulo: string; activa: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: activa }} style={[estilos.pildora, activa && { backgroundColor: colores.rosaTinta }]}>
      <Texto variante="cuerpoBold" style={{ fontSize: 14, color: activa ? colores.crema : colores.rosaTinta }}>{titulo}</Texto>
    </Pressable>
  );
}

function Miniatura({ children, activa, onPress, etiqueta }: { children: React.ReactNode; activa: boolean; onPress: () => void; etiqueta: string }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={etiqueta} accessibilityState={{ selected: activa }} style={[estilos.mini, activa && { borderColor: colores.rosaTinta }]}>
      {children}
    </Pressable>
  );
}

function Gota({ color, activa, onPress }: { color: string; activa: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Color ${color}`} accessibilityState={{ selected: activa }} style={[estilos.gota, activa && estilos.gotaActiva]}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color, borderWidth: 1, borderColor: 'rgba(74,59,69,0.15)' }} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  pildora: { minHeight: 40, paddingHorizontal: 16, borderRadius: 999, backgroundColor: colores.rosaBase, alignItems: 'center', justifyContent: 'center' },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mini: { width: 56, height: 56, borderRadius: 14, backgroundColor: colores.rosaSuave, borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  paleta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gota: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: 'transparent' },
  gotaActiva: { borderColor: colores.rosaTinta },
  campo: { backgroundColor: colores.rosaSuave, borderRadius: radios.tarjetaChica, paddingHorizontal: 14, minHeight: 48, fontFamily: fuentes.cuerpoSemi, fontSize: 16, color: colores.carbon },
});
