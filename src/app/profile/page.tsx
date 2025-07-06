"use client";

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Swal from 'sweetalert2';
import toast, { Toaster } from 'react-hot-toast';
import { profileAPI, familyAPI } from '@/services/api';
import Header from '@/components/Header';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone?: string;
  cluster?: string;
  nomor_rumah?: string;
  rt?: string;
  rw?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
}

interface PasswordForm {
  newPassword: string;
  confirmPassword: string;
}

interface PasswordVisibility {
  newPassword: boolean;
  confirmPassword: boolean;
}

interface ProfileResponse {
  message: string;
  data: {
    id: string;
    username: string;
    email: string;
    phone: string | null;
    cluster: string | null;
    nomor_rumah: string | null;
    rt: string | null;
    rw: string | null;
    role: 'user' | 'admin';
    isVerified: boolean;
  }
}

interface Occupant {
  id: string;
  nama: string;
  nik: string;
  gender: 'Laki-laki' | 'Perempuan';
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

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [headerProfile, setHeaderProfile] = useState<{ 
    username: string | null; 
    email: string;
    role: 'user' | 'admin' 
  } | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    username: '',
    email: '',
    phone: '',
    cluster: '',
    nomor_rumah: '',
    rt: '',
    rw: '',
    role: 'user',
    isVerified: false
  });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordVisibility, setPasswordVisibility] = useState<PasswordVisibility>({
    newPassword: false,
    confirmPassword: false
  });
  const [occupants, setOccupants] = useState<Occupant[]>([]);
  const [newOccupant, setNewOccupant] = useState<Omit<Occupant, 'id'>>({
    nama: '',
    nik: '',
    gender: 'Laki-laki'
  });
  const [isAddingOccupant, setIsAddingOccupant] = useState(false);
  const [isEditingOccupant, setIsEditingOccupant] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{ available: boolean; message: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch profile from API
        const { data: responseData } = await profileAPI.getProfile();
        const apiResponse = responseData as ProfileResponse;
        
        // Set header profile
        setHeaderProfile({
          username: apiResponse.data.username,
          email: apiResponse.data.email,
          role: apiResponse.data.role || 'user'
        });
        
        // Set full profile
        const userProfileData = {
          id: apiResponse.data.id,
          username: apiResponse.data.username,
          email: apiResponse.data.email,
          phone: apiResponse.data.phone || '',
          cluster: apiResponse.data.cluster || '',
          nomor_rumah: apiResponse.data.nomor_rumah || '',
          rt: apiResponse.data.rt || '',
          rw: apiResponse.data.rw || '',
          role: apiResponse.data.role || 'user',
          isVerified: apiResponse.data.isVerified
        };
        
        setUserProfile(userProfileData);
        setFormData(userProfileData);
        
        // Update localStorage
        localStorage.setItem('userProfile', JSON.stringify(userProfileData));
      } catch (error) {
        console.error('Error fetching profile:', error);
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat profil', confirmButtonText: 'OK' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    const fetchOccupants = async () => {
      // Only fetch occupants if user is verified
      if (!userProfile?.id || !userProfile?.isVerified) {
        setOccupants([]);
        return;
      }
    
      try {
        const response = await familyAPI.getFamilyData(userProfile.id);
        const { data } = response.data as { data?: any[] };
        setOccupants(data || []);
      } catch (error) {
        // Silently handle error for unverified accounts
        if (!userProfile?.isVerified) {
          setOccupants([]);
          return;
        }
        console.error('Error fetching occupants:', error);
        await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Gagal memuat data penghuni', confirmButtonText: 'OK' });
      }
    };

    if (userProfile?.id) {
      fetchOccupants();
    }
  }, [userProfile?.id, userProfile?.isVerified]);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile) {
      await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Data profil tidak ditemukan', confirmButtonText: 'OK' });
      return;
    }
    try {
      setIsLoading(true);
      const requestBody: any = {
        username: formData.username,
        phone: formData.phone || ''
      };
      if (passwordForm.newPassword && passwordForm.confirmPassword) {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Password baru dan konfirmasi password tidak cocok', confirmButtonText: 'OK' });
          return;
        }
        if (passwordForm.newPassword.length < 8) {
          await Swal.fire({ icon: 'error', title: 'Gagal!', text: 'Password baru minimal 8 karakter', confirmButtonText: 'OK' });
          return;
        }
        requestBody['password'] = passwordForm.newPassword;
      }
      await profileAPI.updateProfile(userProfile.id, requestBody);
      const updatedProfile: UserProfile = {
        ...userProfile,
        username: formData.username,
        phone: formData.phone || ''
      };
      setUserProfile(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setIsEditing(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Profil berhasil diperbarui', confirmButtonText: 'OK' });
    } catch (error) {
      const err: any = error;
      console.error('Error updating profile:', err);
      toast.error(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

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
      localStorage.removeItem('userProfile');
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

  const togglePasswordVisibility = (field: keyof PasswordVisibility) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleAddOccupant = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;
    if (!newOccupant.nama || !newOccupant.nik) {
      toast.error('Nama lengkap dan NIK harus diisi');
      return;
    }
    if (newOccupant.nik.length !== 16) {
      toast.error('NIK harus 16 digit');
      return;
    }
    try {
      await familyAPI.createFamilyData(userProfile.id, {
        nama: newOccupant.nama,
        nik: newOccupant.nik,
        gender: newOccupant.gender
      });
      const response = await familyAPI.getFamilyData(userProfile.id);
      const { data } = response.data as { data?: any[] };
      setOccupants(data || []);
      setNewOccupant({ nama: '', nik: '', gender: 'Laki-laki' });
      setIsAddingOccupant(false);
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data penghuni berhasil ditambahkan', confirmButtonText: 'OK' });
    } catch (error) {
      console.error('Error adding occupant:', error);
      toast.error('Gagal menambahkan data penghuni');
    }
  };

  const handleEditOccupant = async (e: FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id || !isEditingOccupant) return;
    if (!newOccupant.nama || !newOccupant.nik) {
      toast.error('Nama lengkap dan NIK harus diisi');
      return;
    }
    if (newOccupant.nik.length !== 16) {
      toast.error('NIK harus 16 digit');
      return;
    }
    try {
      await familyAPI.updateFamilyData(userProfile.id, isEditingOccupant, {
        nama: newOccupant.nama,
        nik: newOccupant.nik,
        gender: newOccupant.gender
      });
      const response = await familyAPI.getFamilyData(userProfile.id);
      const { data } = response.data as { data?: any[] };
      setOccupants(data || []);
      setNewOccupant({ nama: '', nik: '', gender: 'Laki-laki' });
      setIsEditingOccupant(null);
      await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data penghuni berhasil diperbarui', confirmButtonText: 'OK' });
    } catch (error) {
      console.error('Error updating occupant:', error);
      toast.error('Gagal memperbarui data penghuni');
    }
  };

  const handleDeleteOccupant = async (id: string) => {
    if (!userProfile?.id) return;
    const result = await Swal.fire({
      title: 'Apakah anda yakin?',
      text: 'Data penghuni akan dihapus permanen',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    });
    if (result.isConfirmed) {
      try {
        await familyAPI.deleteFamilyData(userProfile.id, id);
        setOccupants(prev => prev.filter(occupant => occupant.id !== id));
        await Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data penghuni berhasil dihapus', confirmButtonText: 'OK' });
      } catch (error) {
        console.error('Error deleting occupant:', error);
        toast.error('Gagal menghapus data penghuni');
      }
    }
  };

  const startEditOccupant = (occupant: Occupant) => {
    setNewOccupant({
      nama: occupant.nama,
      nik: occupant.nik,
      gender: occupant.gender
    });
    setIsEditingOccupant(occupant.id);
  };

  const checkUsername = async () => {
    if (!formData.username) {
      toast.error('Username tidak boleh kosong');
      return;
    }

    try {
      setIsCheckingUsername(true);
      setUsernameStatus(null);
      let response;
      try {
        response = await profileAPI.checkUsername(formData.username);
      } catch (error: any) {
        if (error.response && error.response.status === 400) {
          setUsernameStatus({
            available: false,
            message: 'Username tidak dapat digunakan'
          });
          return;
        }
        throw error;
      }
      if (response.status === 200) {
        setUsernameStatus({
          available: true,
          message: 'Username dapat digunakan'
        });
      }
    } catch (error) {
      const err: any = error;
      if (!(err.response && err.response.status === 400)) {
        console.error('Error checking username:', {
          error: err,
          username: formData.username
        });
        toast.error(err instanceof Error ? err.message : 'Gagal mengecek username');
      }
    } finally {
      setIsCheckingUsername(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
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
      <div className="flex-1 flex flex-col ml-64">
          <Header />
          <main className="flex-1 p-8">
            {!userProfile?.isVerified && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Akun Anda belum diverifikasi. Silakan lengkapi data profil Anda untuk mengakses semua fitur.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Profile Card */}
              <div className="bg-white shadow rounded-lg">
                {/* Profile Header */}
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Profil Akun</h3>
                      <p className="mt-1 text-sm text-gray-500">Informasi pribadi dan pengaturan akun</p>
                    </div>
                    {!isEditing && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit Profil
                        </button>
                    )}
                  </div>
                </div>

                {/* Profile Content */}
                <div className="px-4 py-5 sm:p-6">
                  {isEditing ? (
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                          <input
                            type="text"
                            id="username"
                            value={formData.username || ''}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, username: e.target.value }));
                                setUsernameStatus(null);
                              }}
                              className="block w-full border border-gray-300 rounded-l-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                            required
                          />
                            <button
                              type="button"
                              onClick={checkUsername}
                              disabled={isCheckingUsername || !formData.username}
                              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCheckingUsername ? (
                                <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                'Cek'
                              )}
                            </button>
                          </div>
                          {usernameStatus && (
                            <p className={`mt-1 text-sm ${usernameStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                              {usernameStatus.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="nomorTelepon" className="block text-sm font-medium text-gray-700">
                            Nomor Telepon
                          </label>
                          <input
                            type="tel"
                            id="nomorTelepon"
                            value={formData.phone || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white text-gray-900"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="cluster" className="block text-sm font-medium text-gray-700">
                            Cluster
                          </label>
                          <input
                            type="text"
                            id="cluster"
                            value={formData.cluster || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, cluster: e.target.value }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100 text-gray-500"
                            disabled
                          />
                          <p className="mt-1 text-xs text-gray-500">Cluster hanya dapat diubah oleh admin</p>
                        </div>

                        <div>
                          <label htmlFor="nomorRumah" className="block text-sm font-medium text-gray-700">
                            Nomor Rumah
                          </label>
                          <input
                            type="text"
                            id="nomorRumah"
                            value={formData.nomor_rumah || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, nomor_rumah: e.target.value }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100 text-gray-500"
                            disabled
                          />
                          <p className="mt-1 text-xs text-gray-500">Nomor rumah hanya dapat diubah oleh admin</p>
                        </div>

                        <div>
                          <label htmlFor="rt" className="block text-sm font-medium text-gray-700">
                            RT
                          </label>
                          <input
                            type="text"
                            id="rt"
                            value={formData.rt || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, rt: e.target.value }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100 text-gray-500"
                            disabled
                          />
                          <p className="mt-1 text-xs text-gray-500">RT hanya dapat diubah oleh admin</p>
                        </div>

                        <div>
                          <label htmlFor="rw" className="block text-sm font-medium text-gray-700">
                            RW
                          </label>
                          <input
                            type="text"
                            id="rw"
                            value={formData.rw || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, rw: e.target.value }))}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100 text-gray-500"
                            disabled
                          />
                          <p className="mt-1 text-xs text-gray-500">RW hanya dapat diubah oleh admin</p>
                      </div>

                        {/* Password change section */}
                        <div className="sm:col-span-2 border-t border-gray-200 pt-6 mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Ubah Password</h4>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                            Password Baru
                          </label>
                          <div className="relative mt-1">
                            <input
                              type={passwordVisibility.newPassword ? "text" : "password"}
                              id="newPassword"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('newPassword')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {passwordVisibility.newPassword ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            Konfirmasi Password Baru
                          </label>
                          <div className="relative mt-1">
                            <input
                              type={passwordVisibility.confirmPassword ? "text" : "password"}
                              id="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {passwordVisibility.confirmPassword ? (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              ) : (
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                              )}
                            </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(userProfile!);
                            setPasswordForm({
                              newPassword: '',
                              confirmPassword: ''
                            });
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Username</h4>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile?.username || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Email</h4>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile?.email || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Nomor Telepon</h4>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile?.phone || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Cluster</h4>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile?.cluster || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Nomor Rumah</h4>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile?.nomor_rumah || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">RT/RW</h4>
                        <p className="mt-1 text-sm text-gray-900 font-medium">{userProfile?.rt || '-'}/{userProfile?.rw || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Occupants Card */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Data Penghuni</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {userProfile?.isVerified 
                          ? "Daftar penghuni yang tinggal di rumah ini"
                          : "Verifikasi akun Anda untuk mengakses data penghuni"}
                      </p>
                    </div>
                    {userProfile?.isVerified && !isAddingOccupant && !isEditingOccupant && (
                      <button
                        onClick={() => setIsAddingOccupant(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Tambah Penghuni
                      </button>
                    )}
                  </div>
                </div>

                <div className="px-4 py-5 sm:p-6">
                  {!userProfile?.isVerified ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">Verifikasi akun Anda untuk mengakses data penghuni</p>
                    </div>
                  ) : isAddingOccupant || isEditingOccupant ? (
                    <form onSubmit={isEditingOccupant ? handleEditOccupant : handleAddOccupant} className="space-y-4">
                      <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          id="nama"
                          value={newOccupant.nama}
                          onChange={(e) => setNewOccupant(prev => ({ ...prev, nama: e.target.value }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="nik" className="block text-sm font-medium text-gray-700">
                          NIK (16 digit)
                        </label>
                        <input
                          type="text"
                          id="nik"
                          value={newOccupant.nik}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                            setNewOccupant(prev => ({ ...prev, nik: value }));
                          }}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                          maxLength={16}
                        />
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                          Jenis Kelamin
                        </label>
                        <select
                          id="gender"
                          value={newOccupant.gender}
                          onChange={(e) => setNewOccupant(prev => ({ ...prev, gender: e.target.value as 'Laki-laki' | 'Perempuan' }))}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          required
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAddingOccupant(false);
                            setIsEditingOccupant(null);
                            setNewOccupant({
                              nama: '',
                              nik: '',
                              gender: 'Laki-laki'
                            });
                          }}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {isEditingOccupant ? 'Simpan Perubahan' : 'Tambah Penghuni'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nama Lengkap
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              NIK
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Jenis Kelamin
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {occupants.map((occupant) => (
                            <tr key={occupant.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {occupant.nama}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {occupant.nik}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {occupant.gender}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => startEditOccupant(occupant)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteOccupant(occupant.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))}
                          {occupants.length === 0 && (
                            <tr>
                              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                                Belum ada data penghuni
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
} 