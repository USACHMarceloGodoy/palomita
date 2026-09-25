import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Mascota } from '@/components/Mascota';
import { Carita } from '@/components/Carita';
import { Figura } from '@/components/Figuras';
import { Corazon, Marcador } from '@/components/Iconos';
import { config, checkinDeHoy, marcarVisto, mensajeDelDia, multiverso, nuevaVariante } from '@/lib/contenido';
import { saldo, PRECIOS } from '@/lib/economia';
import { estadoMascota, subirAnimo } from '@/lib/mascota';
import { comprarComida } from '@/lib/tienda';
import { extras } from '@/lib/sorpresas';
import { Tesorito } from '@/components/Tesorito';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { eventoDeHoy, eventosDelCalendario, particulaDeHoy, type Evento } from '@/lib/eventos';
import { ultimaNota, type Nota } from '@/lib/autor';
import { useSesion } from '@/lib/sesion';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { PalomitaWidget } from '@/widgets/PalomitaWidget';
import { diasEntre, fechaLarga } from '@/lib/fechas';
import { colores, radios, sombras } from '@/lib/tema';
import { EMOJIS, type Checkin, type Config, type Mensaje, type Variante } from '@/lib/tipos';

export default function Inicio() {
  const router = useRouter();
  const [cfg, setCfg] = useState<Config | null>(null);
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [besitos, setBesitos] = useState(0);
  const [variante, setVariante] = useState<Variante | null>(null);
  const [descubiertas, setDescubiertas] = useState(0);
  const [animo, setAnimo] = useState(0.5);
  const [fraseMascota, setFraseMascota] = useState('Palomita está tranquila');
  const [bazinga, setBazinga] = useState<string | null>(null);
  const [festejo, setFestejo] = useState(false);
  const [tipoEntrada, setTipoEntrada] = useState<TipoParticula | null>(null);
  const [eventoEspecial, setEventoEspecial] = useState<Evento | null>(null);
  const [bannerCerrado, setBannerCerrado] = useState(false);
  const [tipoHoy, setTipoHoy] = useState<TipoParticula>('sorpresa');
  const [nota, setNota] = useState<Nota | null>(null);
  const { rol } = useSesion();
  const [mostrarParticulas, setMostrarParticulas] = useState(false);

  // Al llegar del splash, las partículas del día siguen cayendo un par de
  // segundos más acá antes de apagarse solas. Corre solo al montar, no en
  // cada vez que se vuelve a esta pestaña.
  useEffect(() => {
    let vivo = true;
    eventosDelCalendario()
      .then((ev) => {
        if (!vivo) return;
        const { tipo } = particulaDeHoy(ev);
        setTipoEntrada(tipo);
        setTipoHoy(tipo);
        setTimeout(() => { if (vivo) setTipoEntrada(null); }, 3000);
        const especial = eventoDeHoy(ev);
        if (especial?.mensaje) setEventoEspecial(especial);
      })
      .catch(() => {});
    return () => { vivo = false; };
  }, []);

  // Interruptor: las partículas se quedan cayendo hasta que lo vuelva a tocar.
  function verParticulas() {
    setMostrarParticulas((v) => !v);
  }

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      (async () => {
        const [c, m, ch, s, mv] = await Promise.all([config(), mensajeDelDia(), checkinDeHoy(), saldo(), multiverso()]);
        if (!vivo) return;
        setCfg(c);
        setMensaje(m);
        setCheckin(ch);
        setBesitos(s);
        setDescubiertas(mv.filter((v) => v.descubierto_en).length);
        setVariante(mv.find((v) => v.descubierto_en) ?? null);
        const em = await estadoMascota();
        if (!vivo) return;
        setAnimo(em.animo01);
        setFraseMascota(em.frase);
        ultimaNota().then((n) => { if (vivo) setNota(n); }).catch(() => {});
        requestWidgetUpdate({
          widgetName: 'Palomita',
          renderWidget: () => <PalomitaWidget dias={diasEntre(c.fecha_inicio)} mensaje={m?.texto?.split('\n')[0] ?? 'Hay algo para ti.'} frase={em.frase} />,
        }).catch(() => {});
        if (m && !m.visto_en) {
          await marcarVisto(m.id);
          await subirAnimo(10, 'mensaje').catch(() => {});
          const em2 = await estadoMascota();
          if (vivo) { setMensaje({ ...m, visto_en: new Date().toISOString() }); setAnimo(em2.animo01); setFraseMascota(em2.frase); }
        }
      })().catch(() => {});
      return () => { vivo = false; };
    }, []),
  );

  async function otraVariante() {
    const v = await nuevaVariante();
    if (v) {
      setVariante(v);
      const mv = await multiverso();
      setDescubiertas(mv.filter((x) => x.descubierto_en).length);
    }
  }

  async function alimentar() {
    const ok = await comprarComida().catch(() => false);
    if (!ok) return;
    const em = await estadoMascota();
    setAnimo(em.animo01); setFraseMascota(em.frase);
    setBesitos(await saldo());
    setFestejo(true); setTimeout(() => setFestejo(false), 2500);
  }

  async function bazingaLargo() {
    const e = await extras();
    setBazinga(e.chiste);
    setTimeout(() => setBazinga(null), 5000);
  }

  const nombre = cfg?.nombre_ella ?? '…';
  const dias = cfg ? diasEntre(cfg.fecha_inicio) : 0;
  const especial = eventoEspecial?.mensaje_dia?.trim() || null;

  return (
    <Pantalla>
      <Tesorito pantalla="inicio" />
      {festejo ? <Particulas tipo="comida" densidad={12} duracion={2000} /> : null}
      {tipoEntrada ? <Particulas tipo={tipoEntrada} densidad={20} duracion={2400} /> : null}
      {mostrarParticulas ? <Particulas tipo={tipoHoy} densidad={24} /> : null}
      {eventoEspecial && !bannerCerrado ? (
        <>
          <Particulas tipo={eventoEspecial.tipo_particula} densidad={22} />
          <Tarjeta fondo={colores.crema} sinSombra style={estilos.bannerEspecial}>
            <Pressable accessibilityLabel="Cerrar" onPress={() => setBannerCerrado(true)} style={estilos.cerrarBanner}>
              <Texto variante="cuerpoBold" style={{ fontSize: 20, color: colores.gris }}>×</Texto>
            </Pressable>
            <Girasoles />
            <Texto variante="manuscritaGrande" style={estilos.bannerTexto}>{eventoEspecial.mensaje}</Texto>
          </Tarjeta>
        </>
      ) : null}
      <View style={estilos.cabecera}>
        <View style={{ flex: 1 }}>
          <Pressable onLongPress={bazingaLargo} delayLongPress={900}>
            <Texto variante="manuscrita">{fechaLarga()}</Texto>
          </Pressable>
          <View style={estilos.filaHola}>
            <Texto variante="tituloGrande">Hola, {nombre}</Texto>
            <Pressable
              accessibilityLabel={mostrarParticulas ? 'Apagar las partículas' : 'Ver partículas cayendo'}
              onPress={verParticulas}
              style={[estilos.botonChispa, mostrarParticulas && estilos.botonChispaOn]}
            >
              <Texto style={{ fontSize: 20 }}>✨</Texto>
            </Pressable>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 6 }}>
          <View style={estilos.saldo}>
            <Corazon color={colores.rosaFuerte} fill={colores.rosaFuerte} size={18} />
            <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta }}>{besitos}</Texto>
          </View>
          {rol === 'autor' ? (
            <Pressable onPress={() => router.push('/autor')} style={estilos.autor}>
              <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.crema }}>Modo autor</Texto>
            </Pressable>
          ) : null}
        </View>
      </View>

      {bazinga ? (
        <View style={[estilos.chip, { backgroundColor: colores.carbon, alignSelf: 'stretch' }]}>
          <Texto variante="cuerpoBold" style={{ color: colores.amarillo }}>¡Bazinga!</Texto>
          <Texto variante="apoyo" style={{ color: colores.crema, flex: 1 }}>{bazinga}</Texto>
        </View>
      ) : null}
      <View style={estilos.chip}>
        <Corazon color={colores.rosaMedio} fill={colores.rosaMedio} size={14} />
        <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.gris }}>{dias} días juntos</Texto>
      </View>

      {nota ? (
        <Pressable onPress={() => router.push({ pathname: '/nota', params: { id: nota.id } })}>
          <Tarjeta fondo={colores.crema} borde={colores.amarillo} style={estilos.nota}>
            <View style={estilos.fila}>
              <Texto variante="etiqueta">Te dejó una nota</Texto>
              {!nota.visto_en ? <View style={estilos.nuevo}><Texto variante="cuerpoBold" style={{ fontSize: 12 }}>nueva</Texto></View> : null}
            </View>
            <Texto variante="manuscritaGrande" style={{ marginTop: 10, fontSize: 19 }} numberOfLines={2}>
              {nota.texto ?? 'Te dibujó algo.'}
            </Texto>
            <Texto variante="apoyo" style={{ marginTop: 8, fontSize: 12 }}>
              {nota.visto_en ? 'Tócala para volver a verla' : 'Tócala para abrirla'}
            </Texto>
          </Tarjeta>
        </Pressable>
      ) : null}

      <Tarjeta>
        <View style={estilos.fila}>
          <Texto variante="etiqueta">{especial ? 'Para hoy' : 'Mensaje del día'}</Texto>
          {!especial && mensaje && !mensaje.visto_en ? <View style={estilos.nuevo}><Texto variante="cuerpoBold" style={{ fontSize: 12 }}>nuevo</Texto></View> : null}
        </View>
        <Texto variante="manuscritaGrande" style={{ marginTop: 12 }}>
          {especial ?? mensaje?.texto ?? 'Hoy no hay mensaje todavía. Vuelve más tarde.'}
        </Texto>
        {especial ? null : (
          <View style={[estilos.fila, { marginTop: 16 }]}>
            <Texto variante="apoyo">{mensaje?.fecha_publicacion ? 'Escrito para hoy' : 'De la base de mensajes'}</Texto>
            <Pressable accessibilityLabel="Guardar este mensaje en el Baúl" style={estilos.botonRedondo}>
              <Marcador color={colores.rosaTinta} />
            </Pressable>
          </View>
        )}
      </Tarjeta>

      <Tarjeta sinSombra style={sombras.rosadaSuave}>
        <Texto variante="titulo">¿Cómo estuvo tu día?</Texto>
        <Texto variante="apoyo" style={{ marginBottom: 14 }}>
          {checkin ? `Hoy dijiste: ${checkin.emoji}. Ya le llegó a él.` : 'Toca una carita. Si no quieres escribir, no escribas.'}
        </Texto>
        <View style={estilos.caritas}>
          {EMOJIS.map((e) => (
            <Pressable
              key={e}
              accessibilityLabel={e}
              onPress={() => router.push({ pathname: '/checkin', params: { emoji: e } })}
              style={[estilos.carita, checkin?.emoji === e && estilos.caritaActiva]}
            >
              <Carita emoji={e} size={34} />
              <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.gris }}>{e}</Texto>
            </Pressable>
          ))}
        </View>
      </Tarjeta>

      <Tarjeta fondo={colores.rosaSuave} sinSombra borde={colores.rosaClaro} style={estilos.mascotaCard}>
        <Mascota size={78} animo={animo} />
        <View style={{ flex: 1, gap: 7 }}>
          <Texto variante="titulo">{fraseMascota}</Texto>
          <Texto variante="apoyo">{mensaje?.visto_en ? 'Subió cuando leíste el mensaje de hoy.' : 'Lee el mensaje de hoy para animarla.'}</Texto>
          <View style={estilos.barra}><View style={[estilos.barraLlena, { width: `${Math.round(animo * 100)}%` }]} /></View>
          <Pressable onPress={alimentar} disabled={besitos < PRECIOS.comida} style={{ alignSelf: 'flex-start', minHeight: 36, justifyContent: 'center' }}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: besitos < PRECIOS.comida ? colores.gris : colores.rosaTinta }}>Darle de comer · {PRECIOS.comida} besitos</Texto>
          </Pressable>
        </View>
      </Tarjeta>

      <Tarjeta fondo={colores.lavanda} sinSombra>
        <View style={estilos.fila}>
          <Texto variante="titulo">Multiverso del te amo</Texto>
          <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.lavandaTexto }}>{descubiertas} descubiertas</Texto>
        </View>
        <View style={estilos.cajaVariante}>
          <Texto>{variante?.texto ?? 'Toca el botón y te doy la primera.'}</Texto>
        </View>
        <BotonKawaii titulo="Dame otra forma" onPress={otraVariante} style={{ marginTop: 12 }} />
        <Pressable onPress={() => router.push('/multiverso')} style={{ alignSelf: 'center', marginTop: 10, minHeight: 44, justifyContent: 'center' }}>
          <Texto variante="cuerpoBold" style={{ color: colores.lavandaTexto, fontSize: 14, textDecorationLine: 'underline' }}>Ver las que ya encontré</Texto>
        </Pressable>
      </Tarjeta>
    </Pantalla>
  );
}

