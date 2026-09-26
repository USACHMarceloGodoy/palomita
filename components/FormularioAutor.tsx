import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import { Tarjeta } from './Tarjeta';
import { Texto } from './Texto';
import { BotonKawaii } from './BotonKawaii';
import { colores, radios } from '@/lib/tema';

// Un solo formulario para todo el panel móvil. Cada sección describe sus
// campos con datos y este componente se encarga del resto: estado, campos
// obligatorios, el selector de archivos y el mensaje de "guardado". Así
// agregar una sección nueva es una lista, no una pantalla entera.

export type Archivo = { uri: string; nombre: string; tipo: string };

export type Campo =
  | { id: string; etiqueta: string; tipo: 'texto' | 'multilinea' | 'numero' | 'fecha'; requerido?: boolean; ayuda?: string; placeholder?: string }
  | { id: string; etiqueta: string; tipo: 'opciones'; opciones: { valor: string; titulo: string }[]; requerido?: boolean; ayuda?: string }
  | { id: string; etiqueta: string; tipo: 'switch'; ayuda?: string }
  | { id: string; etiqueta: string; tipo: 'foto' | 'audio'; requerido?: boolean; ayuda?: string };

export type Valores = Record<string, string | boolean | Archivo | null>;

type Props = {
  titulo: string;
  descripcion?: string;
  campos: Campo[];
  textoBoton?: string;
  onGuardar: (v: Valores) => Promise<void>;
};

