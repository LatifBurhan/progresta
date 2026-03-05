import { revalidateTag } from 'next/cache'

export function revalidateProfile() {
  revalidateTag('profile')
}

export function revalidateUsers() {
  revalidateTag('users')
}
