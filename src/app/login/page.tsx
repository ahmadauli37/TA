'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { authAPI } from '@/services/api';
import Link from 'next/link';

interface LoginResponse {
  token: string;
  message?: string;
  data: {
    id: string;
    username: string;
    role: string;
    email: string;
  };
}

// Simple encryption/decryption functions (Note: This is a basic example. In production, use a more secure method)
const encrypt = (text: string) => {
  return btoa(text); // Base64 encoding
};

const decrypt = (text: string) => {
  return atob(text); // Base64 decoding
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate form before submission
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    try {
      // Clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('userId');

      const response = await authAPI.login(email, password);
      const { token, data } = response.data as LoginResponse;

      // Validate user ID before storing
      if (!data.id || typeof data.id !== 'string' || data.id.trim() === '') {
        throw new Error('Invalid user ID received from server');
      }

      // Save only essential auth data
      localStorage.setItem('token', token);
      localStorage.setItem('userId', data.id.trim());

      // Remember me logic
      if (remember) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedPassword', encrypt(password));
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
      }

      // Log successful login for debugging
      console.log('Login successful, auth data stored:', {
        userId: data.id,
        tokenPreview: token.substring(0, 10) + '...'
      });

      router.push('/dashboard');
    } catch (error) {
      // Clear any partial data on error
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      
      // Always show the same user-friendly message
      setError('Email atau password yang Anda masukkan salah. Silakan coba lagi.');

      // Keep the password field focused after error
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  };

  const handleDownload = () => {
    window.open('https://lrubxwgdcidlxqyjjbsk.supabase.co/storage/v1/object/public/uploads/APK/Cherry%20Field%20Final.apk', '_blank');
  };

  // Check for remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    
    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(decrypt(rememberedPassword));
      setRemember(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Login Form - Now at the top */}
        <div className="bg-white rounded-b-3xl relative z-10">
          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h1 className="text-xl font-bold text-blue-600 mt-2">Cherry Field</h1>
              <p className="text-gray-400 text-sm mt-1">Housing Management</p>
            </div>
            
            <h2 className="text-lg font-bold mb-4 text-gray-900 text-center">Welcome</h2>
            
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="mobile-email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  id="mobile-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="mobile-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="mobile-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
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
              <div className="flex items-center">
                <input
                  id="mobile-remember"
                  name="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="mobile-remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition"
              >
                Sign in
              </button>
              <div className="text-center mt-2">
                <Link 
                  href="/login/forgot-password" 
                  className="text-blue-500 text-sm hover:underline"
                >
                  Forgot your password ?
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Mobile App Promotion - Now below login form */}
        <div className="text-center text-white p-6">
          <h2 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Cherry Field <span className="text-blue-200">Mobile</span>
          </h2>
          <p className="text-sm text-blue-100 mb-6">
            Kelola hunian Anda dengan mudah melalui aplikasi mobile
          </p>

          {/* Mobile App Screenshots */}
          <div className="flex justify-center space-x-4 mb-6 px-4">
            <div className="relative group">
              <div className="relative w-20 h-40 bg-gray-900 rounded-2xl p-1 shadow-xl transform rotate-3 group-hover:rotate-0 transition-all duration-500">
                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between px-2 text-white text-xs z-10">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <img 
                    src="https://lrubxwgdcidlxqyjjbsk.supabase.co/storage/v1/object/public/uploads//img1.jpeg" 
                    alt="Mobile App Screenshot 1" 
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                  />
                </div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            <div className="relative group">
              <div className="relative w-20 h-40 bg-gray-900 rounded-2xl p-1 shadow-xl transform -rotate-3 group-hover:rotate-0 transition-all duration-500">
                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between px-2 text-white text-xs z-10">
                    <span>9:41</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <img 
                    src="https://lrubxwgdcidlxqyjjbsk.supabase.co/storage/v1/object/public/uploads//img2.jpeg" 
                    alt="Mobile App Screenshot 2" 
                    className="absolute top-0 left-0 w-full h-full object-cover z-0"
                  />
                </div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Mobile Features */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="font-bold text-sm text-white mb-1">Notifikasi Real-time</h3>
                <p className="text-xs text-blue-100">Update terbaru langsung di smartphone</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold text-sm text-white mb-1">Panic Button</h3>
                <p className="text-xs text-blue-100">Tombol darurat untuk bantuan cepat</p>
              </div>
            </div>
          </div>

          {/* Mobile Download Button */}
          <div className="px-6 mb-6">
            <button 
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-white to-blue-50 text-blue-600 px-6 py-3 rounded-xl font-bold text-base hover:from-blue-50 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download APK
            </button>
            <p className="text-center text-xs text-blue-200 mt-2">Gratis untuk semua penghuni Cherry Field</p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Section - Blue Background */}
        <div className="lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white rounded-full"></div>
          </div>
          
          <div className="text-center text-white max-w-md relative z-10 flex flex-col items-center w-full">
            {/* Mobile App Promotion Title */}
            <h2 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent drop-shadow-lg" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Cherry Field <span className="text-blue-200">Mobile</span></h2>
            <p className="text-lg text-blue-100 leading-relaxed mb-8 font-medium drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>
              Kelola hunian Anda dengan mudah melalui aplikasi mobile yang terintegrasi dengan sistem Cherry Field.
            </p>

            {/* Feature List (no box) */}
            <div className="flex flex-row justify-center gap-8 mb-10 w-full">
              <div className="flex-1 min-w-[120px]">
                <h3 className="font-bold text-base text-white mb-1 drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Notifikasi Real-time</h3>
                <p className="text-sm text-blue-100 drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Dapatkan update terbaru langsung di smartphone Anda</p>
              </div>
              <div className="flex-1 min-w-[120px]">
                <h3 className="font-bold text-base text-white mb-1 drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Panic Button</h3>
                <p className="text-sm text-blue-100 drop-shadow" style={{textShadow: '0 2px 8px rgba(0,0,0,0.18)'}}>Tombol darurat untuk situasi yang membutuhkan bantuan cepat</p>
              </div>
            </div>

            {/* Mobile App Mockup Images - Fullscreen inside phone */}
            <div className="flex justify-center space-x-8 mb-10">
              {/* First Phone Mockup */}
              <div className="relative group">
                {/* Phone Frame */}
                <div className="relative w-24 h-48 bg-gray-900 rounded-3xl p-1 shadow-2xl transform rotate-6 group-hover:rotate-0 transition-all duration-500">
                  {/* Screen - image fills all */}
                  <div className="w-full h-full rounded-3xl overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-between px-3 text-white text-xs z-10">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <img 
                      src="https://lrubxwgdcidlxqyjjbsk.supabase.co/storage/v1/object/public/uploads//img1.jpeg" 
                      alt="Mobile App Screenshot 1" 
                      className="absolute top-0 left-0 w-full h-full object-cover z-0"
                    />
                  </div>
                  {/* Home Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full"></div>
                </div>
                {/* Shadow */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black bg-opacity-20 rounded-full blur-sm"></div>
              </div>
              {/* Second Phone Mockup */}
              <div className="relative group">
                {/* Phone Frame */}
                <div className="relative w-24 h-48 bg-gray-900 rounded-3xl p-1 shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-all duration-500">
                  {/* Screen - image fills all */}
                  <div className="w-full h-full rounded-3xl overflow-hidden relative">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between px-3 text-white text-xs z-10">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <img 
                      src="https://lrubxwgdcidlxqyjjbsk.supabase.co/storage/v1/object/public/uploads//img2.jpeg" 
                      alt="Mobile App Screenshot 2" 
                      className="absolute top-0 left-0 w-full h-full object-cover z-0"
                    />
                  </div>
                  {/* Home Button */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-700 rounded-full"></div>
                </div>
                {/* Shadow */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-black bg-opacity-20 rounded-full blur-sm"></div>
              </div>
            </div>

            {/* Download Button */}
            <button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-white to-blue-50 text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:from-blue-50 hover:to-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center mx-auto group"
            >
              <svg className="w-6 h-6 mr-3 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download APK
            </button>
            <div className="mt-4 text-center">
              <p className="text-sm text-blue-200">Gratis untuk semua penghuni Cherry Field</p>
              <p className="text-xs text-blue-300 mt-1">Kompatibel dengan Android 6.0+</p>
            </div>
          </div>
        </div>
        
        {/* Right Section - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-8 flex flex-col items-center">
            {/* Logo dan Judul */}
            <div className="flex flex-col items-center mb-6">
              <svg className="w-14 h-14 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <h1 className="text-2xl font-bold text-blue-600 mt-2">Cherry Field</h1>
              <p className="text-gray-400 text-base mt-1">Housing Management</p>
            </div>
            <div className="w-full">
              <h2 className="text-xl font-bold mb-4 text-gray-900 text-left">Welcome</h2>
              <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? (
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
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={() => setRemember(!remember)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition"
                >
                  Sign in
                </button>
                <div className="text-center mt-2">
                  <Link 
                    href="/login/forgot-password" 
                    className="text-blue-500 text-sm hover:underline"
                  >
                    Forgot your password ?
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 