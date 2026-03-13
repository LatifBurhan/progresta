import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function uploadToSupabase(file: File, path: string) {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const fullPath = `${path}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('reports')
      .upload(fullPath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('reports')
      .getPublicUrl(fullPath)

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    }
  } catch (error) {
    console.error('Supabase upload error:', error)
    throw new Error('Failed to upload file to storage')
  }
}

export async function deleteFromSupabase(path: string) {
  try {
    const { error } = await supabase.storage
      .from('reports')
      .remove([path])

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Supabase delete error:', error)
    throw new Error('Failed to delete file from storage')
  }
}