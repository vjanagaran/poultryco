'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [memberCount, setMemberCount] = useState(5247);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUser(user);
      setProfile(profileData);
      setLoading(false);
    };

    fetchData();

    // Simulate live member count
    const interval = setInterval(() => {
      setMemberCount(prev => prev + Math.floor(Math.random() * 3));
    }, 10000);

    return () => clearInterval(interval);
  }, [router]);

  const calculateProfileStrength = () => {
    if (!profile) return 25;
    
    let strength = 25; // Base for registration
    if (profile.full_name) strength += 15;
    if (profile.location_state) strength += 10;
    if (profile.headline) strength += 15;
    if (profile.bio) strength += 15;
    if (profile.profile_photo_url) strength += 20;
    
    return Math.min(strength, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const profileStrength = calculateProfileStrength();
  const isProfileComplete = profileStrength >= 80;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="font-bold text-xl text-gray-900">PoultryCo</span>
              </Link>

              {/* Main Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-green-600 font-medium border-b-2 border-green-600 pb-1">
                  Dashboard
                </Link>
                <Link href="/members" className="text-gray-600 hover:text-gray-900">
                  Members
                </Link>
                <Link href="/roadmap" className="text-gray-600 hover:text-gray-900">
                  Roadmap
                </Link>
                <Link href="/feedback" className="text-gray-600 hover:text-gray-900">
                  Feedback
                </Link>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Link href="/me" className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-3 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.user_metadata?.full_name?.[0] || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.user_metadata?.full_name || 'User'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-primary rounded-xl shadow-lg p-4 sm:p-6 text-white mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2">🚧 We're Building PoultryCo With You</h2>
              <p className="text-sm sm:text-base text-blue-100">
                Features will activate as we ship them. Your feedback shapes what we build next.
              </p>
            </div>
            <Link 
              href="/roadmap"
              className="inline-block px-4 py-2 bg-white text-primary font-medium rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap text-sm sm:text-base"
            >
              View Roadmap →
            </Link>
          </div>
          
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="font-medium">Platform Development</span>
              <span>65% complete • Expected launch: January 2026</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3">
              <div className="bg-white h-3 rounded-full shadow-lg" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion */}
            {!isProfileComplete && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600">Add your details to connect with the community</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">{profileStrength}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${profileStrength}%` }}
                  ></div>
                </div>

              <Link
                href="/me"
                className="block w-full text-center px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
              >
                Complete Profile Now →
              </Link>
              </div>
            )}

            {/* What You Can Do Now */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">What You Can Do Right Now</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <ActionCard
                  icon="👤"
                  title="Complete Your Profile"
                  description="Add your role, expertise, and what you're looking for"
                  href="/me"
                  status={isProfileComplete ? 'completed' : 'active'}
                />
                
                <ActionCard
                  icon="🔍"
                  title="Browse Member Directory"
                  description={`See ${memberCount.toLocaleString()} members from 23 states`}
                  href="/members"
                  status="active"
                />
                
                <ActionCard
                  icon="🗳️"
                  title="Vote on Features"
                  description="Help us prioritize what to build next"
                  href="/feedback"
                  status="active"
                />
                
                <ActionCard
                  icon="📢"
                  title="Invite Your Network"
                  description="Build your connections before launch"
                  href="/invite"
                  status="active"
                />
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Coming Soon</h3>
              
              <div className="space-y-4">
                <TimelineItem
                  date="December 2025"
                  title="🧪 Beta Testing: Problem Posting"
                  description="Founding members will be first to test posting problems and getting expert answers. Limited slots available."
                  action={{ label: 'Sign up for beta testing →', href: '/beta-signup' }}
                />
                
                <TimelineItem
                  date="January 2026"
                  title="🚀 Full Platform Launch at PTSE"
                  description="All features go live. Problem posting, expert answers, job board, events, tools—everything."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Community Growth</h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <StatItem label="Total Members" value={memberCount.toLocaleString()} trend="+127 today" />
                <StatItem label="States Represented" value="23" />
                <StatItem label="Verified Experts" value="847" />
                <StatItem label="Associations Joined" value="12" />
              </div>
            </div>

            {/* Latest Updates */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Latest from the Team</h3>
              
              <div className="space-y-4">
                <UpdateCard
                  time="2 hours ago"
                  title="Dev Update"
                  content="🎉 Big milestone! We just shipped the expert verification system. Veterinarians can now upload their BVSc certificates and get verified within 24 hours. 847 vets already signed up!"
                  href="/updates"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-sm p-4 sm:p-6 text-white">
              <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
              
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-3">
                <Link href="/feedback" className="block w-full px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-center font-medium transition-colors text-sm lg:text-base">
                  Give Feedback
                </Link>
                <Link href="/invite" className="block w-full px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-center font-medium transition-colors text-sm lg:text-base">
                  Invite Members
                </Link>
                <Link href="/support" className="block w-full px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-center font-medium transition-colors text-sm lg:text-base">
                  Get Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Components
function ActionCard({ icon, title, description, href, status }: { icon: string; title: string; description: string; href: string; status?: 'active' | 'completed' }) {
  return (
    <Link 
      href={href}
      className="block p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl">{icon}</span>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors flex items-center gap-2">
            {title}
            {status === 'completed' && <span className="text-green-500 text-sm">✓</span>}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function TimelineItem({ date, title, description, action }: { date: string; title: string; description: string; action?: { label: string; href: string } }) {
  return (
    <div className="border-l-2 border-green-500 pl-4">
      <div className="text-sm font-medium text-green-600 mb-1">{date}</div>
      <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-3">{description}</p>
      {action && (
        <Link href={action.href} className="text-sm text-green-600 hover:text-green-700 font-medium">
          {action.label}
        </Link>
      )}
    </div>
  );
}

function StatItem({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
      {trend && <div className="text-xs text-green-600 mt-1">↗ {trend}</div>}
    </div>
  );
}

function UpdateCard({ time, title, content, href }: { time: string; title: string; content: string; href: string }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-bold text-sm">PC</span>
        </div>
        <div className="flex-1">
          <div className="font-bold text-sm text-gray-900">{title}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-2">{content}</p>
      <Link href={href} className="text-sm text-green-600 hover:text-green-700 font-medium">
        Read full update →
      </Link>
    </div>
  );
}

