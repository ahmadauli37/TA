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
    <div className="flex min-h-screen items-center justify-center bg-white">
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
  );
} 