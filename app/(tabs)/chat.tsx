import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Texto } from '@/components/Texto';
import { Tarjeta } from '@/components/Tarjeta';
import { BotonKawaii } from '@/components/BotonKawaii';
import { StickerFigura } from '@/components/StickerFigura';
import { Mascota } from '@/components/Mascota';
import { enviar, escuchar, historial, marcarLeidos, validarFrase, type MensajeChat } from '@/lib/chat';
import { derivarClave, guardarClave, leerClave } from '@/lib/cripto';
import { catalogoStickers, misStickers, type StickerDisponible } from '@/lib/stickers';
import { useSesion, type Rol } from '@/lib/sesion';
import { colores, fuentes, radios, sombras } from '@/lib/tema';

// Chat cifrado de punta a punta. La primera vez pide la frase secreta; de ahí
// en adelante la clave queda en el llavero del teléfono y la pantalla abre
// directo en la conversación.
export default function Chat() {
  const { rol } = useSesion();
  const [clave, setClave] = useState<Uint8Array | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    leerClave().then((k) => { setClave(k); setCargando(false); }).catch(() => setCargando(false));
  }, []);

  if (cargando) return <View style={estilos.centro}><Texto variante="apoyo">Abriendo…</Texto></View>;
  if (!clave) return <PedirFrase onListo={setClave} />;
  return <Conversacion clave={clave} rol={rol ?? 'ella'} />;
}

// --- Configurar la frase ----------------------------------------------------
function PedirFrase({ onListo }: { onListo: (k: Uint8Array) => void }) {
  const [frase, setFrase] = useState('');
  const [estado, setEstado] = useState<'listo' | 'probando' | 'no-coincide' | 'error'>('listo');

  async function confirmar() {
    setEstado('probando');
    try {
      // Derivar es lento a propósito (50.000 pasadas), así que le damos un
      // respiro al hilo para que alcance a pintar el "Comprobando…".
      await new Promise((r) => setTimeout(r, 50));
      const k = derivarClave(frase);
      const r = await validarFrase(k);
      if (r === 'no-coincide') { setEstado('no-coincide'); return; }
      await guardarClave(k);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onListo(k);
    } catch {
      setEstado('error');
    }
  }

  return (
    <View style={estilos.raizCentrada}>
      <Mascota size={92} animo={0.8} />
      <Texto variante="tituloGrande" style={{ fontSize: 26, textAlign: 'center' }}>Nuestro chat</Texto>
      <Tarjeta style={{ gap: 12, width: '100%' }}>
        <Texto variante="apoyo">
          Los mensajes van cifrados: se cierran en este teléfono y solo se abren en el otro. Escriban
          los dos la misma frase secreta, exactamente igual, y listo. No la guarda ningún servidor.
        </Texto>
        <TextInput
          value={frase}
          onChangeText={(t) => { setFrase(t); if (estado !== 'listo') setEstado('listo'); }}
          placeholder="la frase que solo ustedes saben"
          placeholderTextColor={colores.gris}
          autoCapitalize="none"
          autoCorrect={false}
          style={estilos.input}
        />
        {estado === 'no-coincide' ? (
          <Texto variante="apoyo" style={{ color: colores.rosaTinta }}>
            Esa no es la frase que se usó para abrir el chat. Revisa con él cuál era.
          </Texto>
        ) : null}
        {estado === 'error' ? (
          <Texto variante="apoyo" style={{ color: colores.rosaTinta }}>No pude comprobarla. ¿Hay internet?</Texto>
        ) : null}
        <BotonKawaii
          titulo={estado === 'probando' ? 'Comprobando…' : 'Entrar al chat'}
          onPress={confirmar}
          disabled={estado === 'probando' || frase.trim().length < 4}
        />
        <Texto variante="apoyo" style={{ fontSize: 12 }}>
          Ojo: si los dos la olvidan, los mensajes viejos no se pueden recuperar. Ni yo puedo leerlos.
        </Texto>
      </Tarjeta>
    </View>
  );
}

