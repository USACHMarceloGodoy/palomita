// Pestaña Mascota = la casa. Todo lo demás (tienda, armario, minijuegos...)
// cuelga del menú hamburguesa de la esquina inferior derecha.
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Corazon } from '@/components/Iconos';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { Barras } from '@/components/mascota/Barras';
import { Habitacion } from '@/components/mascota/Habitacion';
import { IconoItem, IconoUI } from '@/components/mascota/IconosMascota';
import { MascotaVirtual } from '@/components/mascota/MascotaVirtual';
import { MenuMascota } from '@/components/mascota/MenuMascota';
import { abrirRegalo, acariciar, alimentar, banar, regalosNuevos } from '@/lib/mascota-virtual/acciones';
import { item } from '@/lib/mascota-virtual/catalogo';
import { momentoDia, NOMBRE_TEMPORADA, temporada } from '@/lib/mascota-virtual/tiempo';
import type { Regalo } from '@/lib/mascota-virtual/tipos';
import { useMascota } from '@/lib/mascota-virtual/useMascota';
import { colores, radios, sombras } from '@/lib/tema';

export default function PantallaMascota() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { rol, mascota, valores, animo, saldo, inventario, cargando, recargar } = useMascota();
  const [festejo, setFestejo] = useState<TipoParticula | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [comida, setComida] = useState(false);
  const [bano, setBano] = useState(false);
  const [regalos, setRegalos] = useState<Regalo[]>([]);
  const [caricias, setCaricias] = useState(0);

  useEffect(() => {
    if (!cargando && !mascota) router.replace('/mascota/personalizar?nueva=1');
  }, [cargando, mascota]);

  useEffect(() => { regalosNuevos(rol).then(setRegalos).catch(() => {}); }, [rol, cargando]);

  function celebrar(tipo: TipoParticula, texto: string) {
    setFestejo(tipo); setAviso(texto);
    setTimeout(() => { setFestejo(null); setAviso(null); }, 2600);
  }

  async function darComida(id: string) {
    setComida(false);
    const r = await alimentar(rol, id).catch(() => ({ ok: false, besitos: 0 }));
    if (!r.ok) { setAviso('No quedó nada de eso.'); setTimeout(() => setAviso(null), 2000); return; }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    celebrar('comida', r.besitos ? `Ñam. +${r.besitos} besitos` : 'Ñam.');
    recargar();
  }

  async function cariño() {
    setCaricias((c) => c + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (caricias + 1 < 5) return;
    setCaricias(0);
    const b = await acariciar(rol).catch(() => 0);
    celebrar('corazones', b ? `Le encantó. +${b} besitos` : 'Le encantó.');
    recargar();
  }

  async function abrir(r: Regalo) {
    await abrirRegalo(rol, r).catch(() => {});
    setRegalos((l) => l.filter((x) => x.id !== r.id));
    celebrar('kawaii', `Regalo de tu pareja: ${item(r.item_id)?.nombre ?? 'algo lindo'}`);
    recargar();
  }

  const comestibles = inventario.filter((i) => { const it = item(i.item_id); return it?.efecto && (it.categoria === 'comida' || it.categoria === 'plato'); });
  const anchoCasa = Math.min(width - 40, 420);
  const evento = temporada();
  const noche = momentoDia() === 'noche';

  if (!mascota) return <Pantalla fondo={colores.rosaBase} />;

  return (
    <View style={{ flex: 1 }}>
      <Pantalla fondo={colores.rosaBase}>
        {festejo ? <Particulas tipo={festejo} densidad={16} duracion={2200} /> : null}

        <View style={estilos.cabecera}>
          <View style={{ flex: 1 }}>
            <Texto variante="tituloGrande">{mascota.nombre}</Texto>
            <Texto variante="apoyo">{animo.frase}{evento ? ` · ${NOMBRE_TEMPORADA[evento]}` : ''}</Texto>
          </View>
          <View style={estilos.saldo} accessibilityLabel={`${saldo} besitos`}>
            <Corazon color={colores.rosaTinta} fill={colores.rosaFuerte} size={18} />
            <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta }}>{saldo}</Texto>
          </View>
        </View>

        {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

        <View style={{ alignSelf: 'center', ...sombras.rosada }}>
          <Habitacion decoracion={mascota.decoracion} ancho={anchoCasa}>
            <Pressable onPress={cariño} accessibilityRole="button" accessibilityLabel={`Acariciar a ${mascota.nombre}`}>
              <MascotaVirtual
                especie={mascota.especie} orejas={mascota.orejas} hocico={mascota.hocico}
                c1={mascota.color_pelaje} c2={mascota.color_secundario} look={mascota.look}
                animo={animo.animo01} size={anchoCasa * 0.42} durmiendo={noche && valores.afecto > 30}
              />
            </Pressable>
          </Habitacion>
        </View>

        {regalos.length ? (
          <Tarjeta fondo={colores.rosaSuave} borde={colores.rosaClaro} sinSombra style={{ padding: 14, gap: 8 }}>
            <Texto variante="cuerpoBold">Tu pareja te dejó {regalos.length === 1 ? 'un regalo' : `${regalos.length} regalos`}</Texto>
            {regalos.map((r) => (
              <Pressable key={r.id} onPress={() => abrir(r)} style={estilos.regalo} accessibilityRole="button">
                <IconoUI clave="regalo" color={colores.rosaTinta} />
                <View style={{ flex: 1 }}>
                  <Texto variante="cuerpoBold" style={{ fontSize: 14 }}>{item(r.item_id)?.nombre ?? 'Regalo'}</Texto>
                  {r.mensaje ? <Texto variante="apoyo" style={{ fontSize: 13 }}>{r.mensaje}</Texto> : null}
                </View>
                <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 13 }}>Abrir</Texto>
              </Pressable>
            ))}
          </Tarjeta>
        ) : null}

        <Tarjeta fondo={colores.crema} sinSombra>
          <Barras valores={valores} />
        </Tarjeta>

        <View style={estilos.acciones}>
          <Accion clave="alimentar" titulo="Alimentar" onPress={() => setComida(true)} destacada={valores.hambre < 30} />
          <Accion clave="banar" titulo="Bañar" onPress={() => setBano(true)} destacada={valores.higiene < 30} />
          <Accion clave="acariciar" titulo="Acariciar" onPress={cariño} destacada={valores.afecto < 30} />
          <Accion clave="vestir" titulo="Vestir" onPress={() => router.push('/mascota/armario')} />
        </View>
        <Texto variante="apoyo" style={{ textAlign: 'center', fontSize: 13 }}>
          {caricias > 0 ? `${5 - caricias} caricias más` : 'Tócala cinco veces para acariciarla. El menú de abajo tiene todo lo demás.'}
        </Texto>
        <View style={{ height: 70 }} />
      </Pantalla>

      <MenuMascota avisos={regalos.length ? { visita: String(regalos.length) } : {}} />

      {/* Elegir comida */}
      <Modal visible={comida} transparent animationType="fade" onRequestClose={() => setComida(false)}>
        <Pressable style={estilos.velo} onPress={() => setComida(false)}>
          <Pressable style={estilos.hoja} onPress={() => {}}>
            <Texto variante="titulo">¿Qué le damos?</Texto>
            {comestibles.length ? (
              <View style={estilos.rejilla}>
                {comestibles.map((i) => {
                  const it = item(i.item_id)!;
                  return (
                    <Pressable key={i.item_id} onPress={() => darComida(i.item_id)} style={estilos.celda} accessibilityRole="button" accessibilityLabel={`${it.nombre}, ${i.cantidad}`}>
                      <IconoItem item={it} size={44} />
                      <Texto variante="cuerpoBold" style={{ fontSize: 12 }} numberOfLines={1}>{it.nombre}</Texto>
                      <Texto variante="apoyo" style={{ fontSize: 11 }}>×{i.cantidad} · +{it.efecto?.hambre ?? 0}</Texto>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Texto variante="apoyo">No tienes comida. La tienda vende manzanas, galletas y más.</Texto>
            )}
            <BotonKawaii titulo="Ir a la tienda" variante="secundario" onPress={() => { setComida(false); router.push('/mascota/tienda'); }} />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Baño: reventar burbujas */}
      <Modal visible={bano} transparent animationType="fade" onRequestClose={() => setBano(false)}>
        <Bano
          nombre={mascota.nombre}
          onCerrar={() => setBano(false)}
          onListo={async () => {
            setBano(false);
            const b = await banar(rol).catch(() => 0);
            celebrar('lluvia', b ? `Limpita. +${b} besitos` : 'Limpita.');
            recargar();
          }}
        />
      </Modal>
    </View>
  );
}

function Accion({ clave, titulo, onPress, destacada }: { clave: 'alimentar' | 'banar' | 'acariciar' | 'vestir'; titulo: string; onPress: () => void; destacada?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={titulo} style={{ alignItems: 'center', gap: 6 }}>
      <View style={[estilos.botonAccion, destacada && { backgroundColor: colores.rosaTinta }]}>
        <IconoUI clave={clave} color={destacada ? colores.crema : colores.rosaTinta} size={24} />
      </View>
      <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.gris }}>{titulo}</Texto>
    </Pressable>
  );
}

