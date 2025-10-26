import { redirect } from 'next/navigation';

export default function DashboardPage() {
  // Redirect dashboard to home (home is the new homepage for authenticated users)
  redirect('/home');
}
