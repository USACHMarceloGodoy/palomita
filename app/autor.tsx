import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Carita } from '@/components/Carita';
import { VistaDibujo } from '@/components/VistaDibujo';
import { Flecha } from '@/components/Iconos';
import { FormularioAutor, val, type Campo, type Valores } from '@/components/FormularioAutor';
import {
  crearAnimo, crearAnimoAudio, crearCapitulo, crearCapsula, crearCuento, crearCupon, crearEvento,
  crearLugar, crearMensaje, crearPalabra, crearPremioRuleta, crearPregunta, crearRecuerdo,
  crearRespuestaCheckin, crearVariante, hiloDeNotas, inventario, inventarioBotiquin, leerDibujo,
  mensajesProgramados, saldoDeElla, subirArchivo, ultimasAlertas, ultimosCheckins,
  type Alerta, type Nota,
} from '@/lib/autor';
import { diagnosticoPush, type DiagnosticoPush } from '@/lib/notificaciones';
import { fechaCorta, hoyChile } from '@/lib/fechas';
import { useSesion } from '@/lib/sesion';
import { colores, radios } from '@/lib/tema';
import type { CategoriaBotiquin, Checkin, Mensaje } from '@/lib/tipos';

// El panel de escritorio, completo, desde el teléfono. Un menú con todo lo
// que se puede crear y, dentro de cada uno, un formulario. La idea es no
// tener que abrir el computador para subirle algo.
//
// Todo pasa por las RLS: si la sesión no es la del autor, estas pantallas no
// guardan nada aunque se llegue a ellas.

type Seccion =
  | 'menu' | 'nota' | 'mensaje' | 'botiquin' | 'botiquin-audio' | 'multiverso' | 'recuerdo'
  | 'cuento' | 'trivia' | 'diccionario' | 'capitulo' | 'capsula' | 'cupon' | 'ruleta'
  | 'evento' | 'lugar' | 'respuesta' | 'ella';

const MENU: { id: Seccion; titulo: string; nota: string; tabla?: string }[] = [
  { id: 'nota', titulo: 'Nota del día', nota: 'Texto o dibujo, le llega al tiro', tabla: 'notas' },
  { id: 'mensaje', titulo: 'Mensaje del día', nota: 'Notas, poemas, extractos', tabla: 'mensajes' },
  { id: 'botiquin', titulo: 'Botiquín · texto', nota: 'Los cuatro botones de Ayuda', tabla: 'botiquin' },
  { id: 'botiquin-audio', titulo: 'Botiquín · audio', nota: 'Tu voz para cuando lo necesite' },
  { id: 'recuerdo', titulo: 'Baúl', nota: 'Fotos con su historia', tabla: 'recuerdos' },
  { id: 'cuento', titulo: 'Cuentos', nota: 'Para el Modo dormir', tabla: 'cuentos' },
  { id: 'multiverso', titulo: 'Multiverso', nota: 'Formas de decir te amo', tabla: 'multiverso' },
  { id: 'capsula', titulo: 'Cápsulas', nota: 'Se abren en una fecha', tabla: 'capsulas' },
  { id: 'trivia', titulo: 'Trivia', nota: 'Preguntas sobre ustedes', tabla: 'trivia' },
  { id: 'diccionario', titulo: 'Diccionario', nota: 'Palabras que solo ustedes usan', tabla: 'diccionario' },
  { id: 'capitulo', titulo: 'Capítulos', nota: 'El drama por entregas', tabla: 'capitulos' },
  { id: 'cupon', titulo: 'Cupones', nota: 'Canjeables con besitos', tabla: 'cupones' },
  { id: 'ruleta', titulo: 'Ruleta', nota: 'Premios del giro semanal', tabla: 'ruleta' },
  { id: 'evento', titulo: 'Calendario', nota: 'Días especiales y partículas', tabla: 'eventos' },
  { id: 'lugar', titulo: 'Lugares', nota: 'Se desbloquean al llegar', tabla: 'lugares' },
  { id: 'respuesta', titulo: 'Respuestas', nota: 'Lo que contesta al check-in' },
  { id: 'ella', titulo: 'Cómo está', nota: 'Check-ins, besitos, alertas' },
];

const PARTICULAS = [
  'sorpresa', 'kawaii', 'bichitos', 'comida', 'flores-rosas', 'flores-amarillas', 'rosas',
  'girasoles', 'corazones', 'volantines', 'lazos', 'gatitos', 'capibaras', 'zuricatas',
  'ovejas', 'conejitos', 'frutillas', 'hamburguesitas', 'lanas',
];

const CATEGORIAS: { valor: CategoriaBotiquin; titulo: string }[] = [
  { valor: 'animos', titulo: 'Necesito ánimos' },
  { valor: 'feliz', titulo: 'Estoy feliz' },
  { valor: 'logro', titulo: 'Logré algo' },
  { valor: 'extrano', titulo: 'Te extraño' },
];

export default function Autor() {
  const router = useRouter();
  const [seccion, setSeccion] = useState<Seccion>('menu');
  const [cuentas, setCuentas] = useState<Record<string, number>>({});

  useFocusEffect(useCallback(() => {
    inventario().then(setCuentas).catch(() => {});
  }, [seccion]));

  const actual = MENU.find((m) => m.id === seccion);

  return (
    <Pantalla>
      <View style={estilos.cabecera}>
        <Pressable
          onPress={() => (seccion === 'menu' ? router.back() : setSeccion('menu'))}
          accessibilityLabel="Volver"
          style={estilos.volver}
        >
          <Flecha color={colores.carbon} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Texto variante="tituloGrande" style={{ fontSize: 24 }}>{actual?.titulo ?? 'Modo autor'}</Texto>
          <Texto variante="apoyo">{actual?.nota ?? 'El panel entero, desde tu bolsillo.'}</Texto>
        </View>
      </View>

      {seccion === 'menu' ? <Menu cuentas={cuentas} onElegir={setSeccion} /> : null}
      {seccion === 'nota' ? <SeccionNota /> : null}
      {seccion === 'mensaje' ? <SeccionMensaje /> : null}
      {seccion === 'botiquin' ? <SeccionBotiquin /> : null}
      {seccion === 'botiquin-audio' ? <SeccionBotiquinAudio /> : null}
      {seccion === 'recuerdo' ? <SeccionRecuerdo /> : null}
      {seccion === 'cuento' ? <SeccionCuento /> : null}
      {seccion === 'multiverso' ? <SeccionSimple tipo="multiverso" /> : null}
      {seccion === 'capsula' ? <SeccionSimple tipo="capsula" /> : null}
      {seccion === 'trivia' ? <SeccionTrivia /> : null}
      {seccion === 'diccionario' ? <SeccionSimple tipo="diccionario" /> : null}
      {seccion === 'capitulo' ? <SeccionSimple tipo="capitulo" /> : null}
      {seccion === 'cupon' ? <SeccionSimple tipo="cupon" /> : null}
      {seccion === 'ruleta' ? <SeccionSimple tipo="ruleta" /> : null}
      {seccion === 'evento' ? <SeccionEvento /> : null}
      {seccion === 'lugar' ? <SeccionSimple tipo="lugar" /> : null}
      {seccion === 'respuesta' ? <SeccionSimple tipo="respuesta" /> : null}
      {seccion === 'ella' ? <SeccionElla /> : null}
    </Pantalla>
  );
}

// --- Menú -------------------------------------------------------------------
function Menu({ cuentas, onElegir }: { cuentas: Record<string, number>; onElegir: (s: Seccion) => void }) {
  return (
    <View style={estilos.grilla}>
      {MENU.map((m) => (
        <Pressable key={m.id} onPress={() => onElegir(m.id)} style={estilos.casilla}>
          <Texto variante="cuerpoBold" style={{ fontSize: 14 }}>{m.titulo}</Texto>
          <Texto variante="apoyo" style={{ fontSize: 11 }}>{m.nota}</Texto>
          {m.tabla ? (
            <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.rosaTinta, marginTop: 2 }}>
              {cuentas[m.tabla] ?? 0} guardados
            </Texto>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

// --- Nota: el compositor vive en su propia pantalla, compartido con ella ----
function SeccionNota() {
  const router = useRouter();
  const { rol } = useSesion();
  const yo = rol ?? 'autor';
  const [hilo, setHilo] = useState<Nota[]>([]);
  const [dibujos, setDibujos] = useState<Record<string, string>>({});

  useFocusEffect(useCallback(() => {
    let vivo = true;
    hiloDeNotas(10).then((ns) => {
      if (!vivo) return;
      setHilo(ns);
      for (const n of ns.filter((x) => x.dibujo_path)) {
        leerDibujo(n.dibujo_path!).then((svg) => {
          if (vivo && svg) setDibujos((prev) => ({ ...prev, [n.id]: svg }));
        }).catch(() => {});
      }
    }).catch(() => {});
    return () => { vivo = false; };
  }, []));

  return (
    <>
      <BotonKawaii titulo="Escribir o dibujar una nota" onPress={() => router.push('/escribir-nota')} />
      {hilo.length ? (
        <Tarjeta fondo={colores.cremaClaro} sinSombra style={{ gap: 14 }}>
          <Texto variante="etiqueta">Las últimas</Texto>
          {hilo.map((n) => (
            <View key={n.id} style={[estilos.vieja, n.autor_rol === yo && estilos.mia]}>
              <Texto variante="cuerpoBold" style={{ fontSize: 12, color: colores.gris }}>
                {n.autor_rol === yo ? 'Tú' : 'Ella'} · {fechaCorta(n.creado_en)}
                {n.autor_rol === yo ? (n.visto_en ? ' · la vio' : ' · sin abrir') : ''}
              </Texto>
              {dibujos[n.id] ? <VistaDibujo svg={dibujos[n.id]} alto={120} fondo={colores.crema} /> : null}
              {n.texto ? <Texto style={{ fontSize: 14 }} numberOfLines={3}>{n.texto}</Texto> : null}
            </View>
          ))}
        </Tarjeta>
      ) : null}
    </>
  );
}

// --- Mensaje del día --------------------------------------------------------
function SeccionMensaje() {
  const [programados, setProgramados] = useState<Mensaje[]>([]);
  const recargar = () => mensajesProgramados().then(setProgramados).catch(() => {});
  useFocusEffect(useCallback(() => { recargar(); }, []));

  const campos: Campo[] = [
    { id: 'tipo', etiqueta: 'Tipo', tipo: 'opciones', requerido: true, opciones: [
      { valor: 'nota', titulo: 'Nota' }, { valor: 'poema', titulo: 'Poema' }, { valor: 'extracto', titulo: 'Extracto' },
    ] },
    { id: 'texto', etiqueta: 'El mensaje', tipo: 'multilinea', requerido: true },
    { id: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', placeholder: `AAAA-MM-DD · hoy es ${hoyChile()}`,
      ayuda: 'Con fecha sale ese día a las 09:00 y le llega aviso. Vacío = entra a la base rotativa.' },
  ];

  return (
    <>
      <FormularioAutor
        titulo="Escribir un mensaje"
        campos={campos}
        onGuardar={async (v) => {
          await crearMensaje(val.texto(v, 'texto'), (val.texto(v, 'tipo') || 'nota') as Mensaje['tipo'], val.texto(v, 'fecha') || null);
          await recargar();
        }}
      />
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
function SeccionBotiquin() {
  const [inv, setInv] = useState<Record<string, number>>({});
  const recargar = () => inventarioBotiquin().then(setInv).catch(() => {});
  useFocusEffect(useCallback(() => { recargar(); }, []));

  return (
    <>
      <Tarjeta fondo={colores.cremaClaro} sinSombra style={{ gap: 4 }}>
        <Texto variante="etiqueta">Cuántos hay de cada uno</Texto>
        {CATEGORIAS.map((c) => (
          <Texto key={c.valor} variante="apoyo">{c.titulo}: {inv[c.valor] ?? 0}</Texto>
        ))}
      </Tarjeta>
      <FormularioAutor
        titulo="Sumar un texto"
        descripcion="Cada botón del Botiquín saca uno de estos al azar."
        campos={[
          { id: 'categoria', etiqueta: 'Para qué botón', tipo: 'opciones', requerido: true,
            opciones: CATEGORIAS.map((c) => ({ valor: c.valor, titulo: c.titulo })) },
          { id: 'texto', etiqueta: 'Lo que le dirías', tipo: 'multilinea', requerido: true },
        ]}
        onGuardar={async (v) => {
          await crearAnimo(val.texto(v, 'categoria') as CategoriaBotiquin, val.texto(v, 'texto'));
          await recargar();
        }}
      />
    </>
  );
}

function SeccionBotiquinAudio() {
  return (
    <FormularioAutor
      titulo="Subir un audio tuyo"
      descripcion="Tu voz, para cuando aprieta uno de los botones."
      campos={[
        { id: 'categoria', etiqueta: 'Para qué botón', tipo: 'opciones', requerido: true,
          opciones: CATEGORIAS.map((c) => ({ valor: c.valor, titulo: c.titulo })) },
        { id: 'audio', etiqueta: 'Audio', tipo: 'audio', requerido: true },
        { id: 'inedito', etiqueta: '¿Inédito? (tiene que comprarlo con besitos)', tipo: 'switch' },
      ]}
      onGuardar={async (v) => {
        const a = val.archivo(v, 'audio')!;
        const path = await subirArchivo(a.uri, a.nombre, a.tipo, 'botiquin');
        await crearAnimoAudio(val.texto(v, 'categoria') as CategoriaBotiquin, path, val.si(v, 'inedito'));
      }}
    />
  );
}

// --- Baúl -------------------------------------------------------------------
function SeccionRecuerdo() {
  return (
    <FormularioAutor
      titulo="Agregar al Baúl"
      campos={[
        { id: 'foto', etiqueta: 'Foto', tipo: 'foto', requerido: true },
        { id: 'texto', etiqueta: 'La historia', tipo: 'multilinea', requerido: true, ayuda: 'Lo que pasó ese día, contado por ti.' },
        { id: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', placeholder: 'AAAA-MM-DD (opcional)' },
        { id: 'lugar', etiqueta: 'Lugar', tipo: 'texto', placeholder: 'opcional' },
        { id: 'inedito', etiqueta: '¿Inédita? (la compra con besitos)', tipo: 'switch' },
      ]}
      onGuardar={async (v) => {
        const f = val.archivo(v, 'foto')!;
        const path = await subirArchivo(f.uri, f.nombre, f.tipo, 'recuerdos');
        await crearRecuerdo(path, val.texto(v, 'texto'), val.texto(v, 'fecha'), val.texto(v, 'lugar'), val.si(v, 'inedito'));
      }}
    />
  );
}

// --- Cuentos ----------------------------------------------------------------
function SeccionCuento() {
  return (
    <FormularioAutor
      titulo="Subir un cuento"
      descripcion="Sin serie es un cuento suelto (suena en bucle). Con serie, es un capítulo de una novela."
      campos={[
        { id: 'titulo', etiqueta: 'Título', tipo: 'texto', requerido: true },
        { id: 'audio', etiqueta: 'Audio', tipo: 'audio', requerido: true },
        { id: 'serie', etiqueta: 'Serie', tipo: 'texto', placeholder: 'vacío = cuento suelto' },
        { id: 'numero', etiqueta: 'N° de capítulo', tipo: 'numero', placeholder: '1' },
      ]}
      onGuardar={async (v) => {
        const a = val.archivo(v, 'audio')!;
        const path = await subirArchivo(a.uri, a.nombre, a.tipo, 'cuentos');
        await crearCuento(val.texto(v, 'titulo'), path, val.texto(v, 'serie') || null, val.numero(v, 'numero'));
      }}
    />
  );
}

// --- Trivia -----------------------------------------------------------------
function SeccionTrivia() {
  return (
    <FormularioAutor
      titulo="Nueva pregunta"
      descripcion="Cuatro opciones y cuál es la correcta."
      campos={[
        { id: 'pregunta', etiqueta: 'Pregunta', tipo: 'multilinea', requerido: true },
        { id: 'a', etiqueta: 'Opción 1', tipo: 'texto', requerido: true },
        { id: 'b', etiqueta: 'Opción 2', tipo: 'texto', requerido: true },
        { id: 'c', etiqueta: 'Opción 3', tipo: 'texto', requerido: true },
        { id: 'd', etiqueta: 'Opción 4', tipo: 'texto', requerido: true },
        { id: 'correcta', etiqueta: '¿Cuál es la correcta?', tipo: 'opciones', requerido: true, opciones: [
          { valor: '0', titulo: 'La 1' }, { valor: '1', titulo: 'La 2' },
          { valor: '2', titulo: 'La 3' }, { valor: '3', titulo: 'La 4' },
        ] },
      ]}
      onGuardar={async (v) => {
        const ops = ['a', 'b', 'c', 'd'].map((k) => val.texto(v, k));
        await crearPregunta(val.texto(v, 'pregunta'), ops, Number(val.texto(v, 'correcta')));
      }}
    />
  );
}

// --- Calendario -------------------------------------------------------------
function SeccionEvento() {
  return (
    <FormularioAutor
      titulo="Día especial"
      campos={[
        { id: 'fecha', etiqueta: 'Fecha', tipo: 'fecha', requerido: true, placeholder: `AAAA-MM-DD · hoy es ${hoyChile()}` },
        { id: 'particula', etiqueta: 'Partículas', tipo: 'opciones', requerido: true,
          opciones: PARTICULAS.map((p) => ({ valor: p, titulo: p })) },
        { id: 'mensaje', etiqueta: 'Mensaje del banner', tipo: 'multilinea', ayuda: 'Sale en Inicio con una X para cerrarlo.' },
        { id: 'mensajeDia', etiqueta: 'Mensaje del día especial', tipo: 'multilinea',
          ayuda: 'Reemplaza el mensaje al azar ese día. Sirve para letras de canciones.' },
        { id: 'recurrente', etiqueta: '¿Se repite cada año?', tipo: 'switch' },
      ]}
      onGuardar={async (v) => {
        await crearEvento(
          val.texto(v, 'fecha'), val.texto(v, 'particula') || 'corazones',
          val.texto(v, 'mensaje'), val.texto(v, 'mensajeDia'), val.si(v, 'recurrente'),
        );
      }}
    />
  );
}

// --- Todo lo que es un formulario corto y nada más ---------------------------
type TipoSimple = 'multiverso' | 'capsula' | 'diccionario' | 'capitulo' | 'cupon' | 'ruleta' | 'lugar' | 'respuesta';

const SIMPLES: Record<TipoSimple, { titulo: string; descripcion?: string; campos: Campo[]; guardar: (v: Valores) => Promise<void> }> = {
  multiverso: {
    titulo: 'Otra forma de decir te amo',
    descripcion: 'Las va descubriendo de a una desde Inicio.',
    campos: [
      { id: 'texto', etiqueta: 'La frase', tipo: 'multilinea', requerido: true },
      { id: 'categoria', etiqueta: 'Categoría', tipo: 'texto', placeholder: 'general' },
    ],
    guardar: (v) => crearVariante(val.texto(v, 'texto'), val.texto(v, 'categoria')),
  },
  capsula: {
    titulo: 'Cápsula del tiempo',
    descripcion: 'No existe para ella hasta que llega la fecha.',
    campos: [
      { id: 'titulo', etiqueta: 'Título', tipo: 'texto', requerido: true },
      { id: 'contenido', etiqueta: 'Lo que dice', tipo: 'multilinea', requerido: true },
      { id: 'abre', etiqueta: 'Se abre el', tipo: 'fecha', requerido: true, placeholder: 'AAAA-MM-DD' },
    ],
    guardar: (v) => crearCapsula(val.texto(v, 'titulo'), val.texto(v, 'contenido'), val.texto(v, 'abre'), null),
  },
  diccionario: {
    titulo: 'Palabra del diccionario',
    descripcion: 'De esas que solo ustedes entienden.',
    campos: [
      { id: 'palabra', etiqueta: 'Palabra', tipo: 'texto', requerido: true },
      { id: 'definicion', etiqueta: 'Definición', tipo: 'multilinea', requerido: true, ayuda: 'En tono de diccionario serio, que es lo gracioso.' },
      { id: 'ejemplo', etiqueta: 'Ejemplo de uso', tipo: 'texto' },
    ],
    guardar: (v) => crearPalabra(val.texto(v, 'palabra'), val.texto(v, 'definicion'), val.texto(v, 'ejemplo')),
  },
  capitulo: {
    titulo: 'Capítulo del drama',
    campos: [
      { id: 'numero', etiqueta: 'Número', tipo: 'numero', requerido: true },
      { id: 'titulo', etiqueta: 'Título', tipo: 'texto', requerido: true },
      { id: 'texto', etiqueta: 'El capítulo', tipo: 'multilinea', requerido: true },
      { id: 'publica', etiqueta: 'Se publica el', tipo: 'fecha', requerido: true, placeholder: 'AAAA-MM-DD' },
    ],
    guardar: (v) => crearCapitulo(val.numero(v, 'numero') ?? 1, val.texto(v, 'titulo'), val.texto(v, 'texto'), val.texto(v, 'publica')),
  },
  cupon: {
    titulo: 'Nuevo cupón',
    descripcion: 'Lo compra con besitos y te lo canjea con el QR.',
    campos: [
      { id: 'titulo', etiqueta: 'Qué gana', tipo: 'texto', requerido: true },
      { id: 'descripcion', etiqueta: 'Letra chica', tipo: 'multilinea' },
      { id: 'costo', etiqueta: 'Cuántos besitos', tipo: 'numero', requerido: true, placeholder: '150' },
    ],
    guardar: (v) => crearCupon(val.texto(v, 'titulo'), val.texto(v, 'descripcion'), val.numero(v, 'costo') ?? 100),
  },
  ruleta: {
    titulo: 'Premio de la ruleta',
    descripcion: 'El peso decide qué tan seguido sale. Más peso, más probable.',
    campos: [
      { id: 'titulo', etiqueta: 'El premio', tipo: 'texto', requerido: true },
      { id: 'descripcion', etiqueta: 'Detalle', tipo: 'multilinea' },
      { id: 'peso', etiqueta: 'Peso', tipo: 'numero', placeholder: '1' },
    ],
    guardar: (v) => crearPremioRuleta(val.texto(v, 'titulo'), val.texto(v, 'descripcion'), val.numero(v, 'peso') ?? 1),
  },
  lugar: {
    titulo: 'Lugar con recuerdo',
    descripcion: 'Se le desbloquea cuando pasa cerca.',
    campos: [
      { id: 'titulo', etiqueta: 'Qué lugar es', tipo: 'texto', requerido: true },
      { id: 'lat', etiqueta: 'Latitud', tipo: 'texto', requerido: true, placeholder: '-33.4489', ayuda: 'En Google Maps: mantén apretado el punto y copia las coordenadas.' },
      { id: 'lng', etiqueta: 'Longitud', tipo: 'texto', requerido: true, placeholder: '-70.6693' },
      { id: 'radio', etiqueta: 'Radio en metros', tipo: 'numero', placeholder: '150' },
    ],
    guardar: (v) => crearLugar(val.texto(v, 'titulo'), Number(val.texto(v, 'lat')), Number(val.texto(v, 'lng')), val.numero(v, 'radio') ?? 150),
  },
  respuesta: {
    titulo: 'Respuesta al check-in',
    descripcion: 'Lo que le contesta la app según cómo estuvo su día.',
    campos: [
      { id: 'emoji', etiqueta: 'Para qué ánimo', tipo: 'opciones', requerido: true, opciones: [
        { valor: 'fatal', titulo: 'fatal' }, { valor: 'mal', titulo: 'mal' }, { valor: 'normal', titulo: 'normal' },
        { valor: 'bien', titulo: 'bien' }, { valor: 'genial', titulo: 'genial' },
      ] },
      { id: 'texto', etiqueta: 'La respuesta', tipo: 'multilinea', requerido: true },
    ],
    guardar: (v) => crearRespuestaCheckin(val.texto(v, 'emoji'), val.texto(v, 'texto')),
  },
};

function SeccionSimple({ tipo }: { tipo: TipoSimple }) {
  const s = SIMPLES[tipo];
  return <FormularioAutor titulo={s.titulo} descripcion={s.descripcion} campos={s.campos} onGuardar={s.guardar} />;
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
 * Comprobar el push en este teléfono. El registro normal se traga los errores
 * para que la app no reviente por una notificación, así que sin esto un token
 * que nunca se guarda es invisible.
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
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  casilla: {
    width: '47.5%', flexGrow: 1, minHeight: 92, gap: 2, padding: 14,
    borderRadius: radios.tarjetaChica, backgroundColor: colores.crema, justifyContent: 'center',
  },
  secundario: { minHeight: 46, borderRadius: radios.boton, borderWidth: 2, borderColor: colores.rosaClaro, alignItems: 'center', justifyContent: 'center' },
  filaCheckin: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  filaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vieja: { gap: 6, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: colores.rosaClaro },
  mia: { borderLeftColor: colores.menta },
});
