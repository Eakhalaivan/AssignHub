import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyOrders, createOrder, cancelOrder, rateOrder } from '../api/orderApi';
import toast from 'react-hot-toast';

export const useMyOrders = () =>
  useQuery({ queryKey: ['myOrders'], queryFn: getMyOrders });

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => { qc.invalidateQueries(['myOrders']); toast.success('Order created!'); },
    onError: () => toast.error('Failed to create order'),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => { qc.invalidateQueries(['myOrders']); toast.success('Order cancelled'); },
  });
};

export const useRateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => rateOrder(id, data),
    onSuccess: () => { qc.invalidateQueries(['myOrders']); toast.success('Rating submitted!'); },
  });
};

export const useOrders = () => {
  const myOrdersQuery = useMyOrders();
  const createOrderMutation = useCreateOrder();
  const cancelOrderMutation = useCancelOrder();
  
  return {
    orders: myOrdersQuery.data || [],
    isLoading: myOrdersQuery.isLoading,
    createOrder: createOrderMutation.mutateAsync,
    cancelOrder: cancelOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    isCancelling: cancelOrderMutation.isPending,
  };
};

export default useOrders;