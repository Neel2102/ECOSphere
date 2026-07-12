import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useApi — minimal data-fetching hook.
 * Usage:
 *   const { data, loading, error, refetch } = useApi(myService.listItems);
 *   const { data, loading, error, refetch } = useApi(() => myService.listItems({ q }), [q]);
 */
export function useApi(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => { abortRef.current = true; };
  }, [run]);

  return { data, loading, error, refetch: run };
}

/**
 * useMutation — wraps an async action (create / update / delete).
 * Returns [execute, { loading, error, success }].
 */
export function useMutation(mutFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await mutFn(...args);
      setSuccess(true);
      return result;
    } catch (err) {
      setError(err.message || 'Action failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutFn]);

  return [execute, { loading, error, success }];
}
