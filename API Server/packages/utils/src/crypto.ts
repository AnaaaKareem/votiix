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
