'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { Toaster, Toast } from 'react-hot-toast';
import { tagihanAPI, paymentAPI } from '@/services/api';
import Script from 'next/script';
import Header from '@/components/Header';

interface Transaksi {
  id: string;
  grossAmount: string;
  currency: string;
  paymentType: string;
  settlementTime: string;
  transactionStatus: string;
}

interface TagihanItem {
  id: string;
  bulan: string;
  tahun: string;
  nominal: number;
  status_bayar: string;
  jatuhTempo: string;
  userId: string;
  userName: string;
  metodePembayaran?: 'transfer' | 'cash' | 'qris';
  tanggalPembayaran?: string;
  buktiPembayaran?: string;
  metode_bayar?: string;
  snap_token?: string;
  createdAt?: string;
  lastReminderAt?: string | null;
  reminderCount?: number;
  transaksi?: Transaksi[];
}

interface ApiResponse {
  message: string;
  data: TagihanItem[];
}

interface ApiErrorResponse {
  message: string;
  statusCode: number;
}

// Interface for the user profile stored in state
interface UserProfileState {
  id: string;
  username: string | null;
  email: string;
  role: 'user' | 'admin';
}

// Interface for the complete user profile from localStorage
interface UserProfileStorage {
  id: string;
  username: string;
  role: 'user' | 'admin';
  email: string;
}

interface PaymentTokenResponse {
  success: boolean;
  snap_token: string;
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

// Add type declaration for window.snap before the component
declare global {
  interface Window {
    snap: {
      pay: (token: string, callbacks: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError: (result: any) => void;
        onClose: () => void;
      }) => void;
      hide: () => void;
    };
  }
}

