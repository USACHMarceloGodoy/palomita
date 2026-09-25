// Tokens visuales de Palomita. Misma tabla que el documento de diseño.
// El rosa-fuerte #FF6F91 no da contraste con texto blanco: los botones usan rosa-tinta.

export const colores = {
  rosaBase: '#FFE4EC',
  rosaMedio: '#FFB3C6',
  rosaClaro: '#FFD3E1',
  rosaSuave: '#FFEFF4',
  rosaFuerte: '#FF6F91',
  rosaTinta: '#D6336C',
  lavanda: '#E2D5F8',
  lavandaBorde: '#C3AEE8',
  lavandaTexto: '#5B4A6B',
  menta: '#C8F0DC',
  mentaTexto: '#26543F',
  crema: '#FFF8F0',
  cremaClaro: '#FFFDFA',
  carbon: '#4A3B45',
  gris: '#7A6670',
  amarillo: '#FFD93D',
  amarilloOscuro: '#E09A1F',
  verde: '#3E8A62',
} as const;

export const fuentes = {
  titulo: 'Baloo2_600SemiBold',
  tituloBold: 'Baloo2_700Bold',
  cuerpo: 'Nunito_400Regular',
  cuerpoSemi: 'Nunito_600SemiBold',
  cuerpoBold: 'Nunito_700Bold',
  manuscrita: 'Caveat_500Medium',
  manuscritaBold: 'Caveat_600SemiBold',
} as const;

export const radios = {
  tarjeta: 28,
  tarjetaChica: 20,
  boton: 999,
  nav: 18,
} as const;

export const sombras = {
  rosada: {
    shadowColor: '#FF6F91',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  rosadaSuave: {
    shadowColor: '#FF6F91',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
} as const;

export const espacio = { xs: 6, sm: 10, md: 14, lg: 20, xl: 24 } as const;

// Acento por pestaña (sección), según el documento.
export const acentoSeccion = {
  inicio: colores.rosaTinta,
  baul: colores.lavanda,
  jardin: colores.menta,
  ayuda: colores.rosaMedio,
  tesoro: colores.amarillo,
} as const;
