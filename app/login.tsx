import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Pantalla } from '@/components/Pantalla';
import { Tarjeta } from '@/components/Tarjeta';
import { Texto } from '@/components/Texto';
import { BotonKawaii } from '@/components/BotonKawaii';
import { Mascota } from '@/components/Mascota';
import { iniciarSesion } from '@/lib/sesion';
import { colores, fuentes } from '@/lib/tema';

// Ella entra una sola vez: la sesión queda guardada en SecureStore para siempre.
export default function Login() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function entrar() {
    setOcupado(true);
    setError(null);
    try {
      await iniciarSesion(email.trim(), pass);
    } catch (e) {
      setError('No pude entrar. Revisa el correo y la clave que te pasé.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Pantalla style={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Mascota size={110} animo={0.8} />
        <Texto style={{ fontFamily: fuentes.tituloBold, fontSize: 34, lineHeight: 40 }}>Palomita</Texto>
        <Texto variante="apoyo">Solo una vez. Después queda abierta.</Texto>
      </View>
      <Tarjeta style={{ gap: 12 }}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="correo"
          placeholderTextColor={colores.gris}
          autoCapitalize="none"
          keyboardType="email-address"
          style={estilos.input}
        />
        <TextInput
          value={pass}
          onChangeText={setPass}
          placeholder="clave"
          placeholderTextColor={colores.gris}
          secureTextEntry
          style={estilos.input}
        />
        {error ? <Texto variante="apoyo" style={{ color: colores.rosaTinta }}>{error}</Texto> : null}
        <BotonKawaii titulo={ocupado ? 'Entrando…' : 'Entrar'} onPress={entrar} disabled={ocupado || !email || !pass} />
      </Tarjeta>
    </Pantalla>
  );
}

const estilos = StyleSheet.create({
  input: {
    minHeight: 50,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colores.rosaClaro,
    backgroundColor: colores.cremaClaro,
    color: colores.carbon,
    fontFamily: fuentes.cuerpo,
    fontSize: 16,
  },
});