// Seis burbujas de jabón; tocarlas todas la deja limpia. Solo toques.
function Bano({ nombre, onCerrar, onListo }: { nombre: string; onCerrar: () => void; onListo: () => void }) {
  const [rotas, setRotas] = useState<number[]>([]);
  const burbujas = [{ x: 12, y: 10, s: 62 }, { x: 60, y: 30, s: 48 }, { x: 30, y: 52, s: 56 }, { x: 70, y: 62, s: 44 }, { x: 8, y: 74, s: 50 }, { x: 48, y: 80, s: 40 }];
  useEffect(() => { if (rotas.length === burbujas.length) setTimeout(onListo, 500); }, [rotas.length]);
  return (
    <Pressable style={estilos.velo} onPress={onCerrar}>
      <Pressable style={[estilos.hoja, { backgroundColor: '#E8F6FF', minHeight: 340 }]} onPress={() => {}}>
        <Texto variante="titulo">Hora del baño</Texto>
        <Texto variante="apoyo">Revienta las burbujas para enjabonar a {nombre}.</Texto>
        <View style={{ height: 230 }}>
          {burbujas.map((b, i) => rotas.includes(i) ? null : (
            <Pressable
              key={i}
              onPress={() => { Haptics.selectionAsync().catch(() => {}); setRotas((r) => [...r, i]); }}
              accessibilityRole="button" accessibilityLabel="Burbuja"
              style={{ position: 'absolute', left: `${b.x}%`, top: `${b.y}%`, width: b.s, height: b.s, borderRadius: b.s / 2, backgroundColor: 'rgba(107,200,232,0.35)', borderWidth: 2, borderColor: '#6BC8E8' }}
            >
              <View style={{ position: 'absolute', top: b.s * 0.18, left: b.s * 0.2, width: b.s * 0.22, height: b.s * 0.14, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.8)' }} />
            </Pressable>
          ))}
        </View>
        <Texto variante="apoyo" style={{ textAlign: 'center' }}>{burbujas.length - rotas.length} burbujas</Texto>
      </Pressable>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saldo: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radios.boton, backgroundColor: colores.crema, ...sombras.rosadaSuave },
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.rosaTinta },
  acciones: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
  botonAccion: { width: 56, height: 56, borderRadius: 18, backgroundColor: colores.crema, alignItems: 'center', justifyContent: 'center', ...sombras.rosadaSuave },
  regalo: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colores.crema, borderRadius: 16, padding: 12, minHeight: 48 },
  velo: { flex: 1, backgroundColor: 'rgba(74,59,69,0.35)', justifyContent: 'flex-end' },
  hoja: { backgroundColor: colores.crema, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 32, gap: 14 },
  rejilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  celda: { width: '30%', flexGrow: 1, backgroundColor: colores.rosaSuave, borderRadius: 16, padding: 10, alignItems: 'center', gap: 4, minHeight: 90 },
});
