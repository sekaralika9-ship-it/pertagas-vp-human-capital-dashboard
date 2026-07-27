import { useAuth } from './useAuth';

export const useProfile = () => {
  const { profile, role, canWrite, canDelete, refreshProfile } = useAuth();
  return { profile, role, canWrite, canDelete, refreshProfile };
};
