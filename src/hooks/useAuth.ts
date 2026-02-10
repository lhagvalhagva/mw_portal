"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/apiClient";

export function useAuth(redirectToLogin = false) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGroupUser, setIsGroupUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const baseUrl = localStorage.getItem('rememberMeBaseUrl');
        if (!baseUrl) {
          setIsAuthenticated(false);
          setIsLoading(false);
          if (redirectToLogin) router.push('/auth/login');
          return;
        }
        const meRes = await authAPI.getMe(baseUrl);
        if (meRes.status === 'success' && meRes.data) {
          setIsAuthenticated(true);
          setIsGroupUser(Boolean(meRes.data.is_group_user));
        } else {
          setIsAuthenticated(false);
          if (redirectToLogin) router.push('/auth/login');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        if (redirectToLogin) router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [router, redirectToLogin]);

  return { isAuthenticated, isLoading, isGroupUser };
}
