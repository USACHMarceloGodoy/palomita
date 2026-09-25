import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Carita } from '@/components/Carita';
import { VistaDibujo } from '@/components/VistaDibujo';
import { Flecha } from '@/components/Iconos';
import {
  crearAnimo, crearMensaje, crearNota, inventarioBotiquin, mensajesProgramados,
  notas, saldoDeElla, ultimasAlertas, ultimosCheckins, type Alerta, type Nota,
} from '@/lib/autor';
import { tomarDibujo } from '@/lib/dibujo';
import { diagnosticoPush, type DiagnosticoPush } from '@/lib/notificaciones';
import { fechaCorta, hoyChile } from '@/lib/fechas';
import { colores, radios, sombras } from '@/lib/tema';
import type { CategoriaBotiquin, Checkin, Mensaje, TipoMensaje } from '@/lib/tipos';

// Modo autor: el panel de escritorio en chiquito, para lo de todos los días.
// Solo se llega acá si la sesión es la tuya (Inicio esconde la entrada si el
// rol es 'ella', y las RLS bloquean todo lo demás igual).
type Seccion = 'nota' | 'mensaje' | 'animo' | 'ella';

const SECCIONES: { id: Seccion; titulo: string }[] = [
  { id: 'nota', titulo: 'Nota del día' },
  { id: 'mensaje', titulo: 'Mensaje' },
  { id: 'animo', titulo: 'Botiquín' },
  { id: 'ella', titulo: 'Cómo está' },
];

export default function Autor() {
  const router = useRouter();
  const [seccion, setSeccion] = useState<Seccion>('nota');

  return (
    <Pantalla>
      <View style={estilos.cabecera}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Volver" style={estilos.volver}><Flecha color={colores.carbon} /></Pressable>
        <View style={{ flex: 1 }}>
          <Texto variante="tituloGrande" style={{ fontSize: 26 }}>Modo autor</Texto>
          <Texto variante="apoyo">Lo que le llega a ella, desde tu bolsillo.</Texto>
        </View>
      </View>

      <View style={estilos.pestanas}>
        {SECCIONES.map((s) => (
          <Pressable key={s.id} onPress={() => setSeccion(s.id)} style={[estilos.pestana, seccion === s.id && estilos.pestanaActiva]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: seccion === s.id ? colores.crema : colores.gris }}>{s.titulo}</Texto>
          </Pressable>
        ))}
      </View>

      {seccion === 'nota' ? <SeccionNota /> : null}
      {seccion === 'mensaje' ? <SeccionMensaje /> : null}
      {seccion === 'animo' ? <SeccionAnimo /> : null}
      {seccion === 'ella' ? <SeccionElla /> : null}
    </Pantalla>
  );
}

