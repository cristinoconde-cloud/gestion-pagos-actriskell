/**
 * Biometrics & WebAuthn / Passkeys Helper for Triskell
 * Supports platform authenticators (Face ID, Touch ID, Windows Hello, Android Fingerprint/Biometrics)
 */

const BIOMETRICS_STORAGE_KEY = 'triskell_biometrics_credentials';
const BIOMETRIC_SESSION_KEY = 'triskell_cached_auth_session';

export interface StoredBiometricInfo {
  credentialId: string;
  email: string;
  name: string;
  role: string;
  enabledAt: string;
}

export interface CachedAuthSession {
  email: string;
  name: string;
  role: string;
  userId?: string;
  token?: string;
  timestamp: number;
}

// Check if device supports platform biometrics / WebAuthn
export const isBiometricsSupported = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch (err) {
    console.warn('Biometrics check error:', err);
    return false;
  }
};

// Check if the current device already has an active biometric credential registered
export const getStoredBiometricUser = (): StoredBiometricInfo | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BIOMETRICS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Cache the last signed-in user session for instant or biometric resume
export const cacheAuthSession = (session: CachedAuthSession) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BIOMETRIC_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Error caching auth session:', e);
  }
};

export const getCachedAuthSession = (): CachedAuthSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BIOMETRIC_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearCachedAuthSession = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BIOMETRIC_SESSION_KEY);
};

// Register biometric credential for current user
export const registerBiometricCredential = async (
  userId: string,
  email: string,
  name: string,
  role: string
): Promise<boolean> => {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('Tu dispositivo no es compatible con autenticación biométrica WebAuthn.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const encoder = new TextEncoder();
  const userIdBuffer = encoder.encode(userId || email);

  const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: 'TRISKELL Asociación',
      id: window.location.hostname
    },
    user: {
      id: userIdBuffer,
      name: email,
      displayName: name || email
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },  // ES256
      { alg: -257, type: 'public-key' } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred'
    },
    timeout: 60000,
    attestation: 'none'
  };

  try {
    const credential = (await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('No se pudo crear la credencial biométrica.');
    }

    const biometricRecord: StoredBiometricInfo = {
      credentialId: credential.id,
      email,
      name,
      role,
      enabledAt: new Date().toISOString()
    };

    localStorage.setItem(BIOMETRICS_STORAGE_KEY, JSON.stringify(biometricRecord));
    return true;
  } catch (error: any) {
    console.error('Error registering biometrics:', error);
    // If user cancelled or platform authenticator unavailable, propagate friendly error
    if (error.name === 'NotAllowedError') {
      throw new Error('Registro cancelado o denegado por el usuario/dispositivo.');
    }
    throw new Error(error.message || 'Error al configurar biometría.');
  }
};

// Authenticate / Unlock with Biometrics
export const authenticateWithBiometrics = async (): Promise<StoredBiometricInfo | null> => {
  const stored = getStoredBiometricUser();
  if (!stored) {
    throw new Error('No hay ninguna credencial biométrica configurada en este dispositivo.');
  }

  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    throw new Error('El navegador no soporta autenticación biométrica.');
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const getOptions: PublicKeyCredentialRequestOptions = {
    challenge,
    rpId: window.location.hostname,
    userVerification: 'required',
    timeout: 60000
  };

  try {
    const assertion = await navigator.credentials.get({
      publicKey: getOptions
    });

    if (assertion) {
      return stored;
    }
    return null;
  } catch (error: any) {
    console.error('Biometric authentication failed:', error);
    if (error.name === 'NotAllowedError') {
      throw new Error('Acceso biométrico cancelado o no reconocido.');
    }
    throw new Error(error.message || 'Fallo en la verificación biométrica.');
  }
};

// Disable biometrics
export const disableBiometrics = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BIOMETRICS_STORAGE_KEY);
};