// Varios girasoles en una enredadera, uno gigante al centro — el detalle del
// 21 de septiembre. Posiciones fijas (a mano, no random) para que la
// composición se vea igual siempre.
function Girasoles() {
  const chicos: { size: number; left: number; top: number; rot: number }[] = [
    { size: 46, left: 4, top: 6, rot: -18 },
    { size: 50, left: 208, top: 0, rot: 16 },
    { size: 40, left: 0, top: 108, rot: 24 },
    { size: 44, left: 222, top: 112, rot: -22 },
    { size: 34, left: 112, top: 146, rot: 8 },
  ];
  return (
    <View style={estilos.girasoles}>
      <Svg width={272} height={190} style={StyleSheet.absoluteFill}>
        <Path d="M14 158 C 70 118, 92 188, 150 138 S 228 92 262 118" stroke="#3E8A62" strokeWidth={4} fill="none" strokeLinecap="round" />
        <Ellipse cx={68} cy={126} rx={10} ry={5} fill="#5FA876" transform="rotate(-32 68 126)" />
        <Ellipse cx={186} cy={116} rx={10} ry={5} fill="#5FA876" transform="rotate(24 186 116)" />
        <Ellipse cx={230} cy={98} rx={9} ry={4.5} fill="#5FA876" transform="rotate(-12 230 98)" />
      </Svg>
      {chicos.map((f, i) => (
        <View key={i} style={{ position: 'absolute', left: f.left, top: f.top, transform: [{ rotate: `${f.rot}deg` }] }}>
          <Figura forma="girasol" c1="#FFD93D" c2="#6B4A2A" size={f.size} />
        </View>
      ))}
      <View style={{ position: 'absolute', left: 61, top: 16 }}>
        <Figura forma="girasol" c1="#FFD93D" c2="#6B4A2A" size={150} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  filaHola: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  botonChispa: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colores.crema, ...sombras.rosadaSuave },
  botonChispaOn: { backgroundColor: colores.amarillo },
  saldo: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radios.boton, backgroundColor: colores.crema, ...sombras.rosadaSuave },
  chip: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 6, paddingHorizontal: 13, borderRadius: radios.boton, backgroundColor: colores.crema },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  nuevo: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radios.boton, backgroundColor: colores.amarillo },
  botonRedondo: { width: 44, height: 44, borderRadius: radios.boton, backgroundColor: colores.rosaBase, alignItems: 'center', justifyContent: 'center' },
  caritas: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  carita: { alignItems: 'center', gap: 5, width: 60, minHeight: 74, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colores.rosaClaro },
  caritaActiva: { backgroundColor: colores.rosaBase, borderColor: colores.rosaTinta },
  mascotaCard: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16 },
  barra: { height: 10, borderRadius: radios.boton, backgroundColor: colores.rosaClaro, overflow: 'hidden' },
  barraLlena: { height: '100%', borderRadius: radios.boton, backgroundColor: colores.rosaFuerte },
  cajaVariante: { minHeight: 74, justifyContent: 'center', marginTop: 12, padding: 14, borderRadius: radios.tarjetaChica, backgroundColor: colores.crema, borderWidth: 2, borderStyle: 'dashed', borderColor: colores.lavandaBorde },
  nota: { borderWidth: 2 },
  autor: { minHeight: 32, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colores.carbon, alignItems: 'center', justifyContent: 'center' },
  bannerEspecial: { alignItems: 'center', paddingVertical: 24, paddingHorizontal: 20, borderWidth: 2, borderColor: '#FFD93D' },
  girasoles: { width: 272, height: 190 },
  cerrarBanner: { position: 'absolute', top: 8, right: 8, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  bannerTexto: { textAlign: 'center', marginTop: 14, fontSize: 20, lineHeight: 26 },
});
