import crypto from 'crypto';

/**
 * Verifies an HMAC SHA-256 signature
 */
export const verifyHmacSignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

/**
 * RSA Blind Signature Stub
 * Note: Real blind signatures require specific math operations (e.g. RSA-FDH)
 * usually handled by a library like 'blind-signatures' or custom bigInt math.
 * For this architecture, we stub it here to define the interface.
 */
export const signBlindedToken = (blindedTokenBase64: string, privateKeyPem: string): string => {
  // STUB: In a real scenario, this performs S(B) = B^d mod N
  // Here we just cryptographically sign it for the sake of the interface
  const sign = crypto.createSign('SHA256');
  sign.update(blindedTokenBase64);
  sign.end();
  return sign.sign(privateKeyPem, 'base64');
};

export const verifyUnblindedToken = (unblindedTokenBase64: string, signatureBase64: string, publicKeyPem: string): boolean => {
  // STUB: Verify the unblinded signature matches the public key
  const verify = crypto.createVerify('SHA256');
  verify.update(unblindedTokenBase64);
  verify.end();
  return verify.verify(publicKeyPem, signatureBase64, 'base64');
};

/**
 * Generate a SHA-256 hash of any string input.
 * Used for generating tx_hash for vote packages and token hashing.
 */
export const sha256Hash = (input: string): string => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

/**
 * Generate a cryptographic random hex string.
 * Used by ESP32 to generate blinded tokens (simulated server-side for POC).
 */
export const generateRandomToken = (bytes: number = 32): string => {
  return crypto.randomBytes(bytes).toString('hex');
};