export function FormularioAutor({ titulo, descripcion, campos, textoBoton = 'Guardar', onGuardar }: Props) {
  const [v, setV] = useState<Valores>(() => inicial(campos));
  const [estado, setEstado] = useState<'listo' | 'guardando' | 'ok' | 'error'>('listo');
  const [error, setError] = useState('');

  const faltan = campos.some((c) => 'requerido' in c && c.requerido && vacio(v[c.id]));

  async function guardar() {
    setEstado('guardando');
    setError('');
    try {
      await onGuardar(v);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setV(inicial(campos));
      setEstado('ok');
      setTimeout(() => setEstado('listo'), 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setEstado('error');
    }
  }

  return (
    <Tarjeta style={{ gap: 12 }}>
      <Texto variante="etiqueta">{titulo}</Texto>
      {descripcion ? <Texto variante="apoyo" style={{ fontSize: 12 }}>{descripcion}</Texto> : null}

      {campos.map((c) => (
        <View key={c.id} style={{ gap: 6 }}>
          <Texto variante="cuerpoBold" style={{ fontSize: 13, color: colores.gris }}>{c.etiqueta}</Texto>
          <CampoControl campo={c} valor={v[c.id]} onCambio={(nuevo) => setV((prev) => ({ ...prev, [c.id]: nuevo }))} />
          {c.ayuda ? <Texto variante="apoyo" style={{ fontSize: 11 }}>{c.ayuda}</Texto> : null}
        </View>
      ))}

      {estado === 'error' ? <Texto variante="apoyo" style={{ color: colores.rosaTinta }}>{error}</Texto> : null}

      <BotonKawaii
        titulo={estado === 'guardando' ? 'Guardando…' : estado === 'ok' ? '¡Guardado!' : textoBoton}
        onPress={guardar}
        disabled={estado === 'guardando' || faltan}
      />
    </Tarjeta>
  );
}

function CampoControl({ campo, valor, onCambio }: { campo: Campo; valor: Valores[string]; onCambio: (v: Valores[string]) => void }) {
  if (campo.tipo === 'opciones') {
    return (
      <View style={estilos.chips}>
        {campo.opciones.map((o) => (
          <Pressable key={o.valor} onPress={() => onCambio(o.valor)} style={[estilos.chip, valor === o.valor && estilos.chipActivo]}>
            <Texto variante="cuerpoBold" style={{ fontSize: 13, color: valor === o.valor ? colores.crema : colores.gris }}>{o.titulo}</Texto>
          </Pressable>
        ))}
      </View>
    );
  }

  if (campo.tipo === 'switch') {
    const on = valor === true;
    return (
      <Pressable onPress={() => onCambio(!on)} style={[estilos.switch, on && estilos.switchOn]}>
        <Texto variante="cuerpoBold" style={{ fontSize: 13, color: on ? colores.crema : colores.gris }}>{on ? 'Sí' : 'No'}</Texto>
      </Pressable>
    );
  }

  if (campo.tipo === 'foto' || campo.tipo === 'audio') {
    return <SelectorArchivo tipo={campo.tipo} valor={valor as Archivo | null} onCambio={onCambio} />;
  }

  return (
    <TextInput
      value={typeof valor === 'string' ? valor : ''}
      onChangeText={onCambio}
      placeholder={'placeholder' in campo ? campo.placeholder ?? '' : ''}
      placeholderTextColor={colores.gris}
      multiline={campo.tipo === 'multilinea'}
      keyboardType={campo.tipo === 'numero' ? 'number-pad' : 'default'}
      autoCapitalize={campo.tipo === 'fecha' ? 'none' : 'sentences'}
      style={[estilos.input, campo.tipo === 'multilinea' && { minHeight: 110, textAlignVertical: 'top' }]}
    />
  );
}

function SelectorArchivo({ tipo, valor, onCambio }: { tipo: 'foto' | 'audio'; valor: Archivo | null; onCambio: (a: Archivo | null) => void }) {
  const [abriendo, setAbriendo] = useState(false);

  async function elegir() {
    setAbriendo(true);
    try {
      if (tipo === 'foto') {
        const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permiso.granted) return;
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
        if (r.canceled || !r.assets?.length) return;
        const a = r.assets[0];
        onCambio({ uri: a.uri, nombre: a.fileName ?? `foto-${Date.now()}.jpg`, tipo: a.mimeType ?? 'image/jpeg' });
      } else {
        const r = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
        if (r.canceled || !r.assets?.length) return;
        const a = r.assets[0];
        onCambio({ uri: a.uri, nombre: a.name ?? `audio-${Date.now()}.m4a`, tipo: a.mimeType ?? 'audio/mpeg' });
      }
    } finally {
      setAbriendo(false);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      {valor && tipo === 'foto' ? (
        <Image source={{ uri: valor.uri }} style={estilos.previaFoto} contentFit="cover" />
      ) : null}
      {valor && tipo === 'audio' ? (
        <Texto variante="cuerpoBold" style={{ fontSize: 13 }} numberOfLines={1}>♪ {valor.nombre}</Texto>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={elegir} disabled={abriendo} style={[estilos.secundario, { flex: 1 }, abriendo && { opacity: 0.5 }]}>
          <Texto variante="cuerpoBold" style={{ color: colores.rosaTinta, fontSize: 14 }}>
            {abriendo ? 'Abriendo…' : valor ? 'Cambiar' : tipo === 'foto' ? 'Elegir foto' : 'Elegir audio'}
          </Texto>
        </Pressable>
        {valor ? (
          <Pressable onPress={() => onCambio(null)} style={[estilos.secundario, { paddingHorizontal: 16 }]}>
            <Texto variante="cuerpoBold" style={{ color: colores.gris, fontSize: 14 }}>Quitar</Texto>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function inicial(campos: Campo[]): Valores {
  const v: Valores = {};
  for (const c of campos) v[c.id] = c.tipo === 'switch' ? false : c.tipo === 'foto' || c.tipo === 'audio' ? null : '';
  return v;
}

function vacio(v: Valores[string]) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return !v.trim();
  if (typeof v === 'boolean') return false;
  return false;
}

/** Atajos para leer los valores con el tipo correcto. */
export const val = {
  texto: (v: Valores, id: string) => (typeof v[id] === 'string' ? (v[id] as string).trim() : ''),
  numero: (v: Valores, id: string) => {
    const n = Number(val.texto(v, id));
    return Number.isFinite(n) ? n : null;
  },
  si: (v: Valores, id: string) => v[id] === true,
  archivo: (v: Valores, id: string) => (v[id] && typeof v[id] === 'object' ? (v[id] as Archivo) : null),
};

const estilos = StyleSheet.create({
  input: {
    minHeight: 48, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 16, borderWidth: 2,
    borderColor: colores.rosaClaro, backgroundColor: colores.cremaClaro, color: colores.carbon, fontSize: 15,
  },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    minHeight: 38, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colores.cremaClaro,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colores.rosaClaro,
  },
  chipActivo: { backgroundColor: colores.rosaFuerte, borderColor: colores.rosaFuerte },
  switch: {
    alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: 20, borderRadius: 999,
    backgroundColor: colores.cremaClaro, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colores.rosaClaro,
  },
  switchOn: { backgroundColor: colores.rosaFuerte, borderColor: colores.rosaFuerte },
  secundario: { minHeight: 46, borderRadius: radios.boton, borderWidth: 2, borderColor: colores.rosaClaro, alignItems: 'center', justifyContent: 'center' },
  previaFoto: { width: '100%', height: 180, borderRadius: radios.tarjetaChica },
});
