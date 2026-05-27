'use server'

import { createClient } from '@/utils/supabase/server'
import { propertySchema } from '@/lib/schema'

export async function createProperty(formData: any) {
  const validated = propertySchema.safeParse(formData)
  if (!validated.success) return { error: "Invalid Data" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from('properties').insert({
    ...validated.data,
    owner_id: user.id,
    moderation_status: 'PENDING'
  })

  if (error) return { error: "Database error" }
  return { success: true }
}
