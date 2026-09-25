import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Figura, type Forma } from '@/components/Figuras';
import { Particulas, type TipoParticula } from '@/components/Particulas';
import { Tesorito } from '@/components/Tesorito';
import { Laberinto } from '@/juegos/laberinto/Laberinto';
import { tamanoPorDias } from '@/juegos/laberinto/generador';
import { Granja } from '@/juegos/granja/Granja';
import { Trivia } from '@/juegos/trivia/Trivia';
import { Puzzle } from '@/juegos/puzzle/Puzzle';
import { config } from '@/lib/contenido';
import { ganar, RECOMPENSAS } from '@/lib/economia';
import { diasEntre, hoyChile, semillaDelDia } from '@/lib/fechas';
import { leerCache, guardarCache } from '@/lib/cache';
import { colores } from '@/lib/tema';

type Juego = 'laberinto' | 'granja' | 'trivia' | 'puzzle';

const JUEGOS: { id: Juego; forma: Forma; c1: string; c2: string; titulo: string; texto: string }[] = [
  { id: 'laberinto', forma: 'corazon', c1: colores.rosaFuerte, c2: colores.rosaFuerte, titulo: 'Laberinto del corazón', texto: 'Nuevo cada día. Lleva el corazón hasta Palomita.' },
  { id: 'granja', forma: 'oveja', c1: colores.crema, c2: colores.carbon, titulo: 'Granja', texto: 'Vaca, cerdo, gato y tres macetas. Nada muere, solo se pone triste.' },
  { id: 'trivia', forma: 'girasol', c1: colores.amarillo, c2: '#6B4A2A', titulo: 'Trivia de la pareja', texto: 'Cinco preguntas al día. Racha de cinco: foto inédita.' },
  { id: 'puzzle', forma: 'lana', c1: colores.rosaMedio, c2: colores.rosaTinta, titulo: 'Rompecabezas de recuerdos', texto: 'Una foto del Baúl en 3×3. Cada día una distinta.' },
];

export default function Jardin() {
  const [abierto, setAbierto] = useState<Juego | null>(null);
  const [n, setN] = useState(8);
  const [festejo, setFestejo] = useState<TipoParticula | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [labHecho, setLabHecho] = useState(false);
  const [labResultado, setLabResultado] = useState<{ segundos: number; bonus: boolean } | null>(null);
  const [bonusActivo, setBonusActivo] = useState(false);
  const [puzzleHecho, setPuzzleHecho] = useState(false);

  useEffect(() => {
    config().then((c) => setN(tamanoPorDias(diasEntre(c.fecha_inicio)))).catch(() => {});
    leerCache<string>('laberinto:hecho').then((d) => setLabHecho(d === hoyChile()));
    leerCache<string>('puzzle:hecho').then((d) => setPuzzleHecho(d === hoyChile()));
  }, []);

  function celebrar(tipo: TipoParticula, texto: string) {
    setFestejo(tipo);
    setAviso(texto);
    setTimeout(() => { setFestejo(null); setAviso(null); }, 3000);
  }

  async function alGanarLaberinto(segundos: number) {
    const bonus = segundos < 30 && !bonusActivo;
    setLabResultado({ segundos, bonus });
    if (!labHecho || bonusActivo) {
      const monto = bonusActivo ? RECOMPENSAS.laberintoBonus : RECOMPENSAS.laberinto;
      await ganar(bonusActivo ? 'laberinto_bonus' : 'laberinto', monto).catch(() => {});
      await guardarCache('laberinto:hecho', hoyChile());
      setLabHecho(true);
      celebrar('flores-rosas', `+${monto} besitos`);
    }
    setBonusActivo(false);
  }

  async function alResolverPuzzle() {
    if (puzzleHecho) return;
    await ganar('puzzle', RECOMPENSAS.puzzle).catch(() => {});
    await guardarCache('puzzle:hecho', hoyChile());
    setPuzzleHecho(true);
    celebrar('kawaii', `+${RECOMPENSAS.puzzle} besitos`);
  }

  return (
    <Pantalla fondo={colores.menta}>
      <Tesorito pantalla="jardin" />
      {festejo ? <Particulas tipo={festejo} densidad={18} duracion={2500} /> : null}
      <Texto variante="tituloGrande">Jardín</Texto>
      <Texto variante="apoyo">Un rato corto. Tres minutos, no más.</Texto>
      {aviso ? <View style={estilos.aviso}><Texto variante="cuerpoBold" style={{ color: colores.crema }}>{aviso}</Texto></View> : null}

      {JUEGOS.map((j) => {
        const activo = abierto === j.id;
        return (
          <Tarjeta key={j.id} sinSombra={!activo} fondo={colores.crema}>
            <Pressable onPress={() => setAbierto(activo ? null : j.id)} style={estilos.fila}>
              <Figura forma={j.forma} c1={j.c1} c2={j.c2} size={36} />
              <View style={{ flex: 1 }}>
                <Texto variante="titulo">{j.titulo}</Texto>
                <Texto variante="apoyo">{j.texto}</Texto>
              </View>
            </Pressable>

            {activo && j.id === 'laberinto' ? (
              <View style={{ marginTop: 16 }}>
                {labResultado ? (
                  <View style={{ gap: 10 }}>
                    <Texto variante="manuscritaGrande">Llegaste. Este mensaje solo existe aquí: cada vez que llegas a mí, gano yo.</Texto>
                    <Texto variante="apoyo">{Math.round(labResultado.segundos)} segundos.</Texto>
                    {labResultado.bonus ? (
                      <BotonKawaii titulo="Laberinto bonus · x2 besitos" onPress={() => { setBonusActivo(true); setLabResultado(null); }} />
                    ) : (
                      <BotonKawaii titulo="Otra vez, por gusto" variante="secundario" onPress={() => setLabResultado(null)} />
                    )}
                  </View>
                ) : (
                  <>
                    <Laberinto key={`${n}-${bonusActivo}`} n={n} semilla={semillaDelDia() + (bonusActivo ? 7 : 0)} onGanar={alGanarLaberinto} />
                    <Texto variante="apoyo" style={{ textAlign: 'center', marginTop: 10 }}>
                      {labHecho && !bonusActivo ? 'Ya lo hiciste hoy; este es por gusto.' : `Arrastra el corazón hasta Palomita. +${bonusActivo ? RECOMPENSAS.laberintoBonus : RECOMPENSAS.laberinto} besitos`}
                    </Texto>
                  </>
                )}
              </View>
            ) : null}

            {activo && j.id === 'granja' ? (
              <View style={{ marginTop: 16 }}>
                <Granja onRecompensa={(monto, quien) => monto > 0 && celebrar('flores-rosas', `+${monto} besitos · ${quien}`)} />
              </View>
            ) : null}

            {activo && j.id === 'trivia' ? (
              <View style={{ marginTop: 16 }}>
                <Trivia onTerminar={(c) => c >= 3 && celebrar('girasoles', c === 5 ? 'Racha perfecta' : `${c} de 5`)} />
              </View>
            ) : null}

            {activo && j.id === 'puzzle' ? (
              <View style={{ marginTop: 16 }}>
                <Puzzle onResolver={alResolverPuzzle} />
              </View>
            ) : null}
          </Tarjeta>
        );
      })}
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  fila: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  aviso: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 999, backgroundColor: colores.mentaTexto },
});
