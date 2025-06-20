"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, FormEvent, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { pengaduanAPI } from '@/services/api';
import Header from '@/components/Header';

interface Pengaduan {
  id: string;
  userId: string;
  pengaduan: string;
  kategori: string;
  status_pengaduan: 'PengajuanBaru' | 'Ditangani' | 'Selesai';
  feedback: string | null;
  foto: string | null;
  created_at: string;
  updatedAt: string;
}

interface PengaduanResponse {
  message: string;
  data: Pengaduan[];
}

interface ApiResponse {
  data: PengaduanResponse;
}

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

interface ApiError {
  response?: {
    status?: number;
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

const statusColor = (status: Pengaduan['status_pengaduan']) => {
  if (!status) return 'bg-gray-100 text-gray-700';
  
  switch (status) {
    case 'PengajuanBaru': return 'bg-yellow-100 text-yellow-700';
    case 'Ditangani': return 'bg-blue-100 text-blue-700';
    case 'Selesai': return 'bg-green-100 text-green-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const formatStatus = (status: Pengaduan['status_pengaduan']) => {
  if (!status) return 'Unknown';
  return status.replace(/([A-Z])/g, ' $1').trim();
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface FormPengaduan {
  kategori: string;
  pengaduan: string;
  foto?: File | null;
}

const kategoriOptions = [
  'Keamanan',
  'Infrastruktur',
  'Kebersihan',
  'Pelayanan',
  'Lainnya'
];

export default function PengaduanPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [pengaduanList, setPengaduanList] = useState<Pengaduan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kategori: '',
    pengaduan: '',
    foto: null as File | null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPengaduan, setSelectedPengaduan] = useState<Pengaduan | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPengaduanDetail, setSelectedPengaduanDetail] = useState<Pengaduan | null>(null);

  useEffect(() => {
    console.log('=== Debug Pengaduan Page Mount ===');
    console.log('1. Component mounted, checking authentication...');

    const loadAuthData = () => {
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
        toast.error('ID pengguna tidak valid');
        router.push('/login');
        return null;
      }

      console.log('5. Auth data validated successfully');
      return storedUserId.trim();
    };

    const loadPengaduan = async () => {
      setIsLoading(true);
      try {
        const userId = loadAuthData();
        if (!userId) {
          console.log('6. Failed to load auth data');
          return;
        }

        console.log('7. Setting user ID in state:', userId);
        setUserId(userId);
        
        // Fetch pengaduan data from API
        console.log('8. Fetching pengaduan data for user ID:', userId);
        const response = await pengaduanAPI.getPengaduan(userId) as ApiResponse;
        
        // Validate response data
        if (!response?.data?.data) {
          console.log('9. No pengaduan data received or invalid response format');
          setPengaduanList([]);
          return;
        }

        // Ensure pengaduanData is an array
        const pengaduanData = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('10. Received pengaduan data:', pengaduanData.length, 'items');
        
        setPengaduanList(pengaduanData);
        localStorage.setItem('pengaduanList', JSON.stringify(pengaduanData));
      } catch (error: any) {
        console.error('11. Error loading pengaduan:', error);
        if (error?.response?.status === 401) {
          console.log('12. Unauthorized access detected, clearing auth data and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          toast.error('Gagal memuat data pengaduan');
          setPengaduanList([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPengaduan();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.kategori.trim() || !formData.pengaduan.trim()) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Kategori dan pengaduan harus diisi', confirmButtonText: 'OK' });
      return;
    }
    if (!userId) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'User ID tidak ditemukan', confirmButtonText: 'OK' });
      router.push('/login');
      return;
    }
    try {
      setIsSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('kategori', formData.kategori);
      formDataToSend.append('pengaduan', formData.pengaduan);
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto);
      }
      await pengaduanAPI.createPengaduan(userId, formDataToSend);
      setFormData({ kategori: '', pengaduan: '', foto: null });
      setPreviewUrl(null);
      setShowForm(false);
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pengaduan berhasil dibuat', confirmButtonText: 'OK' });
      // Refresh pengaduan list
      const updatedResponse = await pengaduanAPI.getPengaduan(userId) as { data: PengaduanResponse };
      setPengaduanList(updatedResponse.data.data);
      localStorage.setItem('pengaduanList', JSON.stringify(updatedResponse.data.data));
    } catch (error) {
      console.error('Error submitting pengaduan:', error);
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal mengirim pengaduan', confirmButtonText: 'OK' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, foto: file }));
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCloseForm = () => {
    setFormData({ kategori: '', pengaduan: '', foto: null });
    setPreviewUrl(null);
    setShowForm(false);
  };

  const handleDelete = async (pengaduanId: string) => {
    const result = await Swal.fire({
      title: 'Apakah anda yakin ingin menghapus pengaduan ini?',
      text: "Pengaduan yang dihapus tidak dapat dikembalikan",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        if (!userId) {
          toast.error('User ID tidak ditemukan');
          router.push('/login');
          return;
        }

        // Delete pengaduan using API service
        await pengaduanAPI.deletePengaduan(userId, pengaduanId);

        // Refresh pengaduan list
        const updatedResponse = await pengaduanAPI.getPengaduan(userId) as ApiResponse;
        if (updatedResponse?.data?.data) {
          setPengaduanList(updatedResponse.data.data);
          localStorage.setItem('pengaduanList', JSON.stringify(updatedResponse.data.data));
        }
        
        // Close the detail modal
        handleCloseDetailModal();
        
        // Show success message
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Pengaduan berhasil dihapus', confirmButtonText: 'OK' });
      } catch (error: any) {
        console.error('Error deleting pengaduan:', error);
        const apiError = error as ApiError;
        if (apiError?.response?.status === 401) {
          toast.error('Sesi anda telah berakhir, silakan login kembali');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          toast.error('Gagal menghapus pengaduan');
        }
      }
    }
  };

  const handleShowDetail = (pengaduan: Pengaduan) => {
    setSelectedPengaduanDetail(pengaduan);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedPengaduanDetail(null);
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
                <h1 className="text-2xl font-bold text-gray-900">Daftar Pengaduan</h1>
                <button 
                  onClick={() => setShowForm(true)}
                  disabled={isLoading}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Buat Pengaduan Baru
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50">
                        <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deskripsi
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
                      {isLoading ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-8 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2"></div>
                              <p className="text-sm text-gray-500">Memuat data...</p>
                            </div>
                          </td>
                        </tr>
                      ) : pengaduanList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                              </svg>
                              <p className="text-sm text-gray-500 font-medium">Belum ada pengaduan</p>
                              <p className="text-xs text-gray-400 mt-1">Klik "Buat Pengaduan Baru" untuk memulai</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        pengaduanList.map((pengaduan) => (
                          <tr key={pengaduan.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {pengaduan.kategori}
                              </div>
                              {pengaduan.foto && (
                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Foto terlampir
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="relative group">
                                <div className="text-sm text-gray-600 truncate max-w-[200px] cursor-help" title={pengaduan.pengaduan}>
                                  {pengaduan.pengaduan}
                                </div>
                                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-xs whitespace-normal">
                                  {pengaduan.pengaduan}
                                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statusColor(pengaduan.status_pengaduan)}`}>
                                {formatStatus(pengaduan.status_pengaduan)}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              {pengaduan.feedback ? (
                                <div className="relative group">
                                  <div className="text-sm text-gray-600 truncate max-w-[200px] cursor-help" title={pengaduan.feedback}>
                                    {pengaduan.feedback}
                                  </div>
                                  <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 max-w-xs whitespace-normal">
                                    {pengaduan.feedback}
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-sm text-gray-600">
                                {formatDate(pengaduan.created_at)}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleShowDetail(pengaduan)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Detail
                                </button>
                                <button
                                  onClick={() => handleDelete(pengaduan.id)}
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

            {/* Form Modal */}
            {showForm && (
              <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40">
                <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 relative mt-12 animate-fadeIn">
                  <button
                    onClick={handleCloseForm}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
                    aria-label="Tutup"
                  >
                    &times;
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Buat Pengaduan Baru</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="kategori" className="block text-sm font-medium text-gray-500 mb-1">
                          Kategori Pengaduan
                        </label>
                        <select
                          id="kategori"
                          value={formData.kategori}
                          onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                          required
                        >
                          <option value="">Pilih Kategori</option>
                          {kategoriOptions.map((kategori) => (
                            <option key={kategori} value={kategori}>
                              {kategori}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                      <label htmlFor="pengaduan" className="block text-sm font-medium text-gray-500 mb-1">
                          Deskripsi Pengaduan
                        </label>
                        <textarea
                        id="pengaduan"
                        value={formData.pengaduan}
                        onChange={(e) => setFormData(prev => ({ ...prev, pengaduan: e.target.value }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500"
                          placeholder="Jelaskan pengaduan Anda secara detail..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Foto (Opsional)
                        </label>
                        <div className="mt-1 flex items-center gap-4">
                          <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            <span className="text-sm text-gray-500">Pilih File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                          {previewUrl && (
                            <div className="relative w-20 h-20">
                              <Image
                                src={previewUrl}
                                alt="Preview"
                                fill
                                className="object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, foto: null }));
                                  setPreviewUrl(null);
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          Format yang didukung: JPG, PNG. Maksimal 2MB
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleCloseForm}
                          className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Kirim Pengaduan
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedPengaduanDetail && (
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Pengaduan</h2>
                    
                    {/* Header Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
                          <p className="text-gray-900 font-medium">{selectedPengaduanDetail.kategori}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColor(selectedPengaduanDetail.status_pengaduan)}`}>
                            {formatStatus(selectedPengaduanDetail.status_pengaduan)}
                          </span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Dibuat</label>
                          <p className="text-gray-900">{formatDate(selectedPengaduanDetail.created_at)}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Update</label>
                          <p className="text-gray-900">{formatDate(selectedPengaduanDetail.updatedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-600 mb-2">Deskripsi Pengaduan</label>
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {selectedPengaduanDetail.pengaduan}
                        </p>
                      </div>
                    </div>

                    {/* Image */}
                    {selectedPengaduanDetail.foto && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Foto</label>
                        <div className="rounded-lg overflow-hidden bg-gray-50 max-w-lg">
                          <Image
                            src={selectedPengaduanDetail.foto}
                            alt="Foto pengaduan"
                            width={500}
                            height={300}
                            className="w-full h-auto object-cover"
                            onError={(e) => {
                              console.error('Error loading image:', selectedPengaduanDetail.foto);
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Feedback */}
                    {selectedPengaduanDetail.feedback && (
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Feedback Admin</label>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            <p className="text-blue-700 leading-relaxed">{selectedPengaduanDetail.feedback}</p>
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
                      <button
                        onClick={() => {
                          handleCloseDetailModal();
                          handleDelete(selectedPengaduanDetail.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Hapus Pengaduan
                      </button>
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