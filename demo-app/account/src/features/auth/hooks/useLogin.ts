import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';
import type { LoginCredentials } from '../types';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => loginUser(credentials),
    onSuccess: ({ token }) => {
      localStorage.setItem('auth_token', token);
      navigate('/');
    },
  });
}