// --- Nota del día: texto libre y/o dibujo ----------------------------------
function SeccionNota() {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [dibujo, setDibujo] = useState<string | null>(null);
  const [lista, setLista] = useState<Nota[]>([]);
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'ok' | 'error'>('listo');

  // Al volver del lienzo, recoger el dibujo recién hecho.
  useFocusEffect(useCallback(() => {
    const svg = tomarDibujo();
    if (svg) setDibujo(svg);
    notas(8).then(setLista).catch(() => {});
  }, []));

  async function enviar() {
    setEstado('enviando');
    try {
      await crearNota(texto, dibujo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTexto(''); setDibujo(null); setEstado('ok');
      setLista(await notas(8));
      setTimeout(() => setEstado('listo'), 2200);
    } catch {
      setEstado('error');
    }
  }

  return (
    <>
      <Tarjeta style={{ gap: 12 }}>
        <Texto variante="etiqueta">Déjale una nota</Texto>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Lo que quieras que lea hoy…"
          placeholderTextColor={colores.gris}
          multiline
          style={[estilos.input, { minHeight: 110, textAlignVertical: 'top' }]}
        />

        {dibujo ? (
          <View style={estilos.previa}>
            <VistaDibujo svg={dibujo} alto={150} />
            <Pressable onPress={() => setDibujo(null)} style={estilos.quitar}>
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
          titulo={estado === 'enviando' ? 'Enviando…' : estado === 'ok' ? '¡Le llegó!' : estado === 'error' ? 'No salió, reintenta' : 'Mandársela'}
          onPress={enviar}
          disabled={estado === 'enviando' || (!texto.trim() && !dibujo)}
        />
        <Texto variante="apoyo" style={{ fontSize: 12 }}>
          Le llega push al tiro y le aparece en Inicio hasta que la abra.
        </Texto>
      </Tarjeta>

      {lista.length ? (
        <Tarjeta fondo={colores.cremaClaro} sinSombra style={{ gap: 10 }}>
          <Texto variante="etiqueta">Últimas notas</Texto>
          {lista.map((n) => (
            <View key={n.id} style={estilos.filaNota}>
              <View style={{ flex: 1 }}>
                <Texto style={{ fontSize: 14 }} numberOfLines={2}>{n.texto ?? '(solo dibujo)'}</Texto>
                <Texto variante="apoyo" style={{ fontSize: 11 }}>
                  {fechaCorta(n.creado_en)} · {n.visto_en ? 'la vio' : 'sin abrir'}
                </Texto>
              </View>
            </View>
          ))}
        </Tarjeta>
      ) : null}
    </>
  );
}

// --- Mensaje del día / base rotativa ---------------------------------------
const TIPOS: { id: TipoMensaje; titulo: string }[] = [
  { id: 'nota', titulo: 'Nota' },
  { id: 'poema', titulo: 'Poema' },
  { id: 'extracto', titulo: 'Extracto' },
];

function SeccionMensaje() {
  const [texto, setTexto] = useState('');
  const [tipo, setTipo] = useState<TipoMensaje>('nota');
  const [fecha, setFecha] = useState('');
  const [programados, setProgramados] = useState<Mensaje[]>([]);
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'ok' | 'error'>('listo');

  useFocusEffect(useCallback(() => {
    mensajesProgramados().then(setProgramados).catch(() => {});
  }, []));

  async function enviar() {
    setEstado('enviando');
    try {
      await crearMensaje(texto, tipo, fecha.trim() || null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTexto(''); setFecha(''); setEstado('ok');
      setProgramados(await mensajesProgramados());
      setTimeout(() => setEstado('listo'), 2200);
    } catch {
      setEstado('error');
    }
  }

  return (
    <>
      <Tarjeta style={{ gap: 12 }}>
        <Texto variante="etiqueta">Mensaje del día</Texto>
        <View style={estilos.chips}>
          {TIPOS.map((t) => (
            <Pressable key={t.id} onPress={() => setTipo(t.id)} style={[estilos.chip, tipo === t.id && estilos.chipActivo]}>
              <Texto variante="cuerpoBold" style={{ fontSize: 13, color: tipo === t.id ? colores.crema : colores.gris }}>{t.titulo}</Texto>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="El mensaje…"
          placeholderTextColor={colores.gris}
          multiline
          style={[estilos.input, { minHeight: 120, textAlignVertical: 'top' }]}
        />
        <TextInput
          value={fecha}
          onChangeText={setFecha}
          placeholder={`Fecha AAAA-MM-DD (vacío = base rotativa). Hoy: ${hoyChile()}`}
          placeholderTextColor={colores.gris}
          autoCapitalize="none"
          style={estilos.input}
        />
        <BotonKawaii
          titulo={estado === 'enviando' ? 'Guardando…' : estado === 'ok' ? 'Guardado' : estado === 'error' ? 'No salió, reintenta' : 'Guardar mensaje'}
          onPress={enviar}
          disabled={estado === 'enviando' || !texto.trim()}
        />
        <Texto variante="apoyo" style={{ fontSize: 12 }}>
          Con fecha, sale ese día a las 09:00 y le llega push. Sin fecha, entra a la base de la que Inicio saca uno cualquiera.
        </Texto>
      </Tarjeta>

      {programados.length ? (
        <Tarjeta fondo={colores.cremaClaro} sinSombra style={{ gap: 8 }}>
          <Texto variante="etiqueta">Ya programados</Texto>
          {programados.map((m) => (
            <View key={m.id}>
              <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>{fechaCorta(m.fecha_publicacion!)}</Texto>
              <Texto variante="apoyo" numberOfLines={2}>{m.texto}</Texto>
            </View>
          ))}
        </Tarjeta>
      ) : null}
    </>
  );
}

// --- Botiquín ---------------------------------------------------------------
const CATEGORIAS: { id: CategoriaBotiquin; titulo: string }[] = [
  { id: 'animos', titulo: 'Necesito ánimos' },
  { id: 'feliz', titulo: 'Estoy feliz' },
  { id: 'logro', titulo: 'Logré algo' },
  { id: 'extrano', titulo: 'Te extraño' },
];

function SeccionAnimo() {
  const [cat, setCat] = useState<CategoriaBotiquin>('animos');
  const [texto, setTexto] = useState('');
  const [inventario, setInventario] = useState<Record<string, number>>({});
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'ok' | 'error'>('listo');

  useFocusEffect(useCallback(() => {
    inventarioBotiquin().then(setInventario).catch(() => {});
  }, []));

  async function enviar() {
    setEstado('enviando');
    try {
      await crearAnimo(cat, texto);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setTexto(''); setEstado('ok');
      setInventario(await inventarioBotiquin());
      setTimeout(() => setEstado('listo'), 2000);
    } catch {
      setEstado('error');
    }
  }

  return (
    <Tarjeta style={{ gap: 12 }}>
      <Texto variante="etiqueta">Sumar al botiquín</Texto>
      <View style={estilos.chips}>
        {CATEGORIAS.map((c) => (
          <Pressable key={c.id} onPress={() => setCat(c.id)} style={[estilos.chip, cat === c.id && estilos.chipActivo]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: cat === c.id ? colores.crema : colores.gris }}>
              {c.titulo} · {inventario[c.id] ?? 0}
            </Texto>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Lo que le dirías si te apretara ese botón…"
        placeholderTextColor={colores.gris}
        multiline
        style={[estilos.input, { minHeight: 110, textAlignVertical: 'top' }]}
      />
      <BotonKawaii
        titulo={estado === 'enviando' ? 'Guardando…' : estado === 'ok' ? 'Guardado' : estado === 'error' ? 'No salió, reintenta' : 'Sumar al botiquín'}
        onPress={enviar}
        disabled={estado === 'enviando' || !texto.trim()}
      />
      <Texto variante="apoyo" style={{ fontSize: 12 }}>
        Cada botón del Botiquín saca uno de estos al azar. Mientras más haya, menos se repiten.
      </Texto>
    </Tarjeta>
  );
}

// --- Cómo está ella ---------------------------------------------------------
function SeccionElla() {
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [besitos, setBesitos] = useState(0);

  useFocusEffect(useCallback(() => {
    ultimosCheckins(14).then(setCheckins).catch(() => {});
    ultimasAlertas(5).then(setAlertas).catch(() => {});
    saldoDeElla().then(setBesitos).catch(() => {});
  }, []));

  return (
    <>
      {alertas.length ? (
        <Tarjeta fondo={colores.rosaSuave} sinSombra borde={colores.rosaMedio} style={{ gap: 6 }}>
          <Texto variante="etiqueta">Te necesitó</Texto>
          {alertas.map((a) => (
            <Texto key={a.id} variante="cuerpoBold" style={{ fontSize: 14 }}>{fechaCorta(a.creado_en)}</Texto>
          ))}
        </Tarjeta>
      ) : null}

      <Tarjeta style={{ gap: 12 }}>
        <View style={estilos.filaEntre}>
          <Texto variante="etiqueta">Últimos check-ins</Texto>
          <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.rosaTinta }}>{besitos} besitos</Texto>
        </View>
        {checkins.length ? checkins.map((c) => (
          <View key={c.id} style={estilos.filaCheckin}>
            <Carita emoji={c.emoji} size={30} />
            <View style={{ flex: 1 }}>
              <Texto variante="cuerpoBold" style={{ fontSize: 13 }}>{fechaCorta(c.fecha)}</Texto>
              {c.texto ? <Texto variante="apoyo">{c.texto}</Texto> : <Texto variante="apoyo" style={{ fontStyle: 'italic' }}>sin texto</Texto>}
            </View>
          </View>
        )) : <Texto variante="apoyo">Todavía no hay check-ins.</Texto>}
      </Tarjeta>

      <PruebaNotificaciones />
    </>
  );
}

/**
 * Botón para comprobar el push en este teléfono. Registra el token y dice en
 * qué paso falla si falla, que si no el error queda invisible.
 */
function PruebaNotificaciones() {
  const [r, setR] = useState<DiagnosticoPush | null>(null);
  const [probando, setProbando] = useState(false);

  async function probar() {
    setProbando(true);
    setR(await diagnosticoPush());
    setProbando(false);
  }

  return (
    <Tarjeta fondo={colores.cremaClaro} sinSombra style={{ gap: 10 }}>
      <Texto variante="etiqueta">Notificaciones de este teléfono</Texto>
      <Pressable onPress={probar} disabled={probando} style={[estilos.secundario, probando && { opacity: 0.5 }]}>
        <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 14 }}>
          {probando ? 'Probando…' : 'Registrar y probar'}
        </Texto>
      </Pressable>
      {r ? (
        <View style={{ gap: 4 }}>
          <Texto variante="cuerpoBold" style={{ fontSize: 13, color: r.ok ? colores.rosaTinta : colores.carbon }}>
            {r.ok ? '✓ Listo' : `✗ Falló en: ${r.paso}`}
          </Texto>
          <Texto variante="apoyo" style={{ fontSize: 12 }}>{r.detalle}</Texto>
        </View>
      ) : null}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  volver: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  pestanas: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pestana: { minHeight: 40, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  pestanaActiva: { backgroundColor: colores.rosaFuerte },
  input: {
    minHeight: 50, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 18, borderWidth: 2,
    borderColor: colores.rosaClaro, backgroundColor: colores.cremaClaro, color: colores.carbon, fontSize: 15,
  },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: { minHeight: 38, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colores.cremaClaro, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colores.rosaClaro },
  chipActivo: { backgroundColor: colores.rosaFuerte, borderColor: colores.rosaFuerte },
  secundario: { minHeight: 46, borderRadius: radios.boton, borderWidth: 2, borderColor: colores.rosaClaro, alignItems: 'center', justifyContent: 'center' },
  previa: { position: 'relative', ...sombras.rosadaSuave },
  quitar: { position: 'absolute', top: 6, right: 6, width: 34, height: 34, borderRadius: 17, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center' },
  filaNota: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  filaCheckin: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