export default function IuranPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [iuranList, setIuranList] = useState<TagihanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIuran, setSelectedIuran] = useState<TagihanItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'unpaid' | 'history'>('unpaid');
  const [snapInstance, setSnapInstance] = useState<Window['snap'] | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<TagihanItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<TagihanItem | null>(null);

  const fetchUnpaidBills = async (userId: string) => {
    console.log('=== Debug Fetch Unpaid Bills ===');
    console.log('1. Starting fetchUnpaidBills with userId:', userId);
    
    try {
      // Verify user ID before making API call
      if (!userId) {
        throw new Error('User ID tidak valid');
      }

      // Log API configuration
      console.log('2. Using tagihanAPI.getTagihan with userId:', userId);

      // Log request headers
      const token = localStorage.getItem('token');
      console.log('3. Request Headers:', {
        token: token ? `${token.substring(0, 10)}...` : 'not found'
      });

      const response = await tagihanAPI.getTagihan(userId);
      const responseData = response.data as ApiResponse;
      
      console.log('4. API Response:', {
        data: responseData
      });

      if (responseData.message === 'Belum ada tagihan') {
        // If there are no tagihan, set empty list and show message
        setIuranList([]);
        return;
      }

      if (responseData && Array.isArray(responseData.data)) {
        console.log('5. Processing API data:', {
          totalItems: responseData.data.length,
          sampleItem: responseData.data[0]
        });

        // Transform API data to match our TagihanItem interface
        const transformedData = responseData.data.map((item: TagihanItem) => {
          // Map API status_bayar to our status values
          let status: TagihanItem['status_bayar'];
          switch (item.status_bayar.toLowerCase()) {
            case 'berhasil':
              status = 'berhasil';
              break;
            case 'belum bayar':
              status = 'belumlunas';
              break;
            case 'gagal':
              status = 'gagal';
              break;
            case 'belum bayar':
            default:
              status = 'belumlunas';
          }

          return {
            ...item,
            status_bayar: status,
            jatuhTempo: item.jatuhTempo || new Date().toISOString()
          };
        });

        console.log('6. Transformed data:', {
          totalItems: transformedData.length,
          sampleItem: transformedData[0]
        });

        // Update iuran list with unpaid bills
        setIuranList(prevList => {
          const paidBills = prevList.filter(i => i.status_bayar !== 'belumlunas');
          const newList = [...paidBills, ...transformedData];
          console.log('7. Updated iuran list:', {
            previousCount: prevList.length,
            paidBillsCount: paidBills.length,
            newUnpaidBillsCount: transformedData.length,
            finalListCount: newList.length
          });
          return newList;
        });
      } else {
        console.error('8. Invalid API response format:', {
          hasData: !!responseData,
          isArray: Array.isArray(responseData?.data),
          responseData: responseData
        });
      }
    } catch (error: any) {
      const rawMsg = error?.response?.data?.message || '';
      const msg = rawMsg.toLowerCase();
      if (
        msg === 'belum ada riwayat' ||
        msg === 'belum ada riwayat pembayaran' ||
        msg.includes('no paid invoices') ||
        msg.includes('no unpaid invoices') ||
        msg === 'belum ada tagihan' ||
        error?.response?.status === 404
      ) {
        setIuranList([]);
        return;
      }
      // Jangan pernah panggil toast apapun di sini
    }
  };

  const fetchPaymentHistory = async (userId: string) => {
    console.log('=== Debug Fetch Payment History ===');
    console.log('1. Starting fetchPaymentHistory with userId:', userId);
    
    setLoadingHistory(true);
    try {
      if (!userId) {
        throw new Error('User ID tidak valid');
      }

      const response = await tagihanAPI.getRiwayatTagihan(userId);
      const responseData = response.data as ApiResponse;
      
      console.log('2. Payment History Response:', {
        data: responseData
      });

      if (responseData.message === 'Belum ada riwayat') {
        setPaymentHistory([]);
        return;
      }

      if (responseData && Array.isArray(responseData.data)) {
        const transformedData = responseData.data.map((item: TagihanItem) => ({
          ...item,
          status_bayar: item.status_bayar.toLowerCase() === 'berhasil' ? 'berhasil' : 
                       item.status_bayar.toLowerCase() === 'gagal' ? 'gagal' : 'lunas',
          jatuhTempo: item.jatuhTempo || new Date().toISOString()
        }));

        setPaymentHistory(transformedData);
      } else {
        // Jangan pernah panggil toast apapun di sini
      }
    } catch (error: any) {
      const rawMsg = error?.response?.data?.message || '';
      const msg = rawMsg.toLowerCase();
      if (
        msg === 'belum ada riwayat' ||
        msg === 'belum ada riwayat pembayaran' ||
        msg.includes('no paid invoices') ||
        error?.response?.status === 404
      ) {
        setPaymentHistory([]);
        return;
      }
      // Jangan pernah panggil toast apapun di sini
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    console.log('=== Debug Iuran Page Mount ===');
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
        router.push('/login');
        return null;
      }

      console.log('5. Auth data validated successfully');
      return storedUserId.trim();
    };

    const userId = loadAuthData();
    if (userId) {
      console.log('6. Setting user ID in state:', userId);
      setUserId(userId);
      
      // Fetch unpaid bills using the user ID
      console.log('7. Fetching unpaid bills for user ID:', userId);
      fetchUnpaidBills(userId);
    } else {
      console.log('6. Failed to load auth data');
    }

    // Load existing paid bills from localStorage
    const savedIuran = localStorage.getItem('iuran');
    if (savedIuran) {
      try {
        const parsedIuran = JSON.parse(savedIuran);
        const paidBills = parsedIuran.filter((i: TagihanItem) => i.status_bayar !== 'belumlunas');
        setIuranList(paidBills);
        console.log('8. Loaded existing paid bills:', {
          totalBills: parsedIuran.length,
          paidBills: paidBills.length
        });
      } catch (error) {
        console.error('Error loading saved iuran:', error);
      }
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    // Initialize Midtrans Snap when script is loaded
    if (window.snap) {
      setSnapInstance(window.snap);
    }
  }, []);

  // Update useEffect to fetch history when tab changes
  useEffect(() => {
    if (activeTab === 'history' && userId) {
      fetchPaymentHistory(userId);
    }
  }, [activeTab, userId]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getMetodePembayaranText = (metode: TagihanItem['metodePembayaran']) => {
    switch (metode) {
      case 'transfer':
        return 'Transfer Bank';
      case 'cash':
        return 'Tunai';
      case 'qris':
        return 'QRIS';
      default:
        return metode;
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-700';
    
    switch (status.toLowerCase()) {
      case 'berhasil':
        return 'bg-green-100 text-green-700';
      case 'lunas':
        return 'bg-green-100 text-green-700';
      case 'gagal':
        return 'bg-red-100 text-red-700';
      case 'belumlunas':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    if (!status) return 'Tidak Diketahui';
    
    switch (status.toLowerCase()) {
      case 'berhasil':
        return 'Berhasil';
      case 'lunas':
        return 'lunas';
      case 'gagal':
        return 'Gagal';
      case 'belumlunas':
        return 'Belum Lunas';
      default:
        return status;
    }
  };

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'bank_transfer':
        return 'Transfer Bank';
      case 'manual':
        return 'Manual';
      case 'qris':
        return 'QRIS';
      default:
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'settlement':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'expire':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTransactionStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'settlement':
        return 'Selesai';
      case 'pending':
        return 'Menunggu';
      case 'expire':
        return 'Kadaluarsa';
      default:
        return status;
    }
  };

  const handleBayar = async (iuran: TagihanItem) => {
    const result = await Swal.fire({
      title: 'Konfirmasi Pembayaran',
      html: `
        <div class="text-left">
          <p class="mb-2">Detail Pembayaran:</p>
          <p class="mb-1">Periode: ${iuran.bulan} ${iuran.tahun}</p>
          <p class="mb-1">Nominal: ${formatCurrency(iuran.nominal)}</p>
          <p class="mb-1">Jatuh Tempo: ${formatDateTime(iuran.jatuhTempo)}</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Pilih Metode Pembayaran',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      const { value: metodePembayaran } = await Swal.fire({
        title: 'Pilih Metode Pembayaran',
        input: 'select',
        inputOptions: {
          transfer: 'Transfer Bank',
          cash: 'Tunai',
          qris: 'QRIS'
        },
        inputPlaceholder: 'Pilih metode pembayaran',
        showCancelButton: true,
        confirmButtonText: 'Bayar',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
          if (!value) {
            return 'Anda harus memilih metode pembayaran';
          }
        }
      });

      if (metodePembayaran) {
        try {
          // TODO: Implement API call to process payment
          // For now, we'll just update the local state
        const updatedIuran = {
          ...iuran,
          status_bayar: 'lunas' as const,
          metodePembayaran: metodePembayaran as 'transfer' | 'cash' | 'qris',
          tanggalPembayaran: new Date().toISOString()
        };

        // Update the list
        const updatedList = iuranList.map(item => 
          item.id === iuran.id ? updatedIuran : item
        );
        setIuranList(updatedList);
        localStorage.setItem('iuran', JSON.stringify(updatedList));

        // Show success message
        Swal.fire({
          title: 'Pembayaran Diproses',
          text: 'Pembayaran Anda sedang diproses. Silakan tunggu konfirmasi dari admin.',
          icon: 'success',
          timer: 2000
        });

          // Refresh unpaid bills
          const savedProfile = localStorage.getItem('userProfile');
          if (savedProfile) {
            const parsedProfile = JSON.parse(savedProfile);
            if (parsedProfile.id) {
              await fetchUnpaidBills(parsedProfile.id);
            }
          }
        } catch (error) {
          console.error('Error processing payment:', error);
        }
      }
    }
  };

  const handleSnapCallback = (result: any) => {
    if (result.status === 'success') {
      // Close the popup after successful payment
      if (snapInstance) {
        snapInstance.hide();
      }
    } else if (result.status === 'pending') {
      // Close the popup for pending payment too
      if (snapInstance) {
        snapInstance.hide();
      }
    } else if (result.status === 'error') {
      // Close the popup on error
      if (snapInstance) {
        snapInstance.hide();
      }
    }
  };

  // Update the filteredIuran logic to remove search filtering
  const filteredIuran = activeTab === 'unpaid' 
    ? iuranList.filter(iuran => iuran.status_bayar?.toLowerCase() === 'belumlunas')
    : paymentHistory;

  // Update loading state to include history loading
  const isLoading = loading || (activeTab === 'history' && loadingHistory);

  // Tambahkan fungsi bantu untuk konversi angka ke nama bulan Indonesia
  const getNamaBulan = (bulan: string | number) => {
    const bulanArr = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const idx = typeof bulan === 'string' ? parseInt(bulan, 10) - 1 : bulan - 1;
    return bulanArr[idx] || bulan;
  };

  return (
    <>
      <Script 
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key="SB-Mid-client-zHW-GzDnulHC8bbY"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.snap) {
            setSnapInstance(window.snap);
          }
        }}
      />
      <Toaster />
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
                <h1 className="text-2xl font-bold text-gray-900">Iuran Bulanan</h1>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'unpaid'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Belum Dibayar
                    {iuranList.filter(i => i.status_bayar?.toLowerCase() === 'belumlunas').length > 0 && (
                      <span className="ml-2 bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                        {iuranList.filter(i => i.status_bayar?.toLowerCase() === 'belumlunas').length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Riwayat Pembayaran
                  </button>
                </nav>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              )}

              {/* Iuran List */}
              {!isLoading && (
                <div className="space-y-4">
                  {filteredIuran.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {activeTab === 'unpaid' 
                          ? 'Tidak ada iuran yang belum dibayar'
                          : 'Belum ada riwayat pembayaran'}
                      </p>
                    </div>
                  ) : (
                    activeTab === 'history' ? (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nominal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu Pembayaran</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredIuran.map((iuran) => (
                                <tr key={iuran.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getNamaBulan(iuran.bulan)} {iuran.tahun}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(iuran.nominal)}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(iuran.status_bayar)}`}>
                                      {getStatusText(iuran.status_bayar)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {iuran.tanggalPembayaran
                                      ? formatDateTime(iuran.tanggalPembayaran)
                                      : (iuran.transaksi && iuran.transaksi[0]?.settlementTime
                                          ? formatDateTime(iuran.transaksi[0].settlementTime)
                                          : '-')}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                      onClick={() => setSelectedDetail(iuran)}
                                      className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition gap-2"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      Lihat Detail
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      filteredIuran.map((iuran) => (
                        <div
                          key={iuran.id}
                          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
                        >
                          <div className="flex flex-col gap-4">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(iuran.status_bayar)}`}>
                                    {getStatusText(iuran.status_bayar)}
                                  </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Iuran {iuran.bulan} {iuran.tahun}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                  Jatuh Tempo: {formatDateTime(iuran.jatuhTempo)}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <div className="text-xl font-bold text-gray-900">
                                  {formatCurrency(iuran.nominal)}
                                </div>
                                <div className="flex gap-2">
                                  {activeTab === 'unpaid' && iuran.status_bayar?.toLowerCase() === 'belumlunas' && (
                                    <button
                                      onClick={async () => {
                                        try {
                                          const response = await paymentAPI.getPaymentToken({
                                            id: iuran.id,
                                          });
                                          const data = response.data as PaymentTokenResponse;
                                          if (data.success && data.snap_token) {
                                            if (snapInstance) {
                                              snapInstance.pay(data.snap_token, {
                                                onSuccess: (result: any) => handleSnapCallback(result),
                                                onPending: (result: any) => handleSnapCallback(result),
                                                onError: (result: any) => handleSnapCallback(result),
                                                onClose: () => {}
                                              });
                                            }
                                          }
                                        } catch (error: any) {}
                                      }}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                      Bayar Sekarang
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              )}
            </div>

            {/* Detail Modal */}
            {selectedDetail && (
              <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                  onClick={() => setSelectedDetail(null)}
                ></div>

                {/* Modal Panel */}
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div 
                      className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                          <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Detail Pembayaran
                              </h3>
                              <button
                                onClick={() => setSelectedDetail(null)}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            <div className="mt-4 space-y-6">
                              {/* Basic Info */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Informasi Tagihan</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Periode</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {getNamaBulan(selectedDetail.bulan)} {selectedDetail.tahun}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedDetail.status_bayar)}`}>
                                      {getStatusText(selectedDetail.status_bayar)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Nominal</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatCurrency(selectedDetail.nominal)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Jatuh Tempo</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatDateTime(selectedDetail.jatuhTempo)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Transaction Details */}
                              {selectedDetail.transaksi && selectedDetail.transaksi.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="text-sm font-medium text-gray-900 mb-3">Detail Transaksi</h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-gray-500">ID Transaksi</p>
                                      <p className="text-sm font-medium text-gray-900 break-all">
                                        {selectedDetail.transaksi[0].id}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Status Transaksi</p>
                                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getTransactionStatusColor(selectedDetail.transaksi[0].transactionStatus)}`}>
                                        {getTransactionStatusText(selectedDetail.transaksi[0].transactionStatus)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Waktu Pembayaran</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatDateTime(selectedDetail.transaksi[0].settlementTime)}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Nominal</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(Number(selectedDetail.transaksi[0].grossAmount))}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-gray-500">Mata Uang</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {selectedDetail.transaksi[0].currency}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Additional Info */}
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-3">Informasi Tambahan</h4>
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm text-gray-500">Dibuat pada</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {selectedDetail.createdAt ? formatDateTime(selectedDetail.createdAt) : '-'}
                                    </p>
                                  </div>
                                  {selectedDetail.lastReminderAt && (
                                    <div>
                                      <p className="text-sm text-gray-500">Pengingat terakhir</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatDateTime(selectedDetail.lastReminderAt)}
                                      </p>
                                    </div>
                                  )}
                                  {selectedDetail.reminderCount !== undefined && selectedDetail.reminderCount > 0 && (
                                    <div>
                                      <p className="text-sm text-gray-500">Jumlah pengingat</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {selectedDetail.reminderCount}x
                                      </p>
                                    </div>
                                  )}
                                  {selectedDetail.snap_token && (
                                    <div>
                                      <p className="text-sm text-gray-500">Snap Token</p>
                                      <p className="text-sm font-medium text-gray-900 break-all">
                                        {selectedDetail.snap_token}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          onClick={() => setSelectedDetail(null)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
} 