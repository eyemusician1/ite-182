import { redirect } from 'next/navigation'

export default function Home() {
  // Default starting page is the login screen
  redirect('/login')
}
