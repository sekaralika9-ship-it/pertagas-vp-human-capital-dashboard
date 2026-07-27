import { useCallback, useEffect, useState } from 'react';

export function useRecords(service) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setRecords(await service.getAll());
    } catch (caught) {
      console.error('Unable to load records', caught);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [service]);
  useEffect(() => { refresh(); }, [refresh]);
  return { records, loading, error, refresh };
}
