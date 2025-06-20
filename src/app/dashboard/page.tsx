'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { pengaduanAPI, broadcastAPI, profileAPI } from '@/services/api';

// Interface untuk struktur data pengaduan
interface Pengaduan {
  id: string;
  userId: string;
  pengaduan: string;
  kategori: string;
  status_pengaduan: 'PengajuanBaru' | 'Diproses' | 'Selesai';
  feedback: string | null;
  foto: string | null;
  created_at: string;
  updatedAt: string;
}

// Interface untuk struktur data broadcast
interface Broadcast {
  id: string;
  userId: string;
  kategori: string;
  broadcast: string;
  tanggal_acara: string | null;
  foto: string | null;
  status_broadcast: 'pending' | 'approved' | 'rejected';
  feedback: string | null;
  createdAt: string;
  user: {
    username: string;
    email: string;
    role?: string;
  };
}

// Interface untuk profil pengguna
interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
  role: 'user';
  isVerified: boolean;
}

// Interface untuk response profil dari API
interface ProfileResponse {
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    phone: string;
    nomor_rumah: string | null;
    cluster: string | null;
    rt: string | null;
    rw: string | null;
    role: 'user';
    isVerified: boolean;
  }
}

const menu = [
  { name: 'Home', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ), href: '/dashboard', requiresVerification: false },
  { name: 'Peraturan', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ), href: '/peraturan', requiresVerification: true },
  { name: 'Iuran', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ), href: '/iuran', requiresVerification: true },
  { name: 'Pengaduan', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ), href: '/pengaduan', requiresVerification: true },
  { name: 'Broadcast', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ), href: '/broadcast', requiresVerification: true },
  { name: 'Pembuatan Surat', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ), href: '/surat', requiresVerification: true },
];

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pengaduan, setPengaduan] = useState<Pengaduan[]>([]);
  const [broadcast, setBroadcast] = useState<Broadcast[]>([]);
  const [, setLoadingPengaduan] = useState(false);
  const [, setLoadingBroadcast] = useState(false);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch user profile first
        const { data: profileDataRaw } = await profileAPI.getProfile();
        const profileData = profileDataRaw as ProfileResponse;
        setUserProfile({
          id: profileData.data.id,
          username: profileData.data.username,
          email: profileData.data.email,
          phone: profileData.data.phone || undefined,
          cluster: profileData.data.cluster || undefined,
          nomor_rumah: profileData.data.nomor_rumah || undefined,
          rt: profileData.data.rt || undefined,
          rw: profileData.data.rw || undefined,
          role: profileData.data.role || 'user',
          isVerified: profileData.data.isVerified
        });

        // Only fetch pengaduan if user is verified
        if (profileData.data.isVerified) {
          try {
            const pengaduanResponseRaw = await pengaduanAPI.getPengaduan(profileData.data.id);
            const pengaduanResponse = pengaduanResponseRaw.data as { message?: string; data?: Pengaduan[] };
            if (pengaduanResponse.message?.toLowerCase() === 'success' && Array.isArray(pengaduanResponse.data)) {
              // Sort by tanggalDibuat (newest first)
              const sortedPengaduan = pengaduanResponse.data.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              );
              setPengaduan(sortedPengaduan);
            } else {
              setPengaduan([]);
            }
          } catch {
            console.error('Error fetching pengaduan');
            setPengaduan([]);
          }
        } else {
          setPengaduan([]);
        }

        // Only fetch broadcasts if user is verified
        if (profileData.data.isVerified) {
          try {
            const broadcastResponseRaw = await broadcastAPI.getAllBroadcast();
            const broadcastResponse = broadcastResponseRaw.data as { message?: string; data?: Broadcast[] };
            if (broadcastResponse.message?.toLowerCase() === 'success' && Array.isArray(broadcastResponse.data)) {
              // Filter for admin broadcasts only (approved status and from admin users)
              const adminBroadcasts = broadcastResponse.data.filter((broadcast) => 
                broadcast.status_broadcast === 'approved' && 
                broadcast.user && 
                (broadcast.user.role === 'admin' || 
                 broadcast.user.email?.toLowerCase().includes('admin') ||
                 broadcast.user.username?.toLowerCase().includes('admin'))
              );
              // Sort by creation date (newest first)
              const sortedBroadcasts = adminBroadcasts.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              setBroadcast(sortedBroadcasts);
            } else {
              setBroadcast([]);
            }
          } catch {
            setBroadcast([]);
          }
        }
      } catch {
        setError(null); // Don't show error to user
      } finally {
        setLoadingPengaduan(false);
        setLoadingBroadcast(false);
      }
    };

    fetchData();
  }, [router]);

  // Add debug log for userProfile state changes
  useEffect(() => {
    console.log('userProfile state updated:', userProfile);
  }, [userProfile]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: Pengaduan['status_pengaduan']) => {
    switch (status) {
      case 'PengajuanBaru':
        return 'bg-yellow-100 text-yellow-800';
      case 'Diproses':
        return 'bg-blue-100 text-blue-800';
      case 'Selesai':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: Pengaduan['status_pengaduan']) => {
    if (!status) return 'Unknown';
    return status.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white text-gray-800 flex flex-col py-8 px-4 border-r border-gray-200 shadow-sm">
        <div className="flex items-center mb-10">
          <svg className="w-9 h-9 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="ml-3 text-2xl font-bold text-blue-700">Cherry Field</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {menu
              .filter(item => !item.requiresVerification || userProfile?.isVerified)
              .map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center w-full px-4 py-2 rounded-lg transition font-medium text-base gap-3 ${pathname === item.href ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <span className={pathname === item.href ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
            {!userProfile?.isVerified && (
              <li className="mt-4 px-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Lengkapi data profil Anda untuk mengakses semua fitur
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />
        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 shadow-lg relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-48 h-48 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-48 h-48 bg-blue-500 rounded-full opacity-20 blur-2xl"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Selamat Datang, {userProfile?.username || 'Pengguna'}</h2>
                    <p className="text-blue-100">Selamat datang kembali di Cherry Field</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/20">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Informasi Pribadi</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-blue-100 text-xs mb-0.5">Email</p>
                        <p className="text-white text-sm font-medium truncate">{userProfile?.email || '-'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-blue-100 text-xs mb-0.5">Nomor Telepon</p>
                        <p className="text-white text-sm font-medium">{userProfile?.phone || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Card */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white">Alamat</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-blue-100 text-xs mb-0.5">Cluster</p>
                        <p className="text-white text-sm font-medium truncate">{userProfile?.cluster || '-'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-blue-100 text-xs mb-0.5">No. Rumah</p>
                        <p className="text-white text-sm font-medium">{userProfile?.nomor_rumah || '-'}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-blue-100 text-xs mb-0.5">RT/RW</p>
                        <p className="text-white text-sm font-medium">{userProfile?.rt || '-'}/{userProfile?.rw || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Complaints Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Pengaduan Terbaru</h3>
                    </div>
                    {userProfile?.isVerified && (
                      <Link href="/pengaduan" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Lihat Semua
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {!userProfile?.isVerified ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Verifikasi akun Anda untuk mengakses pengaduan</p>
                    </div>
                  ) : pengaduan.length > 0 ? (
                    <div className="space-y-4">
                      {pengaduan.slice(0, 3).map((p) => (
                        <div key={p.id} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(p.status_pengaduan)}`}>
                              {formatStatus(p.status_pengaduan)}
                            </span>
                            <span className="text-sm text-gray-500">{formatDate(p.created_at)}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{p.kategori}</p>
                          <p className="text-sm text-gray-500 line-clamp-2">{p.pengaduan}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Belum ada pengaduan</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Broadcasts Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Pengumuman Admin</h3>
                    </div>
                    {userProfile?.isVerified && (
                      <Link href="/broadcast" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Lihat Semua
                      </Link>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {!userProfile?.isVerified ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Verifikasi akun Anda untuk mengakses pengumuman</p>
                    </div>
                  ) : broadcast.length > 0 ? (
                    <div className="space-y-4">
                      {/* Show only 1 announcement from admin */}
                      {broadcast.slice(0, 1).map((b) => (
                        <div key={b.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                                     <div className="flex justify-between items-start mb-3">
                             <span className="text-sm text-gray-500">{formatDate(b.createdAt)}</span>
                           </div>
                          
                          {/* Category */}
                          <p className="text-lg font-semibold text-gray-900 mb-2">{b.kategori}</p>
                          
                          {/* Message */}
                          <p className="text-gray-700 mb-4 leading-relaxed">{b.broadcast}</p>
                          
                          {/* Image if available */}
                          {b.foto && (
                            <div className="mb-4">
                              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={b.foto}
                                  alt="Gambar Pengumuman"
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    // Hide image if failed to load
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          
                          {/* Event date if available */}
                          {b.tanggal_acara && (
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm text-gray-600">Tanggal Acara: {formatDate(b.tanggal_acara)}</span>
                            </div>
                          )}
                          
                          {/* Author info */}
                          <div className="flex items-center justify-between pt-3 border-t border-blue-100">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700">{b.user.username}</span>
                            </div>
                            <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Official
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Belum ada pengumuman dari admin</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 