import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Image } from 'expo-image';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Corazon } from '@/components/Iconos';
import { Figura, type Forma } from '@/components/Figuras';
import { Particulas } from '@/components/Particulas';
import { StickerFigura } from '@/components/StickerFigura';
import { Tesorito } from '@/components/Tesorito';
import { ReproductorAudio } from '@/components/ReproductorAudio';
import { Ruleta } from '@/juegos/ruleta/Ruleta';
import { cupones } from '@/lib/contenido';
import { comprarCupon, ganadoHoy, PRECIOS, saldo } from '@/lib/economia';
import { abrirCapsula, capsulaGratisDisponible, comprarComida, comprarInedito } from '@/lib/tienda';
import { supabase, supabaseConfigurado, urlFirmada } from '@/lib/supabase';
import { colores, radios, sombras } from '@/lib/tema';
import type { Cupon, Sticker } from '@/lib/tipos';

export default function Tesoro() {
  const router = useRouter();
  const [besitos, setBesitos] = useState(0);
  const [hoy, setHoy] = useState(0);
  const [lista, setLista] = useState<Cupon[]>([]);
  const [festejo, setFestejo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [gratis, setGratis] = useState(false);
  const [sticker, setSticker] = useState<Sticker | null>(null);
  const [qr, setQr] = useState<Cupon | null>(null);
  const [inedito, setInedito] = useState<{ tipo: 'foto' | 'audio'; url: string | null; texto: string } | null>(null);
  const [ruleta, setRuleta] = useState(false);

  const cargar = useCallback(async () => {
    const [s, h, c, g] = await Promise.all([saldo(), ganadoHoy().catch(() => 0), cupones(), capsulaGratisDisponible()]);
    setBesitos(s); setHoy(h); setLista(c); setGratis(g);
  }, []);

  useFocusEffect(useCallback(() => { cargar().catch(() => {}); }, [cargar]));

  function celebrar(texto: string) {
    setFestejo(true); setAviso(texto);
    setTimeout(() => { setFestejo(false); setAviso(null); }, 3000);
  }
  const faltan = (costo: number) => `Te faltan ${Math.max(0, costo - besitos)} besitos para eso.`;

  async function comprar(c: Cupon) {
    const ok = await comprarCupon(c.id, c.costo).catch(() => false);
    if (!ok) { setAviso(faltan(c.costo)); return; }
    celebrar('Cupón tuyo. Muéstraselo cuando quieras.');
    await cargar();
  }

  async function gacha(esGratis: boolean) {
    const s = await abrirCapsula(esGratis).catch(() => null);
    if (!s) { setAviso(faltan(PRECIOS.sticker)); return; }
    setSticker(s);
    celebrar(`${s.nombre} · ${s.rareza}`);
    await cargar();
  }

  async function comprarSorpresa(tipo: 'foto' | 'audio') {
    const id = await comprarInedito(tipo).catch(() => null);
    if (!id) { setAviso(besitos < (tipo === 'foto' ? PRECIOS.foto : PRECIOS.audio) ? faltan(tipo === 'foto' ? PRECIOS.foto : PRECIOS.audio) : 'No queda nada inédito por ahora. Él tiene que subir más.'); return; }
    if (!supabaseConfigurado) { setInedito({ tipo, url: null, texto: 'En modo demo no hay inéditos reales.' }); await cargar(); return; }
    if (tipo === 'foto') {
      const { data } = await supabase.from('recuerdos').select('foto_path, texto').eq('id', id).single();
      setInedito({ tipo, url: await urlFirmada(data?.foto_path), texto: data?.texto ?? '' });
    } else {
      const { data } = await supabase.from('botiquin').select('media_path, texto').eq('id', id).single();
      setInedito({ tipo, url: await urlFirmada(data?.media_path), texto: data?.texto ?? '' });
    }
    celebrar(tipo === 'foto' ? 'Una foto que no habías visto' : 'Un audio nuevo');
    await cargar();
  }

  async function comida() {
    const ok = await comprarComida().catch(() => false);
    if (!ok) { setAviso(faltan(PRECIOS.comida)); return; }
    celebrar('Palomita comió. Subió su ánimo.');
    await cargar();
  }

  const disponibles = lista.filter((c) => !c.comprado_en);
  const mios = lista.filter((c) => c.comprado_en);

  const PRODUCTOS: { id: 'foto' | 'audio' | 'comida'; forma: Forma; c1: string; c2: string; titulo: string; texto: string; costo: number; accion: () => void }[] = [
    { id: 'foto', forma: 'lana', c1: colores.rosaMedio, c2: colores.rosaTinta, titulo: 'Foto inédita', texto: 'Una que no está en el Baúl.', costo: PRECIOS.foto, accion: () => comprarSorpresa('foto') },
    { id: 'audio', forma: 'lazo', c1: colores.lavanda, c2: '#6B3FA0', titulo: 'Audio suyo', texto: 'Grabado solo para esto.', costo: PRECIOS.audio, accion: () => comprarSorpresa('audio') },
    { id: 'comida', forma: 'frutilla', c1: '#E63950', c2: '#3E8A62', titulo: 'Comida para Palomita', texto: 'Le sube el ánimo.', costo: PRECIOS.comida, accion: comida },
  ];

  return (
    <Pantalla fondo="#FFF3C4">
      <Tesorito pantalla="tesoro" />
      {festejo ? <Particulas tipo="corazones" densidad={20} duracion={2500} /> : null}
      <Texto variante="tituloGrande">Tesoro</Texto>

      <Tarjeta style={estilos.saldo}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Corazon color={colores.rosaFuerte} fill={colores.rosaFuerte} size={28} />
          <Texto style={{ fontSize: 40, lineHeight: 46, fontFamily: 'Baloo2_700Bold', color: colores.rosaTinta }}>{besitos}</Texto>
        </View>
        <Texto variante="apoyo">besitos · hoy ganaste {hoy} de 60</Texto>
      </Tarjeta>

      {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

      {/* Gacha */}
      <Tarjeta fondo={colores.lavanda} sinSombra>
        <View style={estilos.fila}>
          <View style={{ flex: 1 }}>
            <Texto variante="titulo">Gacha de stickers</Texto>
            <Texto variante="apoyo">{gratis ? 'Tienes la cápsula gratis de hoy.' : `Una gratis al día. Extra: ${PRECIOS.sticker} besitos.`}</Texto>
          </View>
          {sticker ? <StickerFigura path={sticker.img_path} size={52} /> : <Figura forma="lana" c1={colores.rosaFuerte} c2={colores.rosaTinta} size={44} />}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <BotonKawaii titulo={gratis ? 'Abrir la gratis' : `Abrir · ${PRECIOS.sticker}`} onPress={() => gacha(gratis)} style={{ flex: 1 }} />
          <BotonKawaii titulo="Álbum" variante="secundario" onPress={() => router.push('/album')} />
        </View>
      </Tarjeta>

      {/* Inéditos y comida */}
      {PRODUCTOS.map((p) => (
        <Tarjeta key={p.id} sinSombra style={[sombras.rosadaSuave, estilos.cupon]}>
          <Figura forma={p.forma} c1={p.c1} c2={p.c2} size={40} />
          <View style={{ flex: 1, gap: 2 }}>
            <Texto variante="cuerpoBold">{p.titulo}</Texto>
            <Texto variante="apoyo">{p.texto}</Texto>
          </View>
          <BotonKawaii onPress={p.accion} disabled={besitos < p.costo} style={{ paddingHorizontal: 14 }}>
            <Corazon color={colores.crema} fill={colores.crema} size={14} />
            <Texto variante="cuerpoBold" style={{ color: colores.crema }}>{p.costo}</Texto>
          </BotonKawaii>
        </Tarjeta>
      ))}

      {inedito ? (
        <Tarjeta>
          <Texto variante="etiqueta" style={{ marginBottom: 10 }}>{inedito.tipo === 'foto' ? 'Foto inédita' : 'Audio inédito'}</Texto>
          {inedito.tipo === 'foto' && inedito.url ? <Image source={{ uri: inedito.url }} style={{ width: '100%', aspectRatio: 1, borderRadius: 20 }} contentFit="cover" /> : null}
          {inedito.texto ? <Texto variante="manuscritaGrande" style={{ marginTop: 10 }}>{inedito.texto}</Texto> : null}
          {inedito.tipo === 'audio' && inedito.url ? <ReproductorAudio uri={inedito.url} /> : null}
          <Texto variante="apoyo" style={{ marginTop: 8 }}>Ya es tuyo: queda en el Baúl o en el Botiquín.</Texto>
        </Tarjeta>
      ) : null}

      {/* Ruleta */}
      <Tarjeta fondo={colores.rosaSuave} sinSombra borde={colores.rosaClaro}>
        <Pressable onPress={() => setRuleta(!ruleta)} style={estilos.fila}>
          <Figura forma="corazon" c1={colores.rosaFuerte} c2={colores.rosaFuerte} size={36} />
          <View style={{ flex: 1 }}>
            <Texto variante="titulo">Ruleta de citas</Texto>
            <Texto variante="apoyo">Un giro por semana. Lo que salga, se hace.</Texto>
          </View>
        </Pressable>
        {ruleta ? <View style={{ marginTop: 16 }}><Ruleta /></View> : null}
      </Tarjeta>

      {/* Cupones */}
      <Texto variante="titulo">Cupones canjeables</Texto>
      <Texto variante="apoyo">Los caros son caros a propósito. Se canjean cara a cara.</Texto>
      {disponibles.length === 0 ? <Tarjeta sinSombra><Texto variante="apoyo">No hay cupones nuevos. Él sabe que tiene que subir más.</Texto></Tarjeta> : null}
      {disponibles.map((c) => (
        <Tarjeta key={c.id} sinSombra style={[sombras.rosadaSuave, estilos.cupon]}>
          <Figura forma="lazo" c1={colores.rosaFuerte} c2={colores.rosaTinta} size={40} />
          <View style={{ flex: 1, gap: 4 }}>
            <Texto variante="cuerpoBold">{c.titulo}</Texto>
            {c.descripcion ? <Texto variante="apoyo">{c.descripcion}</Texto> : null}
          </View>
          <BotonKawaii onPress={() => comprar(c)} disabled={besitos < c.costo} style={{ paddingHorizontal: 14 }}>
            <Corazon color={colores.crema} fill={colores.crema} size={14} />
            <Texto variante="cuerpoBold" style={{ color: colores.crema }}>{c.costo}</Texto>
          </BotonKawaii>
        </Tarjeta>
      ))}

      {mios.length ? <Texto variante="titulo" style={{ marginTop: 8 }}>Mis cupones</Texto> : null}
      {mios.map((c) => (
        <Tarjeta key={c.id} fondo={c.usado_en ? colores.crema : colores.menta} sinSombra style={estilos.cupon}>
          <View style={{ flex: 1, gap: 4 }}>
            <Texto variante="cuerpoBold">{c.titulo}</Texto>
            <Texto variante="apoyo">{c.usado_en ? 'Ya canjeado' : 'Muéstrale el QR. Él lo escanea y queda usado.'}</Texto>
          </View>
          {!c.usado_en ? (
            <Pressable onPress={() => setQr(qr?.id === c.id ? null : c)} style={estilos.qr}>
              <QRCode value={`palomita:cupon:${c.qr_token}`} size={56} color={colores.carbon} backgroundColor={colores.crema} />
            </Pressable>
          ) : null}
        </Tarjeta>
      ))}
      {qr ? (
        <Tarjeta style={{ alignItems: 'center', gap: 10 }}>
          <QRCode value={`palomita:cupon:${qr.qr_token}`} size={220} color={colores.carbon} backgroundColor={colores.crema} />
          <Texto variante="cuerpoBold">{qr.titulo}</Texto>
          <Texto variante="apoyo">Código {qr.qr_token.slice(0, 6)} por si el escáner falla.</Texto>
        </Tarjeta>
      ) : null}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  saldo: { alignItems: 'center', gap: 4 },
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cupon: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  qr: { padding: 4, borderRadius: radios.tarjetaChica, backgroundColor: colores.crema, borderWidth: 2, borderColor: colores.mentaTexto },
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.carbon },
});
