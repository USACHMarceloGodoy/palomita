// Subida de fotos y audios al bucket privado `media`.
// Fotos: se convierten a WebP con ancho máximo 1600 px + miniatura de 400 px,
// para que el giga gratis no se llene en años.
import { supabase } from './supabase'

async function redimensionar(file: File, maxAncho: number, calidad: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const escala = Math.min(1, maxAncho / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * escala)
  canvas.height = Math.round(bitmap.height * escala)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('No se pudo convertir'))), 'image/webp', calidad),
  )
}

function nombre(ext: string) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

export async function subirFoto(file: File): Promise<{ foto_path: string; thumb_path: string }> {
  const [grande, thumb] = await Promise.all([redimensionar(file, 1600, 0.82), redimensionar(file, 400, 0.75)])
  const base = nombre('webp')
  const foto_path = `recuerdos/${base}`
  const thumb_path = `recuerdos/thumb-${base}`
  const r1 = await supabase.storage.from('media').upload(foto_path, grande, { contentType: 'image/webp' })
  if (r1.error) throw r1.error
  const r2 = await supabase.storage.from('media').upload(thumb_path, thumb, { contentType: 'image/webp' })
  if (r2.error) throw r2.error
  return { foto_path, thumb_path }
}

export async function subirArchivo(file: File, carpeta: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'bin'
  const path = `${carpeta}/${nombre(ext)}`
  const { error } = await supabase.storage.from('media').upload(path, file, { contentType: file.type })
  if (error) throw error
  return path
}