// --- La conversación --------------------------------------------------------
function Conversacion({ clave, rol }: { clave: Uint8Array; rol: Rol }) {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [texto, setTexto] = useState('');
  const [stickers, setStickers] = useState<StickerDisponible[]>([]);
  const [catalogo, setCatalogo] = useState<Record<string, string>>({});
  const [verStickers, setVerStickers] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const lista = useRef<FlatList<MensajeChat>>(null);

  // Cargar el hilo y quedarse escuchando lo que llegue.
  useEffect(() => {
    let vivo = true;
    historial(clave).then((m) => { if (vivo) setMensajes(m); }).catch(() => {});
    misStickers(rol).then((s) => { if (vivo) setStickers(s); }).catch(() => {});
    catalogoStickers().then((c) => { if (vivo) setCatalogo(c); }).catch(() => {});
    const cortar = escuchar(clave, (m) => {
      setMensajes((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      if (m.autor_rol !== rol) Haptics.selectionAsync().catch(() => {});
    });
    return () => { vivo = false; cortar(); };
  }, []);

  // Al entrar (y cada vez que llega algo), marcar como leído lo suyo.
  useFocusEffect(useCallback(() => {
    const pendientes = mensajes.filter((m) => m.autor_rol !== rol && !m.leido_en).map((m) => m.id);
    if (pendientes.length) marcarLeidos(pendientes).catch(() => {});
  }, [mensajes.length]));

  async function mandar(stickerId?: string) {
    if (enviando) return;
    if (!texto.trim() && !stickerId) return;
    setEnviando(true);
    const borrador = texto;
    setTexto('');
    setVerStickers(false);
    try {
      await enviar(clave, rol, borrador, stickerId);
      Haptics.selectionAsync().catch(() => {});
      // El realtime lo devuelve solo; si tarda, el historial lo recupera.
    } catch {
      setTexto(borrador);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={estilos.raiz}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <FlatList
        ref={lista}
        data={mensajes}
        keyExtractor={(m) => m.id}
        contentContainerStyle={estilos.hilo}
        onContentSizeChange={() => lista.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={estilos.vacio}>
            <Mascota size={80} animo={0.7} />
            <Texto variante="apoyo" style={{ textAlign: 'center' }}>
              Nadie ha escrito nada todavía. Empieza tú.
            </Texto>
          </View>
        }
        renderItem={({ item }) => (
          <Burbuja m={item} mio={item.autor_rol === rol} rutaSticker={item.sticker_id ? catalogo[item.sticker_id] ?? null : null} />
        )}
      />

      {verStickers ? (
        <View style={estilos.cajonStickers}>
          {stickers.length ? (
            <FlatList
              data={stickers}
              horizontal
              keyExtractor={(s) => s.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingHorizontal: 12 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => mandar(item.id)} style={estilos.stickerBoton}>
                  <StickerFigura path={item.img_path} size={54} />
                </Pressable>
              )}
            />
          ) : (
            <Texto variante="apoyo" style={{ textAlign: 'center', paddingHorizontal: 16 }}>
              Todavía no tienes stickers. Se desbloquean en el Tesoro.
            </Texto>
          )}
        </View>
      ) : null}

      <View style={estilos.barra}>
        <Pressable
          onPress={() => setVerStickers((v) => !v)}
          accessibilityLabel="Stickers"
          style={[estilos.botonStickers, verStickers && { backgroundColor: colores.rosaFuerte }]}
        >
          <Texto style={{ fontSize: 20 }}>☺</Texto>
        </Pressable>
        <TextInput
          value={texto}
          onChangeText={setTexto}
          placeholder="Escríbele…"
          placeholderTextColor={colores.gris}
          multiline
          style={estilos.entrada}
        />
        <Pressable
          onPress={() => mandar()}
          disabled={enviando || !texto.trim()}
          accessibilityLabel="Enviar"
          style={[estilos.enviar, (enviando || !texto.trim()) && { opacity: 0.4 }]}
        >
          <Texto variante="cuerpoBold" style={{ color: colores.crema, fontSize: 15 }}>↑</Texto>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Burbuja({ m, mio, rutaSticker }: { m: MensajeChat; mio: boolean; rutaSticker: string | null }) {
  if (m.ilegible) {
    return (
      <View style={[estilos.burbuja, estilos.ilegible, mio ? estilos.mia : estilos.suya]}>
        <Texto variante="apoyo" style={{ fontSize: 13 }}>Mensaje cifrado con otra frase</Texto>
      </View>
    );
  }
  return (
    <View style={[estilos.burbuja, mio ? estilos.mia : estilos.suya]}>
      {rutaSticker ? (
        <View style={{ marginBottom: m.texto ? 6 : 0 }}><StickerFigura path={rutaSticker} size={92} /></View>
      ) : null}
      {m.texto ? (
        <Texto style={{ fontSize: 15, color: mio ? colores.crema : colores.carbon }}>{m.texto}</Texto>
      ) : null}
      <Texto style={[estilos.hora, { color: mio ? 'rgba(255,248,240,0.7)' : colores.gris }]}>
        {new Date(m.creado_en).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
        {mio && m.leido_en ? ' · visto' : ''}
      </Texto>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: colores.rosaBase },
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.rosaBase },
  raizCentrada: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24, backgroundColor: colores.rosaBase },
  input: {
    minHeight: 50, paddingHorizontal: 16, borderRadius: 18, borderWidth: 2, borderColor: colores.rosaClaro,
    backgroundColor: colores.cremaClaro, color: colores.carbon, fontFamily: fuentes.cuerpo, fontSize: 16,
  },
  hilo: { padding: 14, gap: 8, flexGrow: 1, justifyContent: 'flex-end' },
  vacio: { alignItems: 'center', gap: 12, paddingVertical: 60 },
  burbuja: { maxWidth: '82%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, gap: 2 },
  mia: { alignSelf: 'flex-end', backgroundColor: colores.rosaFuerte, borderBottomRightRadius: 6 },
  suya: { alignSelf: 'flex-start', backgroundColor: colores.crema, borderBottomLeftRadius: 6, ...sombras.rosadaSuave },
  ilegible: { borderWidth: 1.5, borderColor: colores.rosaClaro, backgroundColor: colores.cremaClaro },
  hora: { fontFamily: fuentes.cuerpo, fontSize: 11, alignSelf: 'flex-end' },
  cajonStickers: { paddingVertical: 12, backgroundColor: colores.crema, borderTopWidth: 1.5, borderTopColor: colores.rosaClaro },
  stickerBoton: { padding: 6, borderRadius: radios.tarjetaChica, backgroundColor: colores.cremaClaro },
  barra: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10,
    backgroundColor: colores.crema, borderTopWidth: 1.5, borderTopColor: colores.rosaClaro,
  },
  botonStickers: { width: 44, height: 44, borderRadius: 22, backgroundColor: colores.rosaBase, alignItems: 'center', justifyContent: 'center' },
  entrada: {
    flex: 1, minHeight: 44, maxHeight: 120, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22,
    backgroundColor: colores.cremaClaro, borderWidth: 1.5, borderColor: colores.rosaClaro,
    color: colores.carbon, fontFamily: fuentes.cuerpo, fontSize: 15,
  },
  enviar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colores.rosaFuerte, alignItems: 'center', justifyContent: 'center' },
});
