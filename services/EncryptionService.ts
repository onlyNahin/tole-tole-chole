
// Signal Protocol-inspired E2EE Implementation
// Features: ECDH Key Agreement, AES-GCM Encryption, Persistent Identity Keys

const STORAGE_PREFIX = 'tole_signal_';
const ME_ID = 'current_user'; // In a real app, this comes from auth

export class EncryptionService {
  private keyPair: CryptoKeyPair | null = null;
  private sessionKeys: Map<string, CryptoKey> = new Map(); // Cache for session keys

  // --- Initialization ---

  // Initialize the encryption session for the current user
  async init(): Promise<void> {
    // 1. Try to load existing Identity Key
    const savedKey = localStorage.getItem(`${STORAGE_PREFIX}identity`);
    
    if (savedKey) {
      try {
        const jwk = JSON.parse(savedKey);
        this.keyPair = await this.importKeyPair(jwk);
        console.log("🔐 E2EE: Identity Key Loaded");
      } catch (e) {
        console.error("E2EE: Failed to load identity key, regenerating...", e);
        await this.generateAndSaveIdentity();
      }
    } else {
      await this.generateAndSaveIdentity();
    }
  }

  private async generateAndSaveIdentity() {
    this.keyPair = await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveKey"]
    );
    const jwkPair = await this.exportKeyPair(this.keyPair);
    localStorage.setItem(`${STORAGE_PREFIX}identity`, JSON.stringify(jwkPair));
    console.log("🔐 E2EE: New Identity Key Generated");
  }

  // --- Session Management ---

  // Establish a secure session with a target user (ECDH)
  async establishSession(targetUserId: string): Promise<void> {
    if (this.sessionKeys.has(targetUserId)) return;

    // 1. Get Target's Public Key (Simulating Server Fetch)
    const targetPubKey = await this.getRemotePublicKey(targetUserId);

    // 2. Perform ECDH to derive Shared Secret
    // We use the shared secret to derive a symmetric key for AES-GCM
    const sharedSecret = await window.crypto.subtle.deriveKey(
      { name: "ECDH", public: targetPubKey },
      this.keyPair!.privateKey,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    this.sessionKeys.set(targetUserId, sharedSecret);
    console.log(`🔐 E2EE: Secure Session Established with ${targetUserId}`);
  }

  // --- Core Crypto Operations ---

  // Encrypt a message for a specific user
  async encrypt(targetUserId: string, plaintext: string): Promise<{ ciphertext: string; iv: string }> {
    await this.establishSession(targetUserId);
    const sessionKey = this.sessionKeys.get(targetUserId)!;

    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV for AES-GCM
    const encodedData = new TextEncoder().encode(plaintext);

    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      sessionKey,
      encodedData
    );

    return {
      ciphertext: this.buf2base64(encryptedContent),
      iv: this.buf2base64(iv)
    };
  }

  // Decrypt a message from a specific user
  async decrypt(senderUserId: string, ciphertext: string, iv: string): Promise<string> {
    await this.establishSession(senderUserId);
    const sessionKey = this.sessionKeys.get(senderUserId)!;

    try {
      const ivBuf = this.base642buf(iv);
      const dataBuf = this.base642buf(ciphertext);

      const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuf },
        sessionKey,
        dataBuf
      );

      return new TextDecoder().decode(decryptedContent);
    } catch (e) {
      console.error("Decryption Failed:", e);
      return "⚠️ [Message Corrupted or Session Invalid]";
    }
  }

  // --- Simulation Helpers (For Demo) ---

  // Simulate the other user sending YOU an encrypted message
  // This proves the crypto works both ways (Me -> Them, Them -> Me)
  async simulateReply(targetUserId: string, plaintext: string): Promise<{ ciphertext: string; iv: string }> {
    // 1. Load the remote user's PRIVATE key (Simulating being them)
    const remotePrivJWK = localStorage.getItem(`${STORAGE_PREFIX}privkey_${targetUserId}`);
    if (!remotePrivJWK) throw new Error("Remote user not initialized");

    const remotePrivKey = await window.crypto.subtle.importKey(
        "jwk",
        JSON.parse(remotePrivJWK),
        { name: "ECDH", namedCurve: "P-256" },
        false,
        ["deriveKey"]
    );

    // 2. Load MY Public Key
    const myPubJWK = (await this.exportKeyPair(this.keyPair!)).publicKey;
    const myPubKey = await window.crypto.subtle.importKey(
        "jwk",
        myPubJWK,
        { name: "ECDH", namedCurve: "P-256" },
        false,
        []
    );

    // 3. Derive key as THE OTHER USER
    const sharedSecretAsThem = await window.crypto.subtle.deriveKey(
        { name: "ECDH", public: myPubKey },
        remotePrivKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt"]
    );

    // 4. Encrypt
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(plaintext);
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        sharedSecretAsThem,
        encodedData
    );

    return {
        ciphertext: this.buf2base64(encryptedContent),
        iv: this.buf2base64(iv)
    };
  }

  // --- Utilities ---

  private async getRemotePublicKey(userId: string): Promise<CryptoKey> {
    // In a real app, fetch from server. Here, check localStorage or generate new.
    const storageKey = `${STORAGE_PREFIX}pubkey_${userId}`;
    const saved = localStorage.getItem(storageKey);

    if (saved) {
      return await this.importPublicKey(JSON.parse(saved));
    }

    // Generate a new identity for this contact (First time contact)
    console.log(`Generating new identity for contact: ${userId}`);
    const kp = await window.crypto.subtle.generateKey(
        { name: "ECDH", namedCurve: "P-256" },
        true,
        ["deriveKey"]
    );
    
    // Save their keys to simulate a "Server" holding them
    const pubJwk = await window.crypto.subtle.exportKey("jwk", kp.publicKey);
    localStorage.setItem(storageKey, JSON.stringify(pubJwk));

    // Save private key for simulation purposes (so they can reply encrypted)
    const privJwk = await window.crypto.subtle.exportKey("jwk", kp.privateKey);
    localStorage.setItem(`${STORAGE_PREFIX}privkey_${userId}`, JSON.stringify(privJwk));

    return kp.publicKey;
  }

  // --- Buffer/Encoding Utils ---

  private buf2base64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base642buf(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private async exportKeyPair(key: CryptoKeyPair): Promise<{ publicKey: JsonWebKey, privateKey: JsonWebKey }> {
    const pub = await window.crypto.subtle.exportKey("jwk", key.publicKey);
    const priv = await window.crypto.subtle.exportKey("jwk", key.privateKey);
    return { publicKey: pub, privateKey: priv };
  }

  private async importKeyPair(jwk: { publicKey: JsonWebKey, privateKey: JsonWebKey }): Promise<CryptoKeyPair> {
    const pub = await window.crypto.subtle.importKey("jwk", jwk.publicKey, { name: "ECDH", namedCurve: "P-256" }, true, []);
    const priv = await window.crypto.subtle.importKey("jwk", jwk.privateKey, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey"]);
    return { publicKey: pub, privateKey: priv };
  }

  private async importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
    return await window.crypto.subtle.importKey("jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, []);
  }
}

export const encryptionService = new EncryptionService();
