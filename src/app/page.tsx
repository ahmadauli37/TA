import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
