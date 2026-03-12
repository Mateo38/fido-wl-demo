import { useState, useRef } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export function useFido() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithPasskey } = useAuth();
  const conditionalAbortController = useRef<AbortController | null>(null);

  const registerPasskey = async (friendlyName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const optionsRes = await api.fidoRegistrationOptions();
      const options = optionsRes.data;

      const credential = await startRegistration(options);

      await api.fidoRegistrationVerify({
        credential,
        challenge: options.challenge,
        friendlyName: friendlyName || 'My Passkey',
      });

      return true;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError' ? 'Registration cancelled' : err.message || 'Registration failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticateWithPasskey = async () => {
    setLoading(true);
    setError(null);
    try {
      const optionsRes = await api.fidoAuthenticationOptions();
      const options = optionsRes.data;

      const credential = await startAuthentication(options);

      const verifyRes = await api.fidoAuthenticationVerify({
        credential,
        challenge: options.challenge,
      });

      loginWithPasskey(verifyRes.data.token, verifyRes.data.user);
      return true;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError' ? 'Authentication cancelled' : err.message || 'Authentication failed';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const authenticateConditional = async (): Promise<boolean> => {
    try {
      conditionalAbortController.current = new AbortController();

      const optionsRes = await api.fidoAuthenticationOptions();
      const options = optionsRes.data;

      const credential = await startAuthentication(options, true);

      const verifyRes = await api.fidoAuthenticationVerify({
        credential,
        challenge: options.challenge,
      });

      loginWithPasskey(verifyRes.data.token, verifyRes.data.user);
      return true;
    } catch {
      return false;
    } finally {
      conditionalAbortController.current = null;
    }
  };

  const abortConditionalMediation = () => {
    conditionalAbortController.current?.abort();
    conditionalAbortController.current = null;
  };

  return { registerPasskey, authenticateWithPasskey, authenticateConditional, abortConditionalMediation, loading, error };
}
