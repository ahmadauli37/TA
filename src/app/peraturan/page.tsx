"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { peraturanAPI } from '@/services/api';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Header from '@/components/Header';

interface ApiError {
  response?: {
    status: number;
    data: {
      message: string;
      status?: number;
      data?: any;
    };
  };
  message: string;
}

interface Peraturan {
  id: string;
  judul: string;
  isi_peraturan: string;
  createdAt: string;
  updatedAt: string;
  kategori: string;
}

interface PeraturanResponse {
  message: string;
  data: Peraturan[];
}

const badgeColor = (kategori: string) => {
  switch (kategori) {
    case 'Keamanan': return 'bg-blue-100 text-blue-700';
    case 'Kebersihan': return 'bg-green-100 text-green-700';
    case 'Iuran': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const menu = [
  { name: 'Home', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  ), href: '/dashboard' },
  { name: 'Peraturan', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ), href: '/peraturan' },
  { name: 'Iuran', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ), href: '/iuran' },
  { name: 'Pengaduan', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ), href: '/pengaduan' },
  { name: 'Broadcast', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ), href: '/broadcast' },
  { name: 'Pembuatan Surat', icon: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ), href: '/surat' },
];

// Add this component for safe HTML rendering
const SafeHTML = ({ html }: { html: string }) => {
  const sanitizedHTML = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};

export default function PeraturanPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedPeraturan, setSelectedPeraturan] = useState<Peraturan | null>(null);
  const [userProfile, setUserProfile] = useState<{ 
    username: string | null; 
    email: string;
    role: 'user' | 'admin' 
  } | null>(null);
  const [peraturan, setPeraturan] = useState<Peraturan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Debug: Check authentication
        const token = localStorage.getItem('token');
        console.log('Checking authentication...');
        console.log('Token exists:', !!token);
        
        if (!token) {
          console.log('No token found, redirecting to login...');
          router.push('/login');
          return;
        }

        // Debug: Check user profile
        console.log('Loading user profile...');
        const savedProfile = localStorage.getItem('userProfile');
        console.log('Saved profile exists:', !!savedProfile);
        
        if (savedProfile) {
          try {
            const parsedProfile = JSON.parse(savedProfile);
            console.log('Parsed profile:', parsedProfile);
            setUserProfile({
              username: parsedProfile.username,
              email: parsedProfile.email,
              role: parsedProfile.role
            });
          } catch (error) {
            console.error('Error parsing user profile:', error);
            setError('Error loading user profile');
            return;
          }
        } else {
          console.warn('No user profile found in localStorage');
        }

        // Debug: Fetch peraturan data
        console.log('Fetching peraturan data...');
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await peraturanAPI.getPeraturan();
          console.log('Peraturan API Response:', response);
          
          if (!response.data) {
            throw new Error('No data received from API');
          }

          const peraturanResponse = response.data as PeraturanResponse;
          console.log('Parsed peraturan response:', peraturanResponse);

          if (!peraturanResponse.data || !Array.isArray(peraturanResponse.data)) {
            console.error('Invalid data structure:', peraturanResponse);
            throw new Error('Invalid data structure received from API');
          }

          console.log('Setting peraturan data:', peraturanResponse.data);
          setPeraturan(peraturanResponse.data);
        } catch (error) {
          const apiError = error as ApiError;
          console.error('API Error details:', {
            error: apiError,
            message: apiError.message,
            response: apiError.response?.data
          });
          
          if (apiError.response?.status === 401) {
            console.log('Unauthorized access, clearing data and redirecting...');
            localStorage.removeItem('token');
            localStorage.removeItem('userProfile');
            router.push('/login');
            return;
          }
          
          setError(apiError.response?.data?.message || 'Gagal memuat data peraturan. Silakan coba lagi nanti.');
        }
      } catch (err) {
        console.error('General error in fetchData:', err);
        setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Apakah anda yakin ingin logout?',
      text: "Anda akan keluar dari sistem",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, logout!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('token');
      Swal.fire({
        title: 'Berhasil Logout!',
        text: 'Anda telah keluar dari sistem',
        icon: 'success',
        timer: 1500
      }).then(() => {
        router.push('/login');
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white text-gray-800 flex flex-col py-8 px-4 border-r border-gray-200 shadow-sm z-40">
        <div className="flex items-center mb-10">
          <svg className="w-9 h-9 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="ml-3 text-2xl font-bold text-blue-700">Cherry Field</span>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {menu.map((item) => (
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
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Peraturan Perumahan</h1>
            </div>

            

            {/* Peraturan Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {peraturan.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    Belum ada peraturan yang tersedia
                  </div>
                ) : (
                  peraturan.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPeraturan(p)}
                      className="border rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition block cursor-pointer text-left w-full"
                      type="button"
                    >
                      <div className="mb-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(p.kategori)}`}>{p.kategori}</span>
                      </div>
                      <div className="font-bold text-lg mb-1 text-blue-700">{p.judul}</div>
                      <div className="text-gray-700 text-sm mb-4 line-clamp-3">
                        <SafeHTML html={p.isi_peraturan} />
                      </div>
                      <div className="flex flex-col gap-1 text-xs text-gray-500 mt-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Dibuat pada: {formatDate(p.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Diperbarui pada: {formatDate(p.updatedAt)}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Modal Detail Peraturan */}
          {selectedPeraturan && (
            <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
              <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-8 relative mt-12 animate-fadeIn">
                <button
                  onClick={() => setSelectedPeraturan(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                  aria-label="Tutup"
                >
                  &times;
                </button>
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${badgeColor(selectedPeraturan.kategori)}`}>{selectedPeraturan.kategori}</span>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-blue-700">{selectedPeraturan.judul}</h2>
                <div className="text-gray-700 text-base mb-6">
                  <SafeHTML html={selectedPeraturan.isi_peraturan} />
                </div>
                <div className="flex flex-col gap-1 text-xs text-gray-500 mt-4">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Dibuat pada: {formatDate(selectedPeraturan.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Diperbarui pada: {formatDate(selectedPeraturan.updatedAt)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 