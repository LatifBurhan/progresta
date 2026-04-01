import { supabaseAdmin } from '@/lib/supabase'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

export async function uploadProofPhoto(
  file: File,
  userId: string
): Promise<{ url: string; fileName: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('INVALID_FILE')
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('FILE_TOO_LARGE')
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${userId}/${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabaseAdmin.storage
    .from('overtime-proofs')
    .upload(fileName, buffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from('overtime-proofs').getPublicUrl(fileName)

  return { url: publicUrl, fileName }
}
