"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/apiClient";

export function useAuth(redirectToLogin = false) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = localStorage.getItem('rememberMeBaseUrl');
        
        if (!baseUrl) {
          setIsAuthenticated(false);
          setIsLoading(false);
          if (redirectToLogin) {
            router.push('/auth/login');
          }
          return;
        }

        const response = await authAPI.getEmployeeProfile(baseUrl);
        
        if (response.status === 'success' && response.data) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (redirectToLogin) {
            router.push('/auth/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (redirectToLogin) {
          router.push('/auth/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, redirectToLogin]);

  return { isAuthenticated, isLoading };
}
