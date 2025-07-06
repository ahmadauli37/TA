'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import Header from '@/components/Header';
import { suratAPI, profileAPI } from '@/services/api';

interface Surat {
  id: string;
  userId: string;
  deskripsi: string | null;
  fasilitas: string;
  keperluan: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  createdAt: string;
  file: string | null;
  status: 'requested' | 'approved' | 'rejected';
  feedback: string | null;
}

// Update API response interface
interface SuratResponse {
  message: string;
  data: Surat;
}

interface SuratListResponse {
  message: string;
  data: Surat[];
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

// Add ProfileResponse interface for type safety
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
    role: 'user' | 'admin';
    isVerified: boolean;
  };
}

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

// Update debug function with proper typing
const debugSuratAPI = async () => {
  try {
    // Get user profile to get userId
    const savedProfile = localStorage.getItem('userProfile');
    if (!savedProfile) {
      console.error('Debug: No user profile found in localStorage');
      return;
    }

    const userProfile = JSON.parse(savedProfile);
    console.log('Debug: User Profile:', userProfile);

    // Log the request details
    console.log('Debug: Fetching surat for user ID:', userProfile.id);
    // Debug: API URL now uses the centralized baseURL in api.ts

    // Make the API call
    const response = await suratAPI.getSurat(userProfile.id);
    const suratResponse = response.data as SuratResponse;
    
    // Log the complete response
    console.log('Debug: Complete API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: suratResponse
    });

    // Log the surat data specifically
    console.log('Debug: Surat Data:', suratResponse.data);

    // Log any metadata or additional information
    if (suratResponse.message) {
      console.log('Debug: API Message:', suratResponse.message);
    }

    return suratResponse;
  } catch (error: any) {
    // Detailed error logging
    console.error('Debug: API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });

    if (error.response?.status === 401) {
      console.error('Debug: Authentication error - Token may be invalid or expired');
    }

    throw error;
  }
};

const STORAGE_BASE_URL = 'https://lrubxwgdcidlxqyjjbsk.supabase.co/storage/v1/object/public/uploads/';

export default function SuratPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [suratList, setSuratList] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    fasilitas: '',
    keperluan: '',
    tanggalMulai: '',
    tanggalSelesai: '',
    deskripsi: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<Surat | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSuratDetail, setSelectedSuratDetail] = useState<Surat | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    console.log('=== Debug Surat Page Mount ===');
    console.log('1. Component mounted, checking authentication...');

    const loadAuthData = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      
      console.log('2. Authentication check:', {
        hasToken: !!token,
        hasUserId: !!storedUserId,
        tokenPreview: token ? `${token.substring(0, 10)}...` : 'not found',
        userId: storedUserId
      });

      if (!token || !storedUserId) {
        console.log('3. Missing auth data, redirecting to login');
        router.push('/login');
        return null;
      }

      // Validate user ID
      if (typeof storedUserId !== 'string' || storedUserId.trim() === '') {
        console.error('4. Invalid user ID format');
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'ID pengguna tidak valid', confirmButtonText: 'OK' });
        router.push('/login');
        return null;
      }

      try {
        // Fetch user profile
        console.log('5. Fetching user profile...');
        const profileResponse = await profileAPI.getProfile();
        const profileData = profileResponse.data as ProfileResponse;
        setUserProfile({
          id: profileData.data.id,
          username: profileData.data.username,
          email: profileData.data.email,
          role: profileData.data.role || 'user'
        });
        return storedUserId.trim();
      } catch (error) {
        console.error('8. Error fetching user profile:', error);
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat profil pengguna', confirmButtonText: 'OK' });
        router.push('/login');
        return null;
      }
    };

    const loadSurat = async () => {
      setLoading(true);
      try {
        const userId = await loadAuthData();
        if (!userId) {
          console.log('9. Failed to load auth data');
          return;
        }

        console.log('10. Setting user ID in state:', userId);
        setUserId(userId);

        // Fetch user's surat
        console.log('11. Fetching user surat');
        const response = await suratAPI.getSurat(userId);
        const data = response.data as { message?: string; data?: any[] };
        if (data.message?.toLowerCase() === 'success' && Array.isArray(data.data)) {
          setSuratList(data.data);
        } else {
          setSuratList([]);
        }
      } catch (error: any) {
        console.error('14. Error loading surat:', error);
        if (error?.response?.status === 401) {
          console.log('15. Unauthorized access detected, clearing auth data and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat data surat', confirmButtonText: 'OK' });
          setSuratList([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSurat();
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
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Surat['status']) => {
    switch (status) {
      case 'requested':
        return 'bg-yellow-50 text-yellow-700';
      case 'approved':
        return 'bg-green-50 text-green-700';
      case 'rejected':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getStatusText = (status: Surat['status']) => {
    switch (status) {
      case 'requested':
        return 'Menunggu Persetujuan';
      case 'approved':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'User ID tidak ditemukan', confirmButtonText: 'OK' });
      router.push('/login');
      return;
    }
    if (!formData.fasilitas.trim() || !formData.keperluan.trim() || !formData.tanggalMulai.trim() || !formData.tanggalSelesai.trim()) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Semua field harus diisi', confirmButtonText: 'OK' });
      return;
    }
    try {
      setIsLoading(true);
      const dataToSend = {
        fasilitas: formData.fasilitas,
        keperluan: formData.keperluan,
        tanggalMulai: formData.tanggalMulai,
        tanggalSelesai: formData.tanggalSelesai,
        deskripsi: formData.deskripsi
      };
      await suratAPI.createSurat(userId, dataToSend);
      setFormData({ fasilitas: '', keperluan: '', tanggalMulai: '', tanggalSelesai: '', deskripsi: '' });
      setShowForm(false);
      // Refresh surat list
      const updatedResponse = await suratAPI.getSurat(userId);
      const data = updatedResponse.data as { message?: string; data?: any[] };
      if (data.message && Array.isArray(data.data)) {
        setSuratList(data.data);
      }
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Surat berhasil dibuat', confirmButtonText: 'OK' });
    } catch (error: any) {
      console.error('Error creating surat:', error);
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: error.message || 'Gagal membuat surat', confirmButtonText: 'OK' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (suratId: string) => {
    if (!userId) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'User ID tidak ditemukan', confirmButtonText: 'OK' });
      router.push('/login');
      return;
    }
    const result = await Swal.fire({
      title: 'Apakah anda yakin ingin menghapus surat ini?',
      text: 'Surat yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        await suratAPI.deleteSurat(userId, suratId);
        setSuratList(prevList => prevList.filter(s => s.id !== suratId));
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Surat berhasil dihapus', confirmButtonText: 'OK' });
      } catch (error: any) {
        console.error('Error deleting surat:', error);
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal menghapus surat', confirmButtonText: 'OK' });
      }
    }
  };

  const handleDownload = async (suratId: string, filePath: string | null) => {
    if (!filePath) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'File surat belum tersedia', confirmButtonText: 'OK' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Token tidak ditemukan, silakan login kembali', confirmButtonText: 'OK' });
        router.push('/login');
        return;
      }

      // Combine base URL with file path
      const fileUrl = `${STORAGE_BASE_URL}${filePath}`;
      console.log('Downloading file from:', fileUrl);

      // Fetch the file with authorization
      const response = await fetch(fileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = `surat-${suratId}.pdf`; // You can customize the filename
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengunduh file surat', confirmButtonText: 'OK' });
    }
  };

  const handleShowDetail = (surat: Surat) => {
    setSelectedSuratDetail(surat);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSuratDetail(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white text-gray-800 flex flex-col py-8 px-4 border-r border-gray-200 shadow-sm z-10">
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
              <h1 className="text-2xl font-bold text-gray-900">Pembuatan Surat</h1>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Buat Surat Baru
              </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50">
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fasilitas
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feedback
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Dibuat
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                            <p className="text-sm text-gray-500">Memuat data...</p>
                          </div>
                        </td>
                      </tr>
                    ) : suratList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm text-gray-500 font-medium">Belum ada surat</p>
                            <p className="text-xs text-gray-400 mt-1">Klik "Buat Surat Baru" untuk memulai</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      suratList.map((surat) => (
                        <tr key={surat.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="text-sm font-medium text-gray-900 truncate max-w-[180px]" title={surat.fasilitas}>
                              {surat.fasilitas}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]" title={surat.keperluan}>
                              {surat.keperluan}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(surat.status)}`}>
                              {getStatusText(surat.status)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            {surat.feedback ? (
                              <div className="relative group">
                                <div className="text-sm text-gray-600 truncate max-w-[200px] cursor-help" title={surat.feedback}>
                                  {surat.feedback}
                                </div>
                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-xs whitespace-normal">
                                  {surat.feedback}
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="text-sm text-gray-600">
                              {formatDateTime(surat.createdAt)}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleShowDetail(surat)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Detail
                              </button>
                              {surat.status === 'approved' && surat.file && (
                                <button
                                  onClick={() => handleDownload(surat.id, surat.file)}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  Download
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(surat.id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 relative mt-12 animate-fadeIn">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
              aria-label="Tutup"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Buat Surat Baru</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="pemohon" className="block text-sm font-medium text-gray-500 mb-1">
                  Pemohon
                </label>
                <input
                  type="text"
                  id="pemohon"
                  value={userProfile?.username || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Username akan diisi otomatis"
                />
              </div>

              <div>
                <label htmlFor="fasilitas" className="block text-sm font-medium text-gray-500 mb-1">
                  Fasilitas
                </label>
                <input
                  type="text"
                  id="fasilitas"
                  value={formData.fasilitas}
                  onChange={(e) => setFormData(prev => ({ ...prev, fasilitas: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                  placeholder="Masukkan fasilitas yang diminta"
                  required
                />
              </div>

              <div>
                <label htmlFor="keperluan" className="block text-sm font-medium text-gray-500 mb-1">
                  Keperluan
                </label>
                <input
                  type="text"
                  id="keperluan"
                  value={formData.keperluan}
                  onChange={(e) => setFormData(prev => ({ ...prev, keperluan: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                  placeholder="Masukkan keperluan"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tanggalMulai" className="block text-sm font-medium text-gray-500 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="datetime-local"
                    id="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggalMulai: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tanggalSelesai" className="block text-sm font-medium text-gray-500 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="datetime-local"
                    id="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggalSelesai: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-500 mb-1">
                  Deskripsi
                </label>
                <textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                  placeholder="Masukkan deskripsi detail"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Surat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedSuratDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-fadeIn">
            <button
              onClick={handleCloseDetailModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Tutup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="pr-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Surat</h2>
              
              {/* Header Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Fasilitas</label>
                    <p className="text-gray-900 font-medium">{selectedSuratDetail.fasilitas}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedSuratDetail.status)}`}>
                      {getStatusText(selectedSuratDetail.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Mulai</label>
                    <p className="text-gray-900">{formatDateTime(selectedSuratDetail.tanggalMulai)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Selesai</label>
                    <p className="text-gray-900">{formatDateTime(selectedSuratDetail.tanggalSelesai)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Dibuat</label>
                    <p className="text-gray-900">{formatDateTime(selectedSuratDetail.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Keperluan</label>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    {selectedSuratDetail.keperluan}
                  </p>
                </div>
              </div>

              {/* Description */}
              {selectedSuratDetail.deskripsi && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Deskripsi</label>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                      {selectedSuratDetail.deskripsi}
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {selectedSuratDetail.feedback && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Feedback Admin</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p className="text-blue-700 leading-relaxed">{selectedSuratDetail.feedback}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tutup
                </button>
                {selectedSuratDetail.status === 'approved' && selectedSuratDetail.file && (
                  <button
                    onClick={() => handleDownload(selectedSuratDetail.id, selectedSuratDetail.file)}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Download Surat
                  </button>
                )}
                <button
                  onClick={() => {
                    handleCloseDetailModal();
                    handleDelete(selectedSuratDetail.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Hapus Surat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative animate-fadeIn">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Surat Berhasil Dikirim</h3>
              <p className="text-base text-gray-900 mb-4">
                Surat Anda telah berhasil dikirim dan sedang menunggu persetujuan.
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        /* Custom scrollbar for table */
        .overflow-x-auto::-webkit-scrollbar {
          height: 4px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 2px;
        }
        
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  );
} 