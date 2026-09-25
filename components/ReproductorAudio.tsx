import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { BotonKawaii } from './BotonKawaii';
import { colores } from '@/lib/tema';

// Audio tuyo de treinta segundos: un botón, nada más.
export function ReproductorAudio({ uri }: { uri: string }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const sonando = status.playing;
  return (
    <BotonKawaii
      titulo={sonando ? 'Pausar' : 'Escuchar'}
      color={colores.rosaTinta}
      style={{ marginTop: 12, alignSelf: 'flex-start' }}
      onPress={() => (sonando ? player.pause() : player.play())}
    />
  );
}
