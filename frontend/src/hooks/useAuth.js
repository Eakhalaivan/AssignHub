import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authApi from '../api/authApi';
import useAuthStore from '../store/authStore';
import useNotificationStore from '../store/notificationStore';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { login: storeLogin, logout: storeLogout, user, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      addNotification('Welcome back! Login successful.', 'success');
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error) => {
      addNotification(error.response?.data?.message || 'Authentication failed. Check credentials.', 'error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      storeLogin(data.user, data.token);
      addNotification('Registration complete! Welcome to ACADEMIX.', 'success');
    },
    onError: (error) => {
      addNotification(error.response?.data?.message || 'Registration failed.', 'error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      addNotification('Signed out successfully.', 'info');
    }
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoading: loginMutation.isPending || registerMutation.isPending,
  };
};

export default useAuth;
