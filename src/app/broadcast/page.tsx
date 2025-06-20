'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import Header from '@/components/Header';
import { broadcastAPI } from '@/services/api';

interface Broadcast {
  id: string;
  userId: string;
  kategori: 'Keamanan' | 'Infrastruktur' | 'Kebersihan' | 'Pelayanan' | 'Kehilangan' | 'Kegiatan' | 'Promosi' | 'Lainnya';
  broadcast: string;
  tanggal_acara: string | null;
  foto: string | null;
  status_broadcast: 'uploaded' | 'verifying' | 'approved' | 'rejected';
  feedback: string | null;
  createdAt: string;
  user: {
    username: string | null;
    email: string;
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

export default function BroadcastPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    kategori: '' as Broadcast['kategori'] | '',
    konten: '',
    tanggalEvent: '',
    foto: null as File | null
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [myBroadcasts, setMyBroadcasts] = useState<Broadcast[]>([]);
  const [loadingMyBroadcasts, setLoadingMyBroadcasts] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBroadcastDetail, setSelectedBroadcastDetail] = useState<Broadcast | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== Debug Broadcast Page Mount ===');
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

      console.log('5. Auth data validated successfully');
      return storedUserId.trim();
    };

    const loadBroadcasts = async () => {
      setLoading(true);
      try {
        const userId = await loadAuthData();
        if (!userId) {
          console.log('6. Failed to load auth data');
          return;
        }

        console.log('7. Setting user ID in state:', userId);
        setUserId(userId);

        // Fetch all broadcasts
        console.log('8. Fetching all broadcasts');
        const response = await broadcastAPI.getAllBroadcast();
        const data = response.data as { message?: string; data?: Broadcast[] };
        if (data.message?.toLowerCase() === 'success' && Array.isArray(data.data)) {
          setBroadcasts(data.data);
        } else {
          setBroadcasts([]);
        }

        // Fetch user's broadcasts
        console.log('9. Fetching user broadcasts');
        setLoadingMyBroadcasts(true);
        const myResponse = await broadcastAPI.getUserBroadcast(userId);
        const myData = myResponse.data as { message?: string; data?: Broadcast[] };
        if (myData.message?.toLowerCase() === 'success' && Array.isArray(myData.data)) {
          setMyBroadcasts(myData.data);
        } else {
          setMyBroadcasts([]);
        }

      } catch (error: unknown) {
        console.error('10. Error loading broadcasts:', error);
        const errorResponse = error as { response?: { status?: number } };
        if (errorResponse?.response?.status === 401) {
          console.log('11. Unauthorized access detected, clearing auth data and redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          router.push('/login');
        } else {
          await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat data broadcast', confirmButtonText: 'OK' });
          setBroadcasts([]);
          setMyBroadcasts([]);
        }
      } finally {
        setLoading(false);
        setLoadingMyBroadcasts(false);
      }
    };

    loadBroadcasts();
  }, [router]);

  useEffect(() => {
    if (broadcasts.length > 0) {
      localStorage.setItem('broadcasts', JSON.stringify(broadcasts));
    }
  }, [broadcasts]);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Invalid date';
      }

      // For event dates, we want to show the full date format
      if (dateString.includes('T')) {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Baru saja';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} menit yang lalu`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} jam yang lalu`;
      }
    }
    
      // For event dates, format as "DD Month YYYY"
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getKategoriColor = (kategori: Broadcast['kategori']) => {
    switch (kategori) {
      case 'Kegiatan':
        return 'bg-purple-100 text-purple-700';
      case 'Keamanan':
        return 'bg-red-100 text-red-700';
      case 'Infrastruktur':
        return 'bg-blue-100 text-blue-700';
      case 'Kebersihan':
        return 'bg-green-100 text-green-700';
      case 'Pelayanan':
        return 'bg-yellow-100 text-yellow-700';
      case 'Kehilangan':
        return 'bg-orange-100 text-orange-700';
      case 'Promosi':
        return 'bg-pink-100 text-pink-700';
      case 'Lainnya':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: Broadcast['status_broadcast']) => {
    switch (status) {
      case 'uploaded':
        return 'bg-blue-100 text-blue-700';
      case 'verifying':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: Broadcast['status_broadcast']) => {
    switch (status) {
      case 'uploaded':
        return 'Terkirim';
      case 'verifying':
        return 'Sedang Diverifikasi';
      case 'approved':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return '';
    }
  };

  // Update the filtered broadcasts logic
  const filteredBroadcasts = activeTab === 'all' 
    ? broadcasts.filter(b => b.status_broadcast === 'approved')
    : myBroadcasts;

  // Update loading state in the UI
  const isLoading = loading || (activeTab === 'my' && loadingMyBroadcasts);

  const handleDelete = async (broadcastId: string) => {
    if (!userId) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'User ID tidak ditemukan', confirmButtonText: 'OK' });
      router.push('/login');
      return;
    }
    const result = await Swal.fire({
      title: 'Apakah anda yakin ingin menghapus broadcast ini?',
      text: 'Broadcast yang dihapus tidak dapat dikembalikan',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        await broadcastAPI.deleteBroadcast(userId, broadcastId);
        const updatedList = broadcasts.filter(b => b.id !== broadcastId);
        setBroadcasts(updatedList);
        setMyBroadcasts(myBroadcasts.filter(b => b.id !== broadcastId));
        localStorage.setItem('broadcasts', JSON.stringify(updatedList));
        Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Broadcast berhasil dihapus', confirmButtonText: 'OK' });
      } catch (error: unknown) {
        console.error('Error deleting broadcast:', error);
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal menghapus broadcast', confirmButtonText: 'OK' });
      }
    }
  };

  const handleCreateBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.kategori.trim() || !formData.konten.trim()) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Kategori dan konten broadcast harus diisi', confirmButtonText: 'OK' });
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
      formDataToSend.append('broadcast', formData.konten);
      if (formData.tanggalEvent) {
        formDataToSend.append('tanggal_acara', new Date(formData.tanggalEvent).toISOString());
      }
      if (formData.foto) {
        formDataToSend.append('foto', formData.foto);
      }
      await broadcastAPI.createBroadcast(userId, formDataToSend);
      setFormData({ kategori: '' as Broadcast['kategori'] | '', konten: '', tanggalEvent: '', foto: null });
      setPreviewUrl(null);
      setShowForm(false);

      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Broadcast berhasil dibuat', confirmButtonText: 'OK' });
    } catch (error) {
      console.error('Error creating broadcast:', error);
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal membuat broadcast', confirmButtonText: 'OK' });
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
    setFormData({
      kategori: '' as Broadcast['kategori'] | '',
      konten: '',
      tanggalEvent: '',
      foto: null
    });
    setPreviewUrl(null);
    setShowForm(false);
  };

  const handleShowDetail = (broadcast: Broadcast) => {
    setSelectedBroadcastDetail(broadcast);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedBroadcastDetail(null);
  };

  const handleShowImage = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const handleCloseImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
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
      <div className="flex-1 flex flex-col">
        <Header />
        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
                  <p className="text-gray-500 mt-1">Lihat dan buat pengumuman untuk warga Cherry Field</p>
                </div>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Buat Broadcast
                </button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-4 mt-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'all'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Semua Broadcast
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'my'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Broadcast Saya
                </button>
              </div>
            </div>

            {/* Broadcast List */}
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded w-3/4 mb-4"></div>
                    <div className="h-32 bg-gray-100 rounded mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : filteredBroadcasts.length > 0 ? (
              activeTab === 'my' ? (
                // Table layout for "Broadcast Saya"
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Konten
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Dibuat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBroadcasts.map((broadcast) => (
                          <tr key={broadcast.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getKategoriColor(broadcast.kategori)}`}>
                                {broadcast.kategori}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <p className="line-clamp-2">{broadcast.broadcast}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(broadcast.status_broadcast)}`}>
                                {getStatusText(broadcast.status_broadcast)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(broadcast.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleShowDetail(broadcast)}
                                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Detail
                                </button>
                                <button
                                  onClick={() => handleDelete(broadcast.id)}
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                // Card layout for "Semua Broadcast"
                <div className="space-y-4">
                  {filteredBroadcasts.map((broadcast) => (
                    <div key={broadcast.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Header with category and status */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getKategoriColor(broadcast.kategori)}`}>
                              {broadcast.kategori}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(broadcast.createdAt)}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {broadcast.user?.username || broadcast.user?.email || 'Unknown User'}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        {/* Broadcast text */}
                        <p className="text-gray-700 whitespace-pre-line mb-4">
                          {broadcast.broadcast}
                        </p>

                        {/* Image */}
                        {broadcast.foto && (
                          <div className="mb-4 rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:shadow-lg transition-shadow duration-300">
                            <img
                              src={broadcast.foto}
                              alt="Broadcast photo"
                              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                              onClick={() => handleShowImage(broadcast.foto!)}
                              onError={(e) => {
                                console.error('Error loading image:', broadcast.foto);
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Event date */}
                        {broadcast.tanggal_acara && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(broadcast.tanggal_acara).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}

                        {/* Feedback */}
                        {broadcast.feedback && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-start gap-2">
                              <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Feedback</p>
                                <p className="text-sm text-blue-600">{broadcast.feedback}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'all' ? 'Belum Ada Broadcast' : 'Belum Ada Broadcast Saya'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'all' 
                    ? 'Belum ada broadcast yang dibuat oleh warga. Jadilah yang pertama untuk membuat broadcast!'
                    : 'Anda belum membuat broadcast apapun. Mulai buat broadcast untuk berbagi informasi dengan warga lainnya.'}
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Buat Broadcast Baru
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 relative animate-fadeIn">
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Tutup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Buat Broadcast Baru</h2>
            <form onSubmit={handleCreateBroadcast}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori Broadcast
                  </label>
                  <select
                    id="kategori"
                    value={formData.kategori}
                    onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value as Broadcast['kategori'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="Keamanan">Keamanan</option>
                    <option value="Infrastruktur">Infrastruktur</option>
                    <option value="Kebersihan">Kebersihan</option>
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="Kehilangan">Kehilangan</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Promosi">Promosi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="konten" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi Broadcast
                  </label>
                  <textarea
                    id="konten"
                    value={formData.konten}
                    onChange={(e) => setFormData(prev => ({ ...prev, konten: e.target.value }))}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white resize-none"
                    placeholder="Tulis isi broadcast Anda di sini..."
                    required
                  />
                </div>
                <div>
                  <label htmlFor="tanggalEvent" className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Acara <span className="text-gray-500 text-xs">(Opsional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="tanggalEvent"
                    value={formData.tanggalEvent}
                    onChange={(e) => setFormData(prev => ({ ...prev, tanggalEvent: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Foto <span className="text-gray-500 text-xs">(Opsional)</span>
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      {previewUrl ? (
                        <div className="relative">
                          <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewUrl(null);
                              setFormData(prev => ({ ...prev, foto: null }));
                            }}
                            className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <>
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="foto" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload foto</span>
                              <input
                                id="foto"
                                name="foto"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">atau drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF sampai 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Memproses...' : 'Kirim Broadcast'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedBroadcastDetail && (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Detail Broadcast</h2>
              
              {/* Header Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Kategori</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getKategoriColor(selectedBroadcastDetail.kategori)}`}>
                      {selectedBroadcastDetail.kategori}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBroadcastDetail.status_broadcast)}`}>
                      {getStatusText(selectedBroadcastDetail.status_broadcast)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Dibuat</label>
                    <p className="text-gray-900">{formatDateTime(selectedBroadcastDetail.createdAt)}</p>
                  </div>
                  {selectedBroadcastDetail.tanggal_acara && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Tanggal Acara</label>
                      <p className="text-gray-900">{new Date(selectedBroadcastDetail.tanggal_acara).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600 mb-2">Konten Broadcast</label>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {selectedBroadcastDetail.broadcast}
                  </p>
                </div>
              </div>

              {/* Image */}
              {selectedBroadcastDetail.foto && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Foto</label>
                  <div className="rounded-lg overflow-hidden bg-gray-50 max-w-lg cursor-pointer hover:shadow-lg transition-shadow duration-300">
                    <img
                      src={selectedBroadcastDetail.foto}
                      alt="Broadcast photo"
                      className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                      onClick={() => handleShowImage(selectedBroadcastDetail.foto!)}
                      onError={(e) => {
                        console.error('Error loading image:', selectedBroadcastDetail.foto);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">Klik gambar untuk melihat ukuran penuh</p>
                </div>
              )}

              {/* Feedback */}
              {selectedBroadcastDetail.feedback && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Feedback Admin</label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <p className="text-blue-700 leading-relaxed">{selectedBroadcastDetail.feedback}</p>
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
                    handleDelete(selectedBroadcastDetail.id);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Hapus Broadcast
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Modal */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={handleCloseImageModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Tutup"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Full size image"
              className="max-w-[80vw] max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-2xl cursor-pointer"
              onClick={handleCloseImageModal}
              onError={(e) => {
                console.error('Error loading full size image:', selectedImage);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-lg">
            Klik gambar atau tombol X untuk menutup
          </div>
        </div>
      )}
    </div>
  );
} 