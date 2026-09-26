import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { VistaDibujo } from '@/components/VistaDibujo';
import { Particulas } from '@/components/Particulas';
import { Flecha } from '@/components/Iconos';
import { crearNota } from '@/lib/autor';
import { tomarDibujo } from '@/lib/dibujo';
import { useSesion } from '@/lib/sesion';
import { colores, radios, sombras } from '@/lib/tema';

// Escribir (o dibujar) una nota. La usan los dos: el rol de la sesión decide
// a quién le llega. Al guardar, al otro le entra push y le aparece en Inicio.
export default function EscribirNota() {
  const router = useRouter();
  const { rol } = useSesion();
  const [texto, setTexto] = useState('');
  const [dibujo, setDibujo] = useState<string | null>(null);
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'ok' | 'error'>('listo');

  // Al volver del lienzo, recoger el dibujo.
  useFocusEffect(useCallback(() => {
    const svg = tomarDibujo();
    if (svg) setDibujo(svg);
  }, []));

  async function enviar() {
    setEstado('enviando');
    try {
      await crearNota(rol ?? 'ella', texto, dibujo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setEstado('ok');
      setTimeout(() => router.back(), 1200);
    } catch {
      setEstado('error');
    }
  }

  const vacio = !texto.trim() && !dibujo;

  return (
    <Pantalla>
      {estado === 'ok' ? <Particulas tipo="corazones" densidad={16} duracion={2000} /> : null}
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}>
          <Flecha color={colores.carbon} />
        </Pressable>
        <Texto variante="titulo" style={{ fontSize: 21 }}>Una nota para {rol === 'autor' ? 'ella' : 'él'}</Texto>
      </View>

      <Tarjeta style={{ gap: 12 }}>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escríbele lo que quieras…"
          placeholderTextColor={colores.gris}
          multiline
          style={estilos.input}
        />

        {dibujo ? (
          <View style={estilos.previa}>
            <VistaDibujo svg={dibujo} alto={200} />
            <Pressable onPress={() => setDibujo(null)} accessibilityLabel="Quitar dibujo" style={estilos.quitar}>
              <Texto variante="cuerpoBold" style={{ fontSize: 18, color: colores.gris }}>×</Texto>
            </Pressable>
          </View>
        ) : null}

        <Pressable onPress={() => router.push('/dibujar')} style={estilos.secundario}>
          <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 14 }}>
            {dibujo ? 'Dibujar otra cosa' : 'Dibujarle algo a dedo'}
          </Texto>
        </Pressable>

        <BotonKawaii
          titulo={
            estado === 'enviando' ? 'Enviando…'
              : estado === 'ok' ? '¡Le llegó!'
                : estado === 'error' ? 'No salió, reintenta'
                  : 'Mandársela'
          }
          onPress={enviar}
          disabled={estado === 'enviando' || estado === 'ok' || vacio}
        />
        <Texto variante="apoyo" style={{ fontSize: 12 }}>
          Le llega aviso al tiro y le queda en Inicio hasta que le mandes otra.
        </Texto>
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  input: {
    minHeight: 130, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 18, borderWidth: 2,
    borderColor: colores.rosaClaro, backgroundColor: colores.cremaClaro, color: colores.carbon,
    fontSize: 16, textAlignVertical: 'top',
  },
  previa: { position: 'relative', ...sombras.rosadaSuave },
  quitar: { position: 'absolute', top: 6, right: 6, width: 34, height: 34, borderRadius: 17, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  secundario: { minHeight: 46, borderRadius: radios.boton, borderWidth: 2, borderColor: colores.rosaClaro, alignItems: 'center', justifyContent: 'center' },
});
