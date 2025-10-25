import { Metadata } from 'next';
import { WelcomeFlow } from '@/components/welcome/WelcomeFlow';

export const metadata: Metadata = {
  title: 'Welcome to PoultryCo!',
  description: 'Welcome to the PoultryCo community. Help us build the platform you need.',
};

export const dynamic = 'force-dynamic';

export default function WelcomePage() {
  return <WelcomeFlow />;
}

