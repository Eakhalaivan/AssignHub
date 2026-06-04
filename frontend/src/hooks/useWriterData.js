import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignments, acceptAssignment, rejectAssignment, updateWorkStatus, getEarnings, toggleAvailability } from '../api/writerApi';
import toast from 'react-hot-toast';

export const useAssignments = () =>
  useQuery({ queryKey: ['assignments'], queryFn: getAssignments });

export const useAcceptAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: acceptAssignment,
    onSuccess: () => { qc.invalidateQueries(['assignments']); toast.success('Assignment accepted!'); },
  });
};

export const useRejectAssignment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: rejectAssignment,
    onSuccess: () => { qc.invalidateQueries(['assignments']); toast.success('Assignment rejected'); },
  });
};

export const useEarnings = () =>
  useQuery({ queryKey: ['earnings'], queryFn: getEarnings });

export const useToggleAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: toggleAvailability,
    onSuccess: () => { 
      qc.invalidateQueries(['writerProfile']); 
      toast.success('Availability updated'); 
    },
  });
};

export const useWriterData = () => {
  const assignmentsQuery = useAssignments();
  const earningsQuery = useEarnings();
  const toggleAvailMutation = useToggleAvailability();
  const acceptMutation = useAcceptAssignment();

  return {
    assignments: assignmentsQuery.data || [],
    earnings: earningsQuery.data || { current: 0, total: 0, pending: 0 },
    isLoadingAssignments: assignmentsQuery.isLoading,
    isLoadingEarnings: earningsQuery.isLoading,
    toggleAvailability: toggleAvailMutation.mutate,
    acceptAssignment: acceptMutation.mutate,
    isUpdatingAvailability: toggleAvailMutation.isPending,
  };
};

export default useWriterData;