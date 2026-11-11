import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "sec-crypto-identity/crypto-basics": {
    plain: [
      "Encryption turns readable data (plaintext) into scrambled data (ciphertext) using a key. Without the right key, the ciphertext looks like random noise. The method itself is public; all the secrecy is in the key. This idea is so important it has a name: Kerckhoffs's principle.",
      "Symmetric encryption uses one key for both locking and unlocking, like a house key you copy for a friend. It is very fast, so it protects almost all real data: disks, files and web traffic. The hard part is giving the key to the other person safely.",
      "Asymmetric encryption uses two linked keys. The public key can be shared with the whole world; the private key never leaves its owner. What one key locks, only the other can unlock. It is much slower, so it is used for small but important jobs: sharing keys and making signatures.",
      "Real systems mix both. When you open a website, your browser and the server use asymmetric maths to agree on a fresh symmetric key, then use that fast key for the actual data. This mix is called hybrid encryption.",
    ],
    deepDive: [
      {
        heading: "AES and why the mode matters",
        body: "AES (Advanced Encryption Standard) is the symmetric cipher used almost everywhere. It works on 128-bit blocks and supports 128, 192 or 256-bit keys. AES-128 is still considered secure; AES-256 gives extra margin. Most CPUs have built-in AES instructions, so it can encrypt gigabytes per second.\n\nAES alone only encrypts one 16-byte block. A mode of operation says how to handle longer data. ECB mode encrypts each block separately, so identical blocks give identical output and patterns leak; never use it. CBC hides patterns but needs a random IV (initial value) and a separate integrity check. GCM is the modern default: it is authenticated encryption, meaning it also detects any change to the ciphertext. ChaCha20-Poly1305 is the main alternative, fast on phones without AES hardware.\n\nThe big GCM rule: never reuse a nonce (a number used once) with the same key. Reuse can expose data and let attackers forge messages.",
        bullets: ["Use AES-GCM or ChaCha20-Poly1305 (authenticated encryption)", "Never use ECB mode", "GCM nonce: 12 bytes, unique for every message with the same key"],
      },
      {
        heading: "RSA, elliptic curves and key sizes",
        body: "RSA is the classic asymmetric algorithm. Its security comes from how hard it is to factor a huge number into its two prime factors. Keys must be big: 2048 bits is the minimum today, and 3072 bits is advised for data that must stay safe for many years. RSA can only encrypt a small amount of data, less than its key size, so it encrypts a key, not a file.\n\nElliptic curve cryptography (ECC) gets the same security with much smaller keys: a 256-bit curve key is roughly as strong as 3072-bit RSA. Common choices are P-256, X25519 for key exchange and Ed25519 for signatures. Smaller keys mean faster handshakes and less data.\n\nA large quantum computer could break both RSA and ECC. To prepare, NIST published ML-KEM in 2024 as a post-quantum key exchange, and major browsers already combine it with X25519 in TLS. Symmetric AES-256 is expected to stay safe.",
      },
      {
        heading: "Diffie-Hellman: agreeing a secret in public",
        body: "Diffie-Hellman (DH) lets two sides create the same secret number while an eavesdropper watches every message. Both agree on public values: a large prime p and a base g. Alice picks a secret a and sends g^a mod p. Bob picks a secret b and sends g^b mod p. Alice raises Bob's value to a, Bob raises Alice's value to b, and both get g^(ab) mod p. The watcher sees g^a and g^b but cannot work out the secret without solving a very hard maths problem.\n\nModern systems use the elliptic curve version, ECDH, often with X25519. When fresh keys are made for every session (ECDHE, the E means ephemeral), stealing the server's long-term key later cannot decrypt old recordings. This property is called forward secrecy.\n\nDH alone does not prove who you are talking to. An attacker in the middle could run DH with both sides. That is why TLS signs the exchange with the server's certificate key.",
        visual: {
          type: "flow",
          title: "Diffie-Hellman with tiny numbers (p = 23, g = 5)",
          steps: [
            { label: "Agree in public", detail: "p = 23, g = 5" },
            { label: "Alice sends 4", detail: "Secret a = 4: 5^4 mod 23 = 4" },
            { label: "Bob sends 10", detail: "Secret b = 3: 5^3 mod 23 = 10" },
            { label: "Alice computes", detail: "10^4 mod 23 = 18" },
            { label: "Bob computes", detail: "4^3 mod 23 = 18" },
            { label: "Eavesdropper", detail: "Saw only 23, 5, 4 and 10" },
          ],
        },
      },
      {
        heading: "Key management is the real challenge",
        body: "Strong algorithms rarely fail; key handling does. Keys get hard-coded in source, left in backups or shared by email. A good design answers: where is the key made, where is it stored, who can use it, how is it rotated, and how is it destroyed.\n\nCloud and enterprise systems use envelope encryption. Each file or record is encrypted with its own data key. That data key is then encrypted with a key-encryption key kept in a KMS (key management service) or an HSM (hardware security module), a device that never lets the master key out. You store the encrypted data key next to the data. To read it, you ask the KMS to unwrap the data key, which is logged and permission-checked.\n\nThis gives defenders control and visibility: revoking access to the master key makes all its data unreadable, and every use leaves an audit record.",
        bullets: ["Never commit keys to Git; scan repos for secrets", "Generate keys with a secure random source (os.urandom, secrets, openssl rand)", "Log and alert on unusual KMS decrypt activity"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Hybrid (envelope) encryption of one file",
        steps: [
          { label: "Make data key", detail: "Random 256-bit AES key" },
          { label: "Encrypt file", detail: "AES-GCM with the data key" },
          { label: "Wrap data key", detail: "Encrypt it with the public or KMS key" },
          { label: "Store together", detail: "Ciphertext plus wrapped key" },
          { label: "Read later", detail: "Unwrap key with private key, decrypt file" },
        ],
      },
    ],
    examples: [
      {
        title: "Authenticated encryption with AES-GCM in Python",
        explanation: "Step 1: generate a random 256-bit key. Step 2: make a fresh 12-byte nonce for this message. Step 3: encrypt; the result includes a 16-byte tag that detects tampering. Optional associated data (here a header) is checked but not encrypted. Step 4: decrypt with the same nonce. Step 5: flip one byte and decrypt again: the library raises InvalidTag instead of returning garbage. Store the nonce with the ciphertext; it is not secret, it just must never repeat for this key.",
        code: {
          lang: "python",
          code: "import os\nfrom cryptography.hazmat.primitives.ciphers.aead import AESGCM\nfrom cryptography.exceptions import InvalidTag\n\nkey = AESGCM.generate_key(bit_length=256)\naes = AESGCM(key)\nnonce = os.urandom(12)\nct = aes.encrypt(nonce, b\"pay 100 to bob\", b\"header-v1\")\nprint(aes.decrypt(nonce, ct, b\"header-v1\"))   # b'pay 100 to bob'\n\nbad = ct[:-1] + bytes([ct[-1] ^ 1])\ntry:\n    aes.decrypt(nonce, bad, b\"header-v1\")\nexcept InvalidTag:\n    print(\"tampering detected\")",
        },
      },
      {
        title: "Diffie-Hellman by hand, then for real",
        explanation: "Step 1: with tiny public numbers p = 23 and g = 5, Alice picks 4 and Bob picks 3. Step 2: each computes a public value and sends it. Step 3: each combines the other's public value with their own secret. Both reach 18, which never crossed the wire. Step 4: real systems use X25519, where the numbers are 256 bits long, so guessing the secret is impossible in practice. The second half of the code does the same exchange with the cryptography library.",
        code: {
          lang: "python",
          code: "p, g = 23, 5\na, b = 4, 3\nA, B = pow(g, a, p), pow(g, b, p)        # 4 and 10 are sent\nprint(pow(B, a, p), pow(A, b, p))         # 18 18\n\nfrom cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey\nalice, bob = X25519PrivateKey.generate(), X25519PrivateKey.generate()\ns1 = alice.exchange(bob.public_key())\ns2 = bob.exchange(alice.public_key())\nprint(s1 == s2, len(s1))                  # True 32",
        },
      },
    ],
    cheatSheet: [
      "Symmetric: one shared key, fast (AES, ChaCha20). Asymmetric: key pair, slow (RSA, ECC)",
      "Prefer authenticated encryption: AES-GCM or ChaCha20-Poly1305",
      "Never use ECB mode, and never reuse a GCM nonce with the same key",
      "RSA: 2048 bits minimum, 3072 for long-term; 256-bit ECC is about as strong as RSA-3072",
      "ECDHE gives forward secrecy: old sessions stay safe if the server key leaks later",
      "Diffie-Hellman needs authentication (signatures, certificates) to stop a man in the middle",
      "Envelope encryption: data key encrypts data, KMS key encrypts the data key",
      "openssl rand -hex 32 makes a random 256-bit key in hex",
    ],
    quiz: [
      {
        q: "You must encrypt a 4 GB backup for a colleague who has sent you their public key. What is the right approach?",
        options: ["Encrypt the whole file with their RSA public key", "Encrypt the file with a random AES key, then encrypt that key with their public key", "Hash the file with SHA-256", "Encrypt it with your own private key"],
        answer: 1,
        why: "RSA cannot encrypt large data, so hybrid encryption uses a fast symmetric key for the file and the public key only for that small key.",
      },
      {
        q: "Why is ECB mode unsafe?",
        options: ["It is too slow", "It needs a 512-bit key", "It cannot decrypt", "Identical plaintext blocks produce identical ciphertext blocks, leaking patterns"],
        answer: 3,
        why: "ECB encrypts every block independently, so structure in the data shows through.",
      },
      {
        q: "What does forward secrecy protect against?",
        options: ["A server's long-term key leaking later and exposing past recorded sessions", "Weak user passwords", "Phishing emails", "Expired certificates"],
        answer: 0,
        why: "With ephemeral key exchange, each session key is thrown away, so old traffic cannot be decrypted with the long-term key.",
      },
      {
        q: "Which is a property of AES-GCM that AES-CBC does not provide by itself?",
        options: ["Public key encryption", "Faster key exchange", "Built-in detection of tampering", "No need for a key"],
        answer: 2,
        why: "GCM is an authenticated mode that adds an integrity tag; CBC needs a separate MAC.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For each case, say symmetric, asymmetric or both: full-disk encryption, sending your public key to a server for SSH login, HTTPS to a website.",
        hint: "Ask: is a key being shared or proved, or is bulk data being encrypted?",
        solution: "Full-disk encryption: symmetric (AES, the key unlocked by your password or TPM).\nSSH key login: asymmetric (the server checks a signature made with your private key);\n  the session itself then uses symmetric encryption.\nHTTPS: both (ECDHE plus certificate signatures to agree and authenticate,\n  then AES-GCM or ChaCha20 for the data).",
      },
      {
        level: "medium",
        task: "Using openssl, generate an RSA key pair, encrypt a file with a random AES key, and protect that AES key with the public key.",
        hint: "openssl genpkey, openssl rand, openssl enc with -pass file:, and openssl pkeyutl -encrypt.",
        solution: "openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out priv.pem\nopenssl pkey -in priv.pem -pubout -out pub.pem\nopenssl rand -hex 32 > data.key\nopenssl enc -aes-256-cbc -pbkdf2 -in report.pdf -out report.pdf.enc -pass file:data.key\nopenssl pkeyutl -encrypt -pubin -inkey pub.pem -in data.key -out data.key.enc\nrm data.key\n# Receiver:\nopenssl pkeyutl -decrypt -inkey priv.pem -in data.key.enc -out data.key\nopenssl enc -d -aes-256-cbc -pbkdf2 -in report.pdf.enc -out report.pdf -pass file:data.key\n# Note: openssl enc has no integrity check; real tools (age, GPG) add one.",
      },
      {
        level: "hard",
        task: "Show in Python why reusing an AES-GCM nonce is dangerous: encrypt two different messages with the same key and nonce, and recover information about them without the key.",
        hint: "GCM uses a counter-mode keystream. XOR of two ciphertexts equals XOR of the two plaintexts.",
        solution: "import os\nfrom cryptography.hazmat.primitives.ciphers.aead import AESGCM\naes, nonce = AESGCM(AESGCM.generate_key(bit_length=128)), os.urandom(12)\nm1, m2 = b\"attack at dawn!!\", b\"retreat at noon!\"\nc1 = aes.encrypt(nonce, m1, None)[:16]   # drop the 16-byte tag\nc2 = aes.encrypt(nonce, m2, None)[:16]\nx = bytes(a ^ b for a, b in zip(c1, c2))\nprint(x == bytes(a ^ b for a, b in zip(m1, m2)))   # True\n# Knowing (or guessing) m1 now reveals m2:\nprint(bytes(a ^ b for a, b in zip(x, m1)))         # b'retreat at noon!'",
      },
    ],
    faq: [
      { q: "Is AES-128 still secure?", a: "Yes. No practical attack breaks AES-128 today. AES-256 is chosen for extra margin, including against future quantum computers." },
      { q: "What is the difference between encryption and encoding?", a: "Encoding, like Base64, just changes the format and anyone can reverse it without a key. Encryption needs a secret key to reverse, so only Base64 is never protection." },
      { q: "Will quantum computers break all encryption?", a: "A large enough quantum computer would break RSA and elliptic curve crypto, but not AES with long keys. That is why new post-quantum algorithms like ML-KEM are being rolled out now, often combined with X25519." },
      { q: "Should I write my own encryption code?", a: "No. Use well-reviewed libraries and high-level APIs such as AESGCM, libsodium or age. Small mistakes, like reusing a nonce, break security completely." },
    ],
  },

  "sec-crypto-identity/hashing": {
    plain: [
      "A hash function takes any input, a word or a 10 GB file, and produces a short fixed-size fingerprint called a digest. SHA-256 always gives 256 bits, shown as 64 hexadecimal characters. The same input always gives the same digest, and changing even one letter gives a completely different one.",
      "Hashes are one-way. You cannot turn a digest back into the original data. That makes them perfect for checking integrity: if the file you downloaded has the same SHA-256 as the one the publisher listed, the file was not changed or corrupted.",
      "But anyone can compute a hash. An attacker who swaps a file can also swap the hash next to it. To prove who made something, you need a key. A MAC (message authentication code) uses a shared secret key. A digital signature uses a private key, and anyone can check it with the matching public key.",
      "Some old hash functions are broken. Researchers can create two different files with the same MD5 or SHA-1 digest. This is called a collision, and it means those functions can no longer be trusted for security.",
    ],
    deepDive: [
      {
        heading: "The three security properties of a hash",
        body: "A secure hash must resist three kinds of attack. Preimage resistance: given a digest, you cannot find any input that produces it. Second-preimage resistance: given one input, you cannot find a different input with the same digest. Collision resistance: you cannot find any two inputs with the same digest, even if you choose both.\n\nCollision resistance is the first to break, because of the birthday effect: for an n-bit hash you only need about 2^(n/2) tries to find some collision, not 2^n. For SHA-256 that is 2^128, far out of reach. For MD5 (128 bits) the generic limit is 2^64, and clever attacks made it much easier still.\n\nHashes also show the avalanche effect: change one input bit and about half the output bits flip. That is why digests of nearly identical files look unrelated.",
        bullets: ["SHA-256, SHA-384, SHA-512 (SHA-2 family): fine today", "SHA-3 and BLAKE2/BLAKE3: modern alternatives", "MD5 and SHA-1: broken for collisions"],
      },
      {
        heading: "Why MD5 and SHA-1 were retired",
        body: "Practical MD5 collisions were shown in 2004. By 2008 researchers used them to create a rogue CA certificate, and in 2012 the Flame espionage malware used an MD5 collision to forge a Microsoft code-signing certificate so its updates looked genuine. With MD5, an attacker can make a harmless file and a malicious file with the same digest, get the harmless one approved or signed, then swap them.\n\nSHA-1 followed. In 2017 Google and CWI Amsterdam published SHAttered, two different PDF files with the same SHA-1 hash. In 2020 a cheaper chosen-prefix collision made attacks more realistic. Browsers stopped trusting SHA-1 certificates in 2017, and NIST plans to stop SHA-1 use entirely by the end of 2030.\n\nMD5 is still fine for non-security jobs, such as spotting accidental corruption or de-duplicating files. For anything an attacker could influence, use SHA-256 or better.",
      },
      {
        heading: "MACs and HMAC in practice",
        body: "A MAC proves two things: the message was not changed, and it came from someone who knows the shared key. HMAC is the standard way to build one from a hash: HMAC-SHA256 mixes the key into the hash in two passes.\n\nWhy not just hash key plus message? SHA-256 and other SHA-2 hashes allow a length extension attack: from SHA256(key || message) an attacker can compute a valid digest for the message with extra data added, without knowing the key. HMAC's design blocks this.\n\nA very common real use is webhooks. GitHub, Stripe and many others sign each request body with HMAC-SHA256 and a secret you share with them, and send the result in a header (GitHub uses X-Hub-Signature-256). Your server recomputes it and compares. Use a constant-time comparison, such as hmac.compare_digest in Python, so attackers cannot learn the correct value byte by byte from timing.",
        visual: {
          type: "flow",
          title: "Verifying a signed webhook with HMAC",
          steps: [
            { label: "Sender signs", detail: "HMAC-SHA256(secret, body)" },
            { label: "Sends request", detail: "Body plus signature header" },
            { label: "Read raw body", detail: "Exact bytes, before JSON parsing" },
            { label: "Recompute HMAC", detail: "Same secret, same algorithm" },
            { label: "Constant-time compare", detail: "hmac.compare_digest" },
            { label: "Accept or reject", detail: "Mismatch: 401 and log it" },
          ],
        },
      },
      {
        heading: "How digital signatures work",
        body: "A signature uses an asymmetric key pair. To sign, software hashes the message and then uses the private key to produce a signature over that hash. To verify, anyone with the public key checks that the signature matches the message. If one bit of the message changes, or the signature was made with a different key, verification fails.\n\nThis gives what a MAC cannot: non-repudiation. With a MAC, both sides share the key, so either could have created the tag. With a signature, only the private key holder could have signed.\n\nSignatures protect software updates, code (Windows Authenticode, Apple notarization), Git commits and tags, container images (for example with Sigstore cosign), and TLS certificates. Common algorithms are RSA with PSS padding, ECDSA and Ed25519. For a download, the usual pattern is: the publisher signs a checksum file, you verify the signature, then check the file's hash against it.",
        bullets: ["Hash: integrity only, no key", "MAC: integrity + shared-secret origin", "Signature: integrity + provable origin with public key"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Safely verifying a downloaded ISO",
        steps: [
          { label: "Download 3 files", detail: "ISO, SHA256SUMS, SHA256SUMS.gpg" },
          { label: "Get signing key", detail: "From the publisher's official site" },
          { label: "Verify signature", detail: "Proves SHA256SUMS is genuine" },
          { label: "Check hash", detail: "sha256sum -c against the ISO" },
          { label: "Install", detail: "Only if both checks pass" },
        ],
      },
    ],
    examples: [
      {
        title: "Verifying an Ubuntu ISO properly",
        explanation: "Checking only the hash proves the file matches a list, but not that the list is genuine. Step 1: download the ISO plus SHA256SUMS and SHA256SUMS.gpg from the same release folder. Step 2: import Ubuntu's signing key (fingerprint published on ubuntu.com). Step 3: verify the signature on SHA256SUMS; look for \"Good signature\". Step 4: check the ISO against the list. --ignore-missing skips ISOs you did not download. On Windows, Get-FileHash file.iso -Algorithm SHA256 gives the hash.",
        code: {
          lang: "bash",
          code: "# after importing the Ubuntu signing key with gpg --recv-keys <fingerprint>\ngpg --keyid-format long --verify SHA256SUMS.gpg SHA256SUMS\n# gpg: Good signature from \"Ubuntu CD Image Automatic Signing Key ...\"\nsha256sum -c SHA256SUMS --ignore-missing\n# ubuntu-24.04-live-server-amd64.iso: OK",
        },
      },
      {
        title: "Checking a webhook signature in Python",
        explanation: "A payment provider sends events to your API. Step 1: you and the provider share a secret. Step 2: the provider sends the body plus a header holding sha256= followed by the hex digest. Step 3: your code recomputes HMAC-SHA256 over the exact raw bytes of the body, not a re-serialised JSON object, because any change in spacing changes the hash. Step 4: compare with hmac.compare_digest. Step 5: reject anything that does not match, and log it: repeated failures may mean someone is probing your endpoint.",
        code: {
          lang: "python",
          code: "import hmac, hashlib\nSECRET = b\"whsec_example_shared_secret\"\n\ndef sign(body: bytes) -> str:\n    return \"sha256=\" + hmac.new(SECRET, body, hashlib.sha256).hexdigest()\n\ndef verify(body: bytes, header: str) -> bool:\n    return hmac.compare_digest(sign(body), header)\n\nbody = b'{\"event\":\"paid\",\"amount\":100}'\nheader = sign(body)                     # what the sender would send\nprint(verify(body, header))            # True\nprint(verify(body.replace(b\"100\", b\"999\"), header))   # False",
        },
      },
    ],
    cheatSheet: [
      "sha256sum file (Linux), shasum -a 256 file (macOS), Get-FileHash file (PowerShell)",
      "sha256sum -c SHA256SUMS --ignore-missing checks downloads against a list",
      "Hash = integrity; MAC = integrity + shared key; signature = integrity + provable origin",
      "Use HMAC, never hash(key + message), to avoid length extension attacks",
      "Compare MACs with hmac.compare_digest (constant time), not ==",
      "MD5 and SHA-1 are broken for collisions; use SHA-256 or SHA-3",
      "Fast hashes are wrong for passwords; use Argon2id, scrypt or bcrypt",
      "A hash of a file is only trustworthy if the hash itself came from a trusted, signed source",
    ],
    quiz: [
      {
        q: "An attacker replaces a file on a download mirror and also edits the SHA-256 shown on the same page. What would have caught this?",
        options: ["Using MD5 instead", "Verifying a signature on the checksum file with the publisher's public key", "Downloading the file twice", "Checking the file size"],
        answer: 1,
        why: "A signature can only be made with the publisher's private key, which the attacker does not have.",
      },
      {
        q: "Why is SHA256(secret + message) a poor MAC?",
        options: ["SHA-256 is too slow", "It is not deterministic", "It allows length extension attacks", "It produces collisions easily"],
        answer: 2,
        why: "SHA-2 lets an attacker extend the message and compute a valid digest without the key; HMAC prevents this.",
      },
      {
        q: "What does a digital signature provide that a MAC does not?",
        options: ["Non-repudiation: only the private key holder could have signed", "Encryption of the message", "Faster verification", "Protection against replay by default"],
        answer: 0,
        why: "Both sides know a MAC key, but only one party holds a signing private key.",
      },
      {
        q: "Roughly how many attempts does a generic birthday attack need to find a collision in a 256-bit hash?",
        options: ["2^256", "2^64", "256", "2^128"],
        answer: 3,
        why: "Collisions are expected after about 2^(n/2) tries, which is 2^128 for 256 bits.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Hash the words hello and Hello with SHA-256 and compare the results. Then hash a 1-byte file and a large file and compare the digest lengths.",
        hint: "printf avoids the newline that echo adds.",
        solution: "printf 'hello' | sha256sum\nprintf 'Hello' | sha256sum\n# Completely different digests from one changed letter (avalanche effect).\nhead -c 1 /dev/urandom > small.bin; head -c 100M /dev/urandom > big.bin\nsha256sum small.bin big.bin\n# Both digests are 64 hex characters (256 bits).",
      },
      {
        level: "medium",
        task: "Create an Ed25519 key pair with openssl, sign a text file, verify it, then change one character and verify again.",
        hint: "Ed25519 signing in OpenSSL 3 needs pkeyutl with -rawin.",
        solution: "openssl genpkey -algorithm ed25519 -out key.pem\nopenssl pkey -in key.pem -pubout -out pub.pem\necho \"release v1.2.0\" > msg.txt\nopenssl pkeyutl -sign -inkey key.pem -rawin -in msg.txt -out msg.sig\nopenssl pkeyutl -verify -pubin -inkey pub.pem -rawin -in msg.txt -sigfile msg.sig\n# Signature Verified Successfully\necho \"release v1.2.1\" > msg.txt\nopenssl pkeyutl -verify -pubin -inkey pub.pem -rawin -in msg.txt -sigfile msg.sig\n# Signature Verification Failure",
      },
      {
        level: "hard",
        task: "Write a Python script that builds a SHA-256 baseline of every file in a folder, then later reports files that were added, removed or changed (a tiny file integrity monitor).",
        hint: "Store a dict of path to digest as JSON; hashlib.file_digest (Python 3.11+) reads files in chunks so large files do not fill memory.",
        solution: "import hashlib, json, os, sys\ndef digest(p):\n    with open(p, \"rb\") as f: return hashlib.file_digest(f, \"sha256\").hexdigest()\nroot, db = sys.argv[1], \"baseline.json\"\nnow = {os.path.join(d, n): digest(os.path.join(d, n)) for d, _, fs in os.walk(root) for n in fs}\nif not os.path.exists(db): json.dump(now, open(db, \"w\")); sys.exit(\"baseline saved\")\nold = json.load(open(db))\nfor p in sorted(set(old) | set(now)):\n    if p not in now: print(\"REMOVED\", p)\n    elif p not in old: print(\"ADDED  \", p)\n    elif old[p] != now[p]: print(\"CHANGED\", p)",
      },
    ],
    faq: [
      { q: "Can you decrypt a SHA-256 hash?", a: "No, hashing is not encryption and there is no key. Attackers can only guess inputs and compare, which is why short or common passwords stored with fast hashes are easy to crack." },
      { q: "Is MD5 OK for checking file downloads?", a: "It detects accidental corruption, but not deliberate tampering, because attackers can craft collisions. Use SHA-256 and check a signed checksum file." },
      { q: "What is the difference between SHA-2 and SHA-3?", a: "They are different designs from NIST. SHA-2 (for example SHA-256) is the most widely used and still secure; SHA-3 uses a different internal structure and is immune to length extension attacks." },
    ],
  },

  "sec-crypto-identity/pki-tls": {
    plain: [
      "When you visit your bank's website, how do you know it is really the bank and not a copy? A certificate answers this. It is a small file that says \"this public key belongs to bank.example\", signed by a trusted company called a certificate authority (CA).",
      "Your browser and operating system come with a built-in list of trusted root CAs, called the trust store. Root CAs usually sign intermediate CAs, and intermediates sign website certificates. Following these signatures from the website up to a trusted root is called the chain of trust.",
      "TLS (Transport Layer Security) is the protocol that uses these certificates. In a few quick messages, the browser checks the certificate, both sides agree on fresh encryption keys, and then all traffic is encrypted and protected from changes. HTTPS is simply HTTP sent inside TLS.",
      "Certificates expire, and a CA can revoke (cancel) one early if its private key is stolen. Expired certificates are one of the most common causes of outages, so teams automate renewal and monitor expiry dates.",
    ],
    deepDive: [
      {
        heading: "What is inside a certificate",
        body: "Certificates use the X.509 format. The important fields are: Subject (who it is for), Issuer (which CA signed it), Validity (notBefore and notAfter dates), the Subject Public Key, and extensions. The Subject Alternative Name (SAN) extension lists the exact host names the certificate covers, such as example.com and www.example.com, or a wildcard like *.example.com, which covers one level only. Browsers check the name against the SAN, not the old Common Name field.\n\nOther extensions matter too. Basic Constraints says whether the certificate is a CA (CA:TRUE) that may sign others. Key Usage and Extended Key Usage say what the key may be used for, such as server authentication or code signing. At the end comes the CA's signature over all these fields.\n\nPublic CAs must also log every certificate in public Certificate Transparency (CT) logs. You can search these logs, for example on crt.sh, to see every certificate issued for your domain.",
        bullets: ["*.example.com covers a.example.com but not a.b.example.com", "Watch CT logs for certificates you did not request", "CA:TRUE on a leaf certificate is a serious red flag"],
      },
      {
        heading: "How a client validates a certificate",
        body: "A TLS client does several checks, and all must pass. First, it builds a chain: the server sends its leaf certificate plus intermediates, and the client links each certificate to the one that signed it until it reaches a root in its trust store. Second, it verifies every signature in that chain. Third, it checks that every certificate is inside its validity dates. Fourth, it checks that the host name it connected to matches the leaf's SAN. Fifth, it checks constraints and key usage, and where available, revocation status.\n\nA very common server mistake is not sending the intermediate certificate. Some browsers fill the gap from cache, so the site looks fine for you but fails for curl, mobile apps or other servers. Always serve the full chain (leaf plus intermediates, never the root).",
        visual: {
          type: "flow",
          title: "Certificate validation checks",
          steps: [
            { label: "Build chain", detail: "Leaf to intermediate to trusted root" },
            { label: "Check signatures", detail: "Each cert signed by the next" },
            { label: "Check dates", detail: "Now is between notBefore and notAfter" },
            { label: "Check name", detail: "Host name matches a SAN entry" },
            { label: "Check usage", detail: "Server auth allowed; revocation if known" },
          ],
        },
      },
      {
        heading: "The TLS 1.3 handshake in detail",
        body: "TLS 1.3 (RFC 8446) needs only one round trip before data flows. The ClientHello lists supported cipher suites and includes a key share, the client's half of an ephemeral (EC)DHE exchange, usually X25519. The server answers with a ServerHello containing its own key share. Both can now compute the same secret, so everything after this point is encrypted.\n\nThe server then sends, encrypted, its certificate and a CertificateVerify message: a signature over the whole handshake so far, made with the certificate's private key. This proves the server holds that key and that nobody changed the messages. A Finished message closes each side's part.\n\nTLS 1.3 removed old, weak options: no RSA key exchange, so forward secrecy is always on, and only AEAD ciphers such as TLS_AES_128_GCM_SHA256 and TLS_CHACHA20_POLY1305_SHA256. TLS 1.0 and 1.1 were formally deprecated in 2021 and should be disabled.",
        visual: {
          type: "sequence",
          title: "TLS 1.3 full handshake",
          actors: ["Client", "Server"],
          messages: [
            { from: 0, to: 1, label: "ClientHello + key_share (X25519)" },
            { from: 1, to: 0, label: "ServerHello + key_share" },
            { from: 1, to: 0, label: "Encrypted: Certificate" },
            { from: 1, to: 0, label: "Encrypted: CertificateVerify + Finished" },
            { from: 0, to: 1, label: "Encrypted: Finished" },
            { from: 0, to: 1, label: "Application data (HTTP)" },
          ],
        },
      },
      {
        heading: "Revocation, expiry and shorter lifetimes",
        body: "If a private key leaks, the CA revokes the certificate. Clients learn this in two ways. A CRL (certificate revocation list) is a signed list of revoked serial numbers. OCSP lets a client ask the CA about one certificate, and OCSP stapling lets the server attach a fresh signed answer to the handshake. In practice, revocation checking is patchy: many clients do not fail when they cannot reach the CA, and Let's Encrypt ended its OCSP service in 2025 in favour of CRLs.\n\nBecause revocation is weak, the industry is shortening certificate lifetimes instead. In 2025 the CA/Browser Forum voted to cut the maximum from 398 days to 200 days from March 2026, 100 days from March 2027 and 47 days from March 2029. Let's Encrypt certificates already last 90 days.\n\nThe lesson for defenders: automate renewal with ACME tools such as certbot, and monitor expiry so you get warned weeks before.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "A certificate chain of trust",
        layers: [
          { label: "Root CA", detail: "Self-signed; pre-installed in the trust store; kept offline" },
          { label: "Intermediate CA", detail: "Signed by the root; signs website certificates" },
          { label: "Leaf certificate", detail: "Signed by the intermediate; SAN lists the host names" },
          { label: "Server private key", detail: "Never shared; proves ownership in CertificateVerify" },
        ],
      },
    ],
    examples: [
      {
        title: "Inspecting a live certificate chain with openssl",
        explanation: "Step 1: connect with s_client. -servername sends SNI (the host name), which servers use to pick the right certificate. Step 2: read the chain section: depth 0 is the leaf, higher depths are intermediates. Step 3: pipe the leaf into openssl x509 to print subject, issuer, dates and SAN. Step 4: check Verify return code: 0 (ok) at the end of the s_client output; any other code explains what failed, such as an expired or unknown issuer.",
        code: {
          lang: "bash",
          code: "openssl s_client -connect example.com:443 -servername example.com \\\n  -showcerts </dev/null 2>/dev/null | grep -E 's:|i:|Verify return'\n\nopenssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \\\n  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName",
        },
      },
      {
        title: "Monitoring certificate expiry",
        explanation: "An expired certificate takes a site down for every user at once. Step 1: for each host name you own, fetch the certificate. Step 2: use openssl x509 -checkend, which exits non-zero if the certificate expires within the given number of seconds (30 days is 2592000). Step 3: run the script daily from cron or a CI job and send failures to chat or email. Step 4: also search crt.sh for your domain now and then, to spot certificates someone issued without your knowledge.",
        code: {
          lang: "bash",
          code: "#!/bin/sh\nfor host in example.com www.example.com api.example.com; do\n  if ! openssl s_client -connect \"$host:443\" -servername \"$host\" </dev/null 2>/dev/null \\\n     | openssl x509 -noout -checkend 2592000 >/dev/null; then\n    echo \"WARNING: $host certificate expires within 30 days (or check failed)\"\n  fi\ndone",
        },
      },
    ],
    cheatSheet: [
      "openssl s_client -connect host:443 -servername host shows the chain and Verify return code",
      "openssl x509 -noout -subject -issuer -dates -ext subjectAltName prints the key fields",
      "openssl x509 -checkend 2592000 fails if the cert expires within 30 days",
      "Serve leaf + intermediates; a missing intermediate breaks curl and mobile apps",
      "Browsers match the host name against SAN entries, not the Common Name",
      "TLS 1.3: 1 round trip, always forward secret, AEAD ciphers only",
      "Disable TLS 1.0 and 1.1; allow TLS 1.2 and 1.3",
      "Search crt.sh for your domain to see every publicly issued certificate",
    ],
    quiz: [
      {
        q: "A site works in your desktop browser but curl reports \"unable to get local issuer certificate\". What is the most likely cause?",
        options: ["The server's private key is weak", "TLS 1.3 is enabled", "The server is not sending the intermediate certificate", "The root CA expired yesterday"],
        answer: 2,
        why: "Browsers may fill in a cached intermediate, but curl needs the server to send the full chain.",
      },
      {
        q: "In TLS 1.3, which message proves the server holds the private key for its certificate?",
        options: ["ClientHello", "CertificateVerify", "ServerHello", "Finished from the client"],
        answer: 1,
        why: "CertificateVerify is a signature over the handshake transcript made with the certificate's private key.",
      },
      {
        q: "Does a certificate for *.example.com cover shop.eu.example.com?",
        options: ["Yes, wildcards cover all subdomains", "Only if the CA allows it", "Yes, if the SAN also lists example.com", "No, a wildcard covers only one label"],
        answer: 3,
        why: "The star matches exactly one level, so it covers eu.example.com but not shop.eu.example.com.",
      },
      {
        q: "Why is the industry shortening certificate lifetimes?",
        options: ["Revocation checking is unreliable, so short lifetimes limit how long a stolen key stays useful", "Short certificates are faster to download", "Browsers cannot store long dates", "To make HTTPS cost more"],
        answer: 0,
        why: "If clients cannot reliably learn about revocation, expiry becomes the safety net.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Open any HTTPS site, click the padlock and view the certificate. Write down the issuer, the expiry date, the SAN names and how many certificates are in the chain.",
        hint: "Look for the Details or Certificate viewer tab; the hierarchy shows the chain.",
        solution: "Example for a typical site:\nIssuer: an intermediate CA (for example \"R11\" from Let's Encrypt)\nValid to: a date about 90 days after issue\nSAN: example.com, www.example.com\nChain: 3 certificates (leaf, intermediate, root from the trust store)",
      },
      {
        level: "medium",
        task: "Find out which TLS versions a server accepts by testing TLS 1.1, 1.2 and 1.3 separately with openssl.",
        hint: "openssl s_client has -tls1_1, -tls1_2 and -tls1_3 flags. Your local OpenSSL may itself refuse TLS 1.1.",
        solution: "for v in tls1_1 tls1_2 tls1_3; do\n  if openssl s_client -connect example.com:443 -servername example.com -$v \\\n       </dev/null >/dev/null 2>&1; then echo \"$v accepted\"; else echo \"$v refused\"; fi\ndone\n# A well-configured server: tls1_1 refused, tls1_2 accepted, tls1_3 accepted.\n# Note: modern OpenSSL may block TLS 1.1 on the client side by default.",
      },
      {
        level: "hard",
        task: "Build a small lab PKI: create a root CA, issue a server certificate for lab.local with a SAN, and verify the chain with openssl verify.",
        hint: "openssl req -x509 for the CA; openssl req -new plus openssl x509 -req with -extfile for the SAN.",
        solution: "openssl req -x509 -newkey rsa:3072 -nodes -keyout ca.key -out ca.crt -days 365 \\\n  -subj \"/CN=Lab Root CA\" -addext \"basicConstraints=critical,CA:TRUE\"\nopenssl req -new -newkey rsa:2048 -nodes -keyout srv.key -out srv.csr -subj \"/CN=lab.local\"\nprintf 'subjectAltName=DNS:lab.local\\nextendedKeyUsage=serverAuth\\n' > ext.cnf\nopenssl x509 -req -in srv.csr -CA ca.crt -CAkey ca.key -CAcreateserial \\\n  -out srv.crt -days 90 -extfile ext.cnf\nopenssl verify -CAfile ca.crt srv.crt          # srv.crt: OK\nopenssl x509 -in srv.crt -noout -ext subjectAltName",
      },
    ],
    faq: [
      { q: "Does the padlock mean a website is safe?", a: "No. It means the connection is encrypted and the certificate matches the name in the address bar. A phishing site can have a valid certificate for its own look-alike domain." },
      { q: "What is the difference between SSL and TLS?", a: "SSL is the old name for the protocol, and all SSL versions are broken and disabled. TLS replaced it; people still say \"SSL certificate\" out of habit." },
      { q: "Why does my company's network show its own CA on every website?", a: "Some companies inspect HTTPS traffic with a proxy that re-signs certificates using a company CA installed on managed devices. It lets them scan traffic, but it also means the proxy can see your data." },
      { q: "How long are certificates valid now?", a: "Public TLS certificates are limited to 200 days from March 2026, dropping to 100 days in 2027 and 47 days in 2029. Many, like Let's Encrypt's, already last 90 days and renew automatically." },
    ],
  },

  "sec-crypto-identity/authn-authz": {
    plain: [
      "Authentication answers \"who are you?\". You prove it with something like a password, a passkey or a fingerprint. Authorization answers \"what are you allowed to do?\". Logging in to a shop proves you are Maria; authorization decides that Maria can see her own orders but not other people's.",
      "These are separate steps, and mixing them up causes real bugs. A system might check that you are logged in, but forget to check that the record you asked for is yours. That is an authorization failure, and it is one of the most common web security problems.",
      "Passwords need special care when stored. A site should never keep the actual password. It keeps a hash made with a slow, salted function. Then, if the database is stolen, attackers still have to guess each password one by one, slowly.",
      "Attackers also reuse passwords leaked from other sites. This is called credential stuffing. Defences include multi-factor authentication, blocking known-leaked passwords, and spotting many failed logins across many accounts.",
    ],
    deepDive: [
      {
        heading: "Authentication, sessions and authorization on every request",
        body: "Authentication usually happens once, at login. After that, the server gives the client a session cookie or a token that stands for the proven identity. Authorization must happen on every request, on the server, for every resource: \"may user 42 read invoice 9001?\".\n\nHTTP status codes reflect the difference. 401 Unauthorized, despite its name, means \"not authenticated\": no valid credentials were sent. 403 Forbidden means \"authenticated, but not allowed\". Some apps return 404 instead of 403 so attackers cannot even learn that a record exists.\n\nGood design puts authorization in one central place, such as middleware or a policy function, and denies by default. If every endpoint writes its own checks, one will eventually be forgotten. Log authorization failures: a user getting many 403s in a row is often probing other people's records.",
        bullets: ["401: who are you? 403: I know you, and no", "Check authorization server-side on every request", "Deny by default; allow only what a rule permits"],
      },
      {
        heading: "Why password hashes must be salted and slow",
        body: "If a site stores plain passwords, one breach exposes every account. If it stores a fast hash like SHA-256, attackers can test billions of guesses per second on a single GPU, and common passwords fall in seconds. Precomputed tables (rainbow tables) make unsalted hashes even easier.\n\nA salt is a random value, unique per user, stored next to the hash and mixed in before hashing. It means two users with the same password get different hashes, and precomputed tables become useless. A salt is not secret.\n\nA slow, purpose-built password hash then makes each guess expensive. These functions have a cost setting you can raise as hardware gets faster. Some systems add a pepper: one extra secret mixed in, stored outside the database (for example in a secrets manager), so a database-only leak is not enough to start cracking.\n\nOn successful login, check whether the stored hash uses old settings and re-hash it with the new ones.",
        visual: {
          type: "flow",
          title: "Checking a password at login",
          steps: [
            { label: "User sends password", detail: "Over TLS only" },
            { label: "Load stored record", detail: "Algorithm, cost, salt, hash" },
            { label: "Hash the attempt", detail: "Same algorithm, cost and salt" },
            { label: "Compare in constant time", detail: "Match: log in; no match: generic error" },
            { label: "Upgrade if needed", detail: "Re-hash with current cost" },
          ],
        },
      },
      {
        heading: "bcrypt, scrypt and Argon2 compared",
        body: "All three are designed for passwords, but they differ. bcrypt (1999) has a cost factor where each +1 doubles the work. It uses little memory, so GPUs can attack it somewhat efficiently, and it only uses the first 72 bytes of a password. scrypt adds a memory cost, which makes GPU and custom-hardware attacks much more expensive. Argon2 won the Password Hashing Competition in 2015; Argon2id is the variant to use.\n\nOWASP's current guidance: Argon2id with at least 19 MiB of memory, 2 iterations and 1 degree of parallelism. If Argon2id is not available, use scrypt (N=2^17, r=8, p=1), then bcrypt with cost 10 or more. Where FIPS compliance is required, PBKDF2-HMAC-SHA256 with 600,000 iterations.\n\nTune for your hardware: a login should take somewhere around tens to a few hundred milliseconds. Too slow, and attackers can overload your login endpoint.",
        visual: {
          type: "compare",
          title: "Password hashing choices",
          columns: [
            { title: "Argon2id", points: ["First choice today", "Memory-hard", "m=19 MiB, t=2, p=1 minimum", "Format starts $argon2id$"] },
            { title: "scrypt", points: ["Good second choice", "Memory-hard", "N=2^17, r=8, p=1", "Common in older systems"] },
            { title: "bcrypt", points: ["Still acceptable", "Cost 10 or higher", "Only first 72 bytes used", "Format starts $2b$"] },
          ],
        },
      },
      {
        heading: "Defending against credential stuffing",
        body: "Billions of username and password pairs from old breaches are traded online. Attackers feed them into automated tools that try each pair on your login page, often through thousands of residential proxy IPs so each IP sends only a few requests. Because people reuse passwords, a small share of attempts succeed.\n\nLayered defences work best. MFA stops a correct password from being enough. Checking new passwords against breach lists, for example with the Have I Been Pwned Pwned Passwords API, blocks known-leaked choices; NIST's SP 800-63B guidance also says to allow long passphrases and drop forced periodic changes and odd composition rules. Rate limit by account and by IP, and add bot detection or a challenge when traffic looks automated.\n\nFor detection, watch the overall login failure rate, many accounts failing from many IPs in a short window, and success from an IP that also failed against hundreds of other accounts. Use the same error message for wrong user and wrong password.",
        bullets: ["Signal: failure rate jumps across the whole site", "Signal: one IP or ASN tries many different usernames", "Response: force password reset and MFA for accounts that logged in"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where identity checks live in a web app",
        root: "Incoming request",
        children: [
          { label: "Authentication", children: ["Login: password, passkey, MFA", "Session cookie or token check", "Fails: 401"] },
          { label: "Authorization", children: ["Role or permission check", "Ownership check on the record", "Fails: 403 or 404"] },
          { label: "Credential storage", children: ["Argon2id hash + salt", "Optional pepper in a secrets store"] },
          { label: "Abuse controls", children: ["Rate limits", "Breached password check", "Login anomaly alerts"] },
        ],
      },
    ],
    examples: [
      {
        title: "Storing passwords with Argon2id in Python",
        explanation: "Step 1: install argon2-cffi. Step 2: create a PasswordHasher; its defaults use Argon2id with 64 MiB memory, 3 iterations and 4 lanes, above OWASP's minimum. Step 3: hash at sign-up; the output string holds the algorithm, settings, salt and hash, so you store just that one field. Step 4: at login, verify raises an exception on a wrong password. Step 5: check_needs_rehash tells you when to upgrade an old hash to new settings.",
        code: {
          lang: "python",
          code: "from argon2 import PasswordHasher\nfrom argon2.exceptions import VerifyMismatchError\nph = PasswordHasher()\nstored = ph.hash(\"correct horse battery staple\")\nprint(stored)   # $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>\ndef login(password: str) -> bool:\n    try:\n        ph.verify(stored, password)\n    except VerifyMismatchError:\n        return False\n    if ph.check_needs_rehash(stored):\n        pass  # save ph.hash(password) as the new stored value\n    return True\nprint(login(\"correct horse battery staple\"), login(\"guess123\"))",
        },
      },
      {
        title: "Blocking breached passwords without sending them anywhere",
        explanation: "The Pwned Passwords API uses k-anonymity. Step 1: hash the candidate password with SHA-1 (used here only as a lookup key, not for storage). Step 2: send only the first 5 hex characters. Step 3: the API returns every suffix that starts with that prefix, with a count. Step 4: check locally whether your full suffix is in the list. The service never sees the password or even its full hash. Step 5: if the count is above zero, ask the user to choose another password.",
        code: {
          lang: "python",
          code: "import hashlib, urllib.request\ndef pwned_count(password: str) -> int:\n    h = hashlib.sha1(password.encode()).hexdigest().upper()\n    prefix, suffix = h[:5], h[5:]\n    req = urllib.request.Request(\n        f\"https://api.pwnedpasswords.com/range/{prefix}\",\n        headers={\"User-Agent\": \"password-check-demo\"})\n    with urllib.request.urlopen(req) as r:\n        for line in r.read().decode().splitlines():\n            s, count = line.split(\":\")\n            if s == suffix:\n                return int(count)\n    return 0\nprint(pwned_count(\"password123\"))   # a large number",
        },
      },
    ],
    cheatSheet: [
      "Authentication = who you are; authorization = what you may do, checked on every request",
      "401 means not authenticated; 403 means authenticated but not allowed",
      "Store passwords with Argon2id (OWASP min: 19 MiB, t=2, p=1); never plain or SHA-256",
      "Salts are unique per user and not secret; a pepper is secret and kept outside the DB",
      "bcrypt ignores bytes after 72; use cost 10 or more",
      "Same error for wrong user and wrong password stops username discovery",
      "Credential stuffing signal: many accounts failing from many IPs at once",
      "Pwned Passwords range API: send only the first 5 SHA-1 hex characters",
    ],
    quiz: [
      {
        q: "A logged-in user changes /orders/1001 to /orders/1002 in the URL and sees someone else's order. Which control failed?",
        options: ["Authentication", "Password hashing", "Authorization", "TLS"],
        answer: 2,
        why: "The user was correctly identified, but the server did not check that order 1002 belongs to them.",
      },
      {
        q: "What does a per-user salt mainly defeat?",
        options: ["Phishing", "Precomputed tables and spotting users with the same password", "Slow logins", "Keyloggers"],
        answer: 1,
        why: "Unique salts make each hash different even for identical passwords, so rainbow tables do not work.",
      },
      {
        q: "Which password hashing choice does OWASP list first?",
        options: ["Argon2id", "SHA-512 with a salt", "MD5 with many rounds", "AES encryption of the password"],
        answer: 0,
        why: "Argon2id is memory-hard and OWASP's first recommendation.",
      },
      {
        q: "Your login page sees 50,000 failed logins in 10 minutes, each IP trying only 2 or 3 different usernames. What is this most likely?",
        options: ["A user who forgot their password", "A DNS outage", "A misconfigured load balancer", "Credential stuffing through a proxy network"],
        answer: 3,
        why: "Spreading leaked pairs across many IPs keeps each IP under rate limits, which is typical of stuffing.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Hash the same password twice with bcrypt and show the results differ. Then show both still verify.",
        hint: "Use Python's bcrypt package: bcrypt.hashpw and bcrypt.gensalt.",
        solution: "import bcrypt\npw = b\"S3cure passphrase\"\nh1 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))\nh2 = bcrypt.hashpw(pw, bcrypt.gensalt(rounds=12))\nprint(h1, h2, h1 != h2)          # different salts, different hashes\nprint(bcrypt.checkpw(pw, h1), bcrypt.checkpw(pw, h2))   # True True",
      },
      {
        level: "medium",
        task: "Measure how long one Argon2id hash takes on your machine with OWASP's minimum settings and with argon2-cffi's defaults. Pick settings that take about 100 to 300 ms.",
        hint: "PasswordHasher accepts time_cost, memory_cost (KiB) and parallelism.",
        solution: "import time\nfrom argon2 import PasswordHasher\nfor name, ph in [(\"owasp-min\", PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)),\n                 (\"default\", PasswordHasher())]:\n    t = time.perf_counter(); ph.hash(\"test password\")\n    print(name, round((time.perf_counter() - t) * 1000), \"ms\")\n# Raise time_cost or memory_cost until a hash takes roughly 100-300 ms on\n# your production hardware, then keep checking with check_needs_rehash.",
      },
      {
        level: "hard",
        task: "Write a log analysis that flags credential stuffing: from a CSV of login attempts (time, ip, username, success), find IPs that tried 20 or more distinct usernames, and list any successful logins from those IPs.",
        hint: "Group by IP, count distinct usernames, then filter successes.",
        solution: "import csv, collections\nusers, wins = collections.defaultdict(set), collections.defaultdict(list)\nfor row in csv.DictReader(open(\"logins.csv\")):\n    users[row[\"ip\"]].add(row[\"username\"])\n    if row[\"success\"] == \"true\":\n        wins[row[\"ip\"]].append(row[\"username\"])\nfor ip, names in users.items():\n    if len(names) >= 20:\n        print(f\"SUSPECT {ip}: {len(names)} usernames, successes: {wins[ip]}\")\n# Accounts in the success list need a password reset and MFA enrolment.",
      },
    ],
    faq: [
      { q: "Should passwords be encrypted or hashed?", a: "Hashed with a slow password hash. Encryption can be reversed by anyone who gets the key, and the server never needs to know the original password, only to check a guess." },
      { q: "Should I force users to change passwords every 90 days?", a: "Current NIST guidance says no, unless there is evidence of compromise. Forced changes lead to weak, predictable passwords; check against breach lists and use MFA instead." },
      { q: "Is it safe to tell users \"this username does not exist\"?", a: "It lets attackers find valid accounts. Use one generic message such as \"wrong username or password\", and the same for password reset requests." },
      { q: "What is the difference between a salt and a pepper?", a: "A salt is random per user and stored with the hash. A pepper is one secret value for the whole system, stored separately, so a stolen database alone is not enough to crack hashes." },
    ],
  },

  "sec-crypto-identity/mfa": {
    plain: [
      "A password alone is weak because it can be guessed, reused or stolen. Multi-factor authentication (MFA) asks for proof from at least two different kinds of evidence: something you know (a password or PIN), something you have (a phone or security key) and something you are (a fingerprint or face).",
      "Two passwords are not MFA, because both are the same kind. The point is that an attacker who steals your password from a breach still does not have your phone or your security key.",
      "Not all second factors are equally strong. A code sent by SMS can be stolen if someone takes over your phone number. A code from an app can be typed into a fake website. A push notification can be approved by mistake. Passkeys and security keys are built so that a fake website simply cannot use them.",
      "MFA blocks the vast majority of automated account takeover attacks. But attackers adapt, so defenders choose phishing-resistant methods for the most important accounts and protect the recovery process, which is often the weakest link.",
    ],
    deepDive: [
      {
        heading: "How TOTP codes are made",
        body: "TOTP (time-based one-time password, RFC 6238) is what apps like Google Authenticator or Microsoft Authenticator use. At setup, the site creates a random secret and shows it as a QR code. Your app and the server both store this secret.\n\nTo make a code, each side takes the current Unix time divided by 30 (the time step), computes an HMAC-SHA1 of that number with the secret, and turns part of the result into a 6-digit code. Because both sides share the secret and roughly the same clock, they get the same code without talking to each other. Servers usually accept one step either side to allow for clock drift.\n\nWeaknesses: the secret sits on the server, so a server breach can expose it. And the code is just text, so a user can be tricked into typing it into a fake site that forwards it to the real one within the 30 seconds.",
        visual: {
          type: "flow",
          title: "From shared secret to 6-digit code",
          steps: [
            { label: "Shared secret", detail: "Set up once via QR code" },
            { label: "Time counter", detail: "floor(unix time / 30)" },
            { label: "HMAC-SHA1", detail: "Of counter, keyed with secret" },
            { label: "Truncate", detail: "Pick 4 bytes, mod 10^6" },
            { label: "Code", detail: "Same on phone and server" },
          ],
        },
      },
      {
        heading: "How each factor gets defeated",
        body: "SMS codes can be stolen through SIM swapping, where an attacker convinces a mobile carrier to move your number to their SIM, and through weaknesses in the phone network itself. TOTP and SMS codes can both be phished in real time by adversary-in-the-middle (AiTM) kits: a fake login page that relays everything to the real site, including the code, and keeps the session cookie it gets back.\n\nPush approvals face MFA fatigue (also called prompt bombing). The attacker, who already has the password, triggers dozens of prompts, often at night, until the tired user taps Approve. In the 2022 Uber breach, an attacker combined repeated push prompts with a message pretending to be IT support. Number matching, where the user must type a number shown on the login screen, defeats blind approvals; Microsoft made it mandatory for Authenticator in 2023.\n\nEven strong MFA does not help once a session cookie is stolen, for example by infostealer malware. That needs short sessions and device-bound session protections.",
        bullets: ["SIM swap: protect your carrier account with a PIN", "AiTM phishing: relays codes and steals session cookies", "Fatigue: enable number matching and limit prompts", "Signal: many denied pushes, then one approval"],
      },
      {
        heading: "Why FIDO2 and passkeys resist phishing",
        body: "FIDO2 is made of two standards: WebAuthn, the browser API, and CTAP, how the browser talks to an authenticator like a security key or phone. At registration, the authenticator creates a new key pair just for that website. The private key stays in the authenticator; the site stores only the public key.\n\nAt login, the site sends a random challenge. The authenticator signs it, and the signed data includes the origin (the exact website) that the browser saw. Two things stop phishing. First, the browser will only use a credential for the site it was created for, so on login-examp1e.com there is no matching passkey to use. Second, even if data were relayed, the signature names the wrong origin and the real site rejects it.\n\nNothing secret is stored on the server, nothing is typed by the user, and nothing can be read out and replayed. A passkey is a FIDO credential; it may be synced across devices (iCloud Keychain, Google Password Manager) or bound to one hardware key.",
      },
      {
        heading: "Rolling out MFA and protecting recovery",
        body: "Start with the accounts that matter most: administrators, email, remote access (VPN), cloud consoles and finance staff. Require phishing-resistant methods (FIDO2 security keys or passkeys, or certificate-based smart cards) for admins first, then extend to everyone.\n\nThe recovery and enrolment path is where many attacks now go. If a caller can persuade the help desk to reset MFA, the strongest factor does not matter; the 2023 MGM Resorts attack reportedly began with a call to the IT help desk. Require identity verification for resets, such as a video call with ID, or a manager's approval, and alert when MFA methods are changed.\n\nAlso watch the logs. Useful detections: a new MFA method registered shortly after a password reset, sign-ins that passed MFA from an unusual country or hosting provider, and many MFA denials followed by success. Disable legacy protocols (like basic authentication for email) that skip MFA entirely.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Why a phishing proxy fails against a passkey",
        actors: ["User's browser", "Fake site (proxy)", "Real site"],
        messages: [
          { from: 0, to: 1, label: "Opens login-examp1e.com" },
          { from: 1, to: 2, label: "Relays login for the user" },
          { from: 2, to: 1, label: "WebAuthn challenge for example.com" },
          { from: 1, to: 0, label: "Passes challenge on" },
          { from: 0, to: 1, label: "No passkey for this origin: refuses" },
          { from: 1, to: 2, label: "Nothing valid to relay; login fails" },
        ],
      },
    ],
    examples: [
      {
        title: "Creating and checking TOTP codes",
        explanation: "Step 1: generate a random Base32 secret, as a site does at enrolment. Step 2: create the provisioning URI; this is what the QR code contains, and scanning it adds the account to an authenticator app. Step 3: get the current code. Step 4: verify it as the server would; valid_window=1 accepts one 30-second step before or after to allow for clock drift. Step 5: store the secret encrypted on the server, because anyone with it can generate valid codes.",
        code: {
          lang: "python",
          code: "import pyotp\n\nsecret = pyotp.random_base32()\ntotp = pyotp.TOTP(secret)   # 6 digits, 30 s steps, HMAC-SHA1\nprint(totp.provisioning_uri(name=\"alice@example.com\", issuer_name=\"ExampleCorp\"))\n# otpauth://totp/ExampleCorp:alice%40example.com?secret=...&issuer=ExampleCorp\ncode = totp.now()\nprint(code, totp.verify(code, valid_window=1))   # e.g. 492039 True",
        },
      },
      {
        title: "Investigating a possible MFA fatigue attack",
        explanation: "A user reports many push prompts at 2 a.m. Step 1: in your identity provider's sign-in logs, filter for that user over the last 24 hours. Step 2: look for a pattern: a correct password from an unfamiliar IP, then 20 or more MFA denials, then one approval. Step 3: if there was an approval, treat it as a compromise: revoke all sessions and refresh tokens, reset the password, and remove any new MFA methods the attacker registered. Step 4: check what the session accessed, such as mailbox rules or file downloads. Step 5: enable number matching and limit how many prompts can be sent in a short time.",
      },
    ],
    cheatSheet: [
      "Factors: something you know, have, are; MFA needs two different categories",
      "Strength (weakest to strongest): SMS, voice, TOTP, push with number matching, FIDO2/passkey",
      "TOTP: HMAC-SHA1 of floor(time/30) with a shared secret, 6 digits",
      "AiTM phishing relays passwords and codes and steals the session cookie",
      "Passkeys are bound to the site's origin, so fake sites cannot use them",
      "Alert on: many MFA denials then approval, new MFA method after reset",
      "Protect help desk MFA resets with strong identity checks",
      "Disable legacy authentication protocols that bypass MFA",
    ],
    quiz: [
      {
        q: "Which pair counts as true multi-factor authentication?",
        options: ["Password and security question", "Password and fingerprint", "Two different passwords", "PIN and password"],
        answer: 1,
        why: "A password is something you know and a fingerprint is something you are, two different categories.",
      },
      {
        q: "An attacker uses a fake login page that relays everything to the real site in real time. Which method still stops them?",
        options: ["TOTP app codes", "SMS codes", "A FIDO2 passkey", "Email one-time codes"],
        answer: 2,
        why: "The passkey is bound to the real origin, so the browser will not use it on the fake site.",
      },
      {
        q: "What best defends against MFA fatigue attacks on push notifications?",
        options: ["Number matching on push prompts", "Longer passwords", "Sending more prompts", "Using SMS instead"],
        answer: 0,
        why: "Number matching forces the user to see the real login screen, so blind approvals fail.",
      },
      {
        q: "Why is the help desk an important part of MFA security?",
        options: ["It issues TLS certificates", "It stores TOTP secrets", "It blocks SIM swaps", "Attackers call it to get MFA reset on a victim's account"],
        answer: 3,
        why: "If resets are easy to obtain by phone, attackers skip the MFA entirely.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the MFA methods enabled on three of your own accounts (email, bank, cloud). Rank them from weakest to strongest and pick one to upgrade.",
        hint: "Look in each account's security settings for SMS, authenticator app, push, security key or passkey.",
        solution: "Example:\nBank: SMS code (weakest: SIM swap and phishing)\nWork email: push with number matching (medium)\nPersonal email: passkey (strongest: phishing resistant)\nUpgrade: add a passkey or authenticator app to the bank if offered,\nand remove SMS as a fallback where possible.",
      },
      {
        level: "medium",
        task: "Implement the TOTP algorithm yourself in Python using only the standard library, and check it matches pyotp for the same secret.",
        hint: "Counter = int(time) // 30, packed as 8-byte big-endian; dynamic truncation uses the last nibble as an offset.",
        solution: "import base64, hashlib, hmac, struct, time\ndef totp(secret_b32, step=30, digits=6):\n    key = base64.b32decode(secret_b32)\n    counter = int(time.time()) // step\n    mac = hmac.new(key, struct.pack(\">Q\", counter), hashlib.sha1).digest()\n    off = mac[-1] & 0x0F\n    num = struct.unpack(\">I\", mac[off:off + 4])[0] & 0x7FFFFFFF\n    return str(num % 10 ** digits).zfill(digits)\nimport pyotp\ns = pyotp.random_base32()\nprint(totp(s), pyotp.TOTP(s).now())   # same 6 digits",
      },
      {
        level: "hard",
        task: "Write detection logic for MFA fatigue from an identity log export (CSV with time, user, ip, result where result is mfa_denied, mfa_approved or password_ok). Flag users with 5 or more denials followed by an approval within 30 minutes.",
        hint: "Sort by user and time, keep a sliding list of recent denials.",
        solution: "import csv\nfrom datetime import datetime, timedelta\nrows = sorted(csv.DictReader(open(\"mfa.csv\")), key=lambda r: (r[\"user\"], r[\"time\"]))\ndenials = {}\nfor r in rows:\n    t, u = datetime.fromisoformat(r[\"time\"]), r[\"user\"]\n    recent = [d for d in denials.get(u, []) if t - d <= timedelta(minutes=30)]\n    if r[\"result\"] == \"mfa_denied\": recent.append(t)\n    elif r[\"result\"] == \"mfa_approved\" and len(recent) >= 5:\n        print(f\"ALERT {u}: {len(recent)} denials then approval at {t} from {r['ip']}\")\n    denials[u] = recent",
      },
    ],
    faq: [
      { q: "Is SMS MFA better than nothing?", a: "Yes. It still blocks most automated attacks that only have a password. But move important accounts to an authenticator app, a passkey or a security key when you can." },
      { q: "What happens if I lose my security key or phone with my passkeys?", a: "You use a backup method you set up earlier, such as a second security key, synced passkeys on another device or recovery codes. Always register at least two strong methods for important accounts." },
      { q: "Are passkeys the same as passwords stored in a password manager?", a: "No. A passkey is a private key that signs a challenge and is never sent to the site. A stored password is still a shared secret that can be typed into a fake site." },
      { q: "Can MFA be bypassed?", a: "Yes, by real-time phishing proxies, stolen session cookies, MFA fatigue or help desk social engineering. Phishing-resistant methods and good recovery processes close most of these gaps." },
    ],
  },

  "sec-crypto-identity/oauth-oidc": {
    plain: [
      "Imagine a printing website that wants your photos from a cloud drive. In the old days, you would give it your password. Then it could do anything with your account, forever. OAuth 2.0 fixes this: the site gets a limited, temporary pass (a token) instead of your password.",
      "OAuth has four roles. The resource owner is you. The client is the app asking for access. The authorization server logs you in and hands out tokens. The resource server is the API holding your data. You approve exactly what the app may do, such as \"read photos\".",
      "OAuth is about permission, not about who you are. OpenID Connect (OIDC) is a thin layer on top that adds login. It gives the app an ID token that says who signed in. \"Sign in with Google\" or \"Sign in with Microsoft\" buttons use OIDC.",
      "The recommended way for web, mobile and single-page apps is the authorization code flow with PKCE. The app gets a short-lived code, then swaps it for tokens over a direct back-channel. PKCE makes sure a stolen code is useless to anyone else.",
    ],
    deepDive: [
      {
        heading: "The authorization request, parameter by parameter",
        body: "The flow starts when the app sends your browser to the authorization server's /authorize endpoint. The URL carries several parameters. response_type=code asks for a code. client_id names the app. redirect_uri is where to send you back, and the server must compare it exactly with the registered value. scope lists the access requested, such as openid profile email or photos.read. state is a random value the app checks on return, which stops cross-site request forgery. nonce, for OIDC, is a random value that comes back inside the ID token to stop replay. code_challenge and code_challenge_method=S256 carry PKCE.\n\nAfter you log in and consent, the server redirects to redirect_uri?code=...&state=.... The app then makes a direct POST to the /token endpoint with grant_type=authorization_code, the code, the redirect_uri and the code_verifier. A confidential client (a server-side app) also authenticates itself with its client secret or a signed assertion.",
        bullets: ["Exact redirect URI matching stops code theft via open redirects", "state protects the redirect against CSRF", "nonce binds the ID token to this login"],
      },
      {
        heading: "PKCE: protecting the code",
        body: "PKCE (Proof Key for Code Exchange, RFC 7636) was made for mobile apps, where another app on the phone could register the same custom URL scheme and receive the code. The fix: before redirecting, the app makes a random secret called the code_verifier (43 to 128 characters). It sends only a hash of it, the code_challenge = BASE64URL(SHA-256(code_verifier)), in the authorization request.\n\nWhen the app later exchanges the code, it must send the original code_verifier. The server hashes it and compares it with the challenge it stored. An attacker who steals the code does not know the verifier, so the exchange fails.\n\nThe OAuth security best current practice (RFC 9700, published 2025) recommends PKCE for all clients, including server-side apps with a client secret, because it also stops code injection attacks. It also says not to use the old implicit flow or the password grant.",
        visual: {
          type: "sequence",
          title: "PKCE stops a stolen code",
          actors: ["App", "Auth server", "Attacker"],
          messages: [
            { from: 0, to: 1, label: "Authorize with code_challenge (hash)" },
            { from: 1, to: 0, label: "Redirect with code" },
            { from: 2, to: 1, label: "Tries stolen code, no verifier" },
            { from: 1, to: 2, label: "Rejected: invalid_grant" },
            { from: 0, to: 1, label: "Code + code_verifier" },
            { from: 1, to: 0, label: "Hash matches: tokens issued" },
          ],
        },
      },
      {
        heading: "Access, refresh and ID tokens",
        body: "Each token has one audience and one job. The access token is for the API. It is short-lived (minutes to an hour) and carries scopes. It may be a JWT (JSON Web Token) the API validates itself, or an opaque string the API checks with the authorization server. The client should treat it as opaque.\n\nThe refresh token is for the authorization server only. The client uses it to get new access tokens without asking the user to log in again. It lives longer, so for browser and mobile apps servers should rotate it on every use and revoke the whole family if an old one is reused, which signals theft.\n\nThe ID token is for the client only. It is a signed JWT with claims such as iss (issuer), sub (stable user ID), aud (must equal your client_id), exp, iat and nonce. Validate the signature using the issuer's published keys (JWKS), then every claim. Never send the ID token to an API as an access token.",
        visual: {
          type: "compare",
          title: "Three tokens, three audiences",
          columns: [
            { title: "Access token", points: ["Sent to the API", "Short-lived", "Carries scopes", "Bearer: whoever holds it can use it"] },
            { title: "Refresh token", points: ["Sent to the auth server only", "Long-lived", "Gets new access tokens", "Rotate and revoke on reuse"] },
            { title: "ID token", points: ["Read by the client only", "Signed JWT (OIDC)", "Says who logged in", "Check iss, aud, exp, nonce"] },
          ],
        },
      },
      {
        heading: "Common mistakes and attacks to watch",
        body: "Many OAuth incidents come from small validation gaps. Loose redirect URI matching (prefixes or wildcards) lets an attacker send codes to their own page. Not checking aud on an ID token lets a token issued to another app log someone in to yours. Accepting JWTs with alg none, or without checking the signature at all, lets anyone forge tokens. Storing tokens in browser localStorage exposes them to any XSS bug; a backend-for-frontend (BFF) that keeps tokens on the server and gives the browser a secure cookie is safer.\n\nAttackers also abuse consent itself. In consent phishing, a victim is tricked into approving a malicious app that asks for scopes like reading mail. No password is stolen and MFA does not help, because the user really granted access. Defences: restrict which apps users can approve, require admin consent for sensitive scopes, review granted apps regularly, and alert on new apps with high-risk permissions.",
        bullets: ["Exact redirect URIs only", "Validate signature, iss, aud, exp and nonce", "Short access tokens; rotate refresh tokens", "Review OAuth app grants in your tenant"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which OAuth flow to use",
        root: "OAuth 2.0 grant types",
        children: [
          { label: "Authorization code + PKCE", children: ["Web apps", "Single-page apps", "Mobile and desktop apps"] },
          { label: "Client credentials", children: ["Service to service", "No user involved"] },
          { label: "Device authorization", children: ["TVs and CLIs", "User approves on another device"] },
          { label: "Refresh token", children: ["Renew access tokens", "Rotate on every use"] },
          { label: "Avoid", children: ["Implicit flow", "Resource owner password grant"] },
        ],
      },
    ],
    examples: [
      {
        title: "Making a PKCE pair and the authorization URL",
        explanation: "Step 1: create a high-entropy code_verifier with the secrets module. Step 2: hash it with SHA-256 and Base64url-encode it without padding to get the code_challenge. Step 3: create random state and nonce values and keep them, with the verifier, in the user's server-side session. Step 4: build the authorization URL. Step 5: when the browser returns, check state first, then exchange the code with the stored code_verifier.",
        code: {
          lang: "python",
          code: "import base64, hashlib, secrets\nfrom urllib.parse import urlencode\n\nverifier = secrets.token_urlsafe(48)                      # 64 chars\nchallenge = base64.urlsafe_b64encode(\n    hashlib.sha256(verifier.encode()).digest()).rstrip(b\"=\").decode()\nstate, nonce = secrets.token_urlsafe(16), secrets.token_urlsafe(16)\n\nparams = {\"response_type\": \"code\", \"client_id\": \"my-app\",\n          \"redirect_uri\": \"https://app.example.com/callback\",\n          \"scope\": \"openid profile email\", \"state\": state, \"nonce\": nonce,\n          \"code_challenge\": challenge, \"code_challenge_method\": \"S256\"}\nprint(\"https://login.example.com/authorize?\" + urlencode(params))",
        },
      },
      {
        title: "Reading and validating an ID token",
        explanation: "A JWT is three Base64url parts separated by dots: header, payload and signature. Step 1: decode the header and payload to look at them (this is for debugging only; decoding is not validation). Step 2: in real code, use a library such as PyJWT with the issuer's JWKS URL to check the signature. Step 3: require the expected algorithm, issuer and audience. Step 4: compare the nonce claim with the one stored in the session. If any check fails, reject the login.",
        code: {
          lang: "python",
          code: "import jwt   # PyJWT\n\njwks = jwt.PyJWKClient(\"https://login.example.com/.well-known/jwks.json\")\n\ndef validate_id_token(id_token: str, expected_nonce: str) -> dict:\n    key = jwks.get_signing_key_from_jwt(id_token)\n    claims = jwt.decode(id_token, key.key, algorithms=[\"RS256\"],\n                        audience=\"my-app\", issuer=\"https://login.example.com\")\n    if claims.get(\"nonce\") != expected_nonce:\n        raise ValueError(\"nonce mismatch\")\n    return claims   # claims[\"sub\"] is the stable user ID",
        },
      },
    ],
    cheatSheet: [
      "OAuth = delegated access (authorization); OIDC = login (authentication) on top of OAuth",
      "Use authorization code + PKCE for every client; avoid implicit and password grants",
      "code_challenge = BASE64URL(SHA256(code_verifier)), method S256",
      "Access token goes to the API; refresh token to the auth server; ID token stays with the client",
      "Validate ID tokens: signature (JWKS), iss, aud = your client_id, exp, nonce",
      "Register exact redirect URIs; never allow wildcards",
      "Client credentials grant is for machine-to-machine calls with no user",
      "Review consented OAuth apps; require admin consent for high-risk scopes",
    ],
    quiz: [
      {
        q: "What is the purpose of the state parameter?",
        options: ["It carries the user's password", "It stops cross-site request forgery on the redirect back to the app", "It sets the token lifetime", "It encrypts the access token"],
        answer: 1,
        why: "The app checks that the returned state matches what it sent, so attackers cannot inject their own authorization response.",
      },
      {
        q: "Which token should a client send to a resource API?",
        options: ["The ID token", "The refresh token", "The authorization code", "The access token"],
        answer: 3,
        why: "Access tokens are meant for APIs; ID tokens are for the client, refresh tokens for the authorization server.",
      },
      {
        q: "An attacker steals an authorization code from a redirect. Why can't they exchange it when PKCE is used?",
        options: ["They do not have the code_verifier that matches the code_challenge", "Codes are encrypted", "The code expires after 1 second", "The auth server checks their IP address"],
        answer: 0,
        why: "The server only issues tokens when the presented verifier hashes to the stored challenge.",
      },
      {
        q: "A user approves a malicious app that requests permission to read their mailbox. Why does MFA not help?",
        options: ["MFA was turned off", "The app guessed the password", "The user genuinely granted the app a token; no login was stolen", "OAuth tokens never expire"],
        answer: 2,
        why: "Consent phishing abuses legitimate consent, so controls must focus on which apps users can approve.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Decode the payload of any JWT (for example one from jwt.io's sample) without a library and list its claims.",
        hint: "Split on dots, Base64url-decode the middle part, and add = padding if needed.",
        solution: "import base64, json\ntoken = \"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.sig\"\npayload = token.split(\".\")[1]\npayload += \"=\" * (-len(payload) % 4)\nprint(json.loads(base64.urlsafe_b64decode(payload)))\n# {'sub': '1234567890', 'name': 'John Doe', 'iat': 1516239022}\n# Decoding is not validation: anyone can create this text.",
      },
      {
        level: "medium",
        task: "Look up the OpenID configuration of a real provider and find its authorization, token and JWKS endpoints and the signing algorithms it supports.",
        hint: "Providers publish /.well-known/openid-configuration.",
        solution: "curl -s https://accounts.google.com/.well-known/openid-configuration \\\n  | jq '{authorization_endpoint, token_endpoint, jwks_uri,\n         id_token_signing_alg_values_supported, code_challenge_methods_supported}'\n# Shows the endpoints, RS256 for ID tokens, and S256 / plain for PKCE.",
      },
      {
        level: "hard",
        task: "Review this app config and list every security problem: implicit flow for a SPA, redirect URIs https://app.example.com/*, access token stored in localStorage, refresh tokens valid 1 year with no rotation, ID token sent to the API as a bearer token.",
        hint: "Compare each point with RFC 9700 best practice and token audiences.",
        solution: "1. Implicit flow: tokens in URL fragments leak; use auth code + PKCE.\n2. Wildcard redirect: codes can go to attacker-controlled paths; register exact URIs.\n3. localStorage: any XSS steals tokens; use a BFF with HttpOnly cookies\n   or keep tokens in memory with short lifetimes.\n4. 1-year refresh tokens without rotation: a stolen one works for a year;\n   rotate on every use, detect reuse, shorten lifetime.\n5. ID token to API: wrong audience; the API must accept only access tokens\n   issued for it (check aud and scopes).",
      },
    ],
    faq: [
      { q: "Is OAuth an authentication protocol?", a: "No. OAuth is for delegated authorization: giving an app access to an API. OpenID Connect adds authentication on top, with the ID token describing who logged in." },
      { q: "What is the difference between a JWT and an access token?", a: "JWT is a token format: signed JSON. An access token is a role. Access tokens are often JWTs, but they can also be random opaque strings the API checks with the authorization server." },
      { q: "Do I still need PKCE if my app has a client secret?", a: "Yes. Current best practice (RFC 9700) recommends PKCE for all clients, because it also prevents code injection attacks that a client secret does not stop." },
      { q: "Where should a browser app store tokens?", a: "Ideally not in the browser at all: a backend-for-frontend keeps tokens on the server and uses a secure, HttpOnly cookie. If tokens must be in the browser, keep them in memory and short-lived, not in localStorage." },
    ],
  },

  "sec-crypto-identity/least-privilege": {
    plain: [
      "Least privilege means every person, program and service gets only the access it needs to do its job, and nothing more. A support agent can view customer records but not delete them. A backup job can read the database but not change user accounts.",
      "Why does it matter so much? Because accounts get compromised. When an attacker takes over an account, they get exactly its permissions. If the account has little access, the damage (often called the blast radius) stays small. If it is an admin, the attacker owns everything.",
      "Managing permissions person by person quickly becomes a mess. Role-based access control (RBAC) groups permissions into roles like \"Support Agent\" or \"Billing Admin\", and people get roles. When someone changes jobs, you change their role, not fifty separate permissions.",
      "Access tends to grow over time: people collect permissions as they move between teams and nobody removes the old ones. This is called privilege creep. Regular access reviews, where managers confirm who still needs what, keep it under control.",
    ],
    deepDive: [
      {
        heading: "Applying least privilege in practice",
        body: "Start from zero and add, rather than start from everything and remove. For each role, list the tasks it performs, then the exact actions and resources those tasks need. Prefer narrow actions (read one bucket) over broad ones (all storage) and scope by resource, environment and time where your platform allows.\n\nService accounts and machine identities deserve the same care as people. They often hold broad, never-expiring permissions and are rarely reviewed. Give each application its own identity, never share one across apps, and prefer short-lived credentials, such as cloud workload roles, over long-lived keys.\n\nUse data to tighten permissions. Cloud providers show which permissions an identity actually used, for example AWS IAM Access Analyzer and last-accessed data. Permissions unused for 90 days are good candidates to remove. Separation of duties adds another layer: the person who requests a payment should not also approve it.",
        bullets: ["Deny by default; grant specific actions on specific resources", "One identity per application", "Remove permissions unused for a long period"],
      },
      {
        heading: "RBAC and ABAC compared",
        body: "RBAC (role-based access control) links users to roles, and roles to permissions. It is easy to understand and audit: \"who has the Billing Admin role?\" is one query. Its weakness is role explosion. When rules depend on details like region, project or data sensitivity, you end up with hundreds of roles such as Billing-Admin-EU-ProjectX.\n\nABAC (attribute-based access control) decides using attributes of the user, the resource, the action and the context, evaluated by a policy. For example: allow if user.department equals document.department and the request comes from a managed device during working hours. One policy can replace many roles, and new resources are covered automatically when they are tagged correctly. The trade-off is that it is harder to answer \"who can access this?\" and wrong tags quietly grant access.\n\nMost real systems combine both: roles for the broad shape, attributes for fine-grained conditions. AWS IAM, for instance, supports roles plus conditions on tags.",
        visual: {
          type: "compare",
          title: "RBAC vs ABAC",
          columns: [
            { title: "RBAC", points: ["User gets roles; roles hold permissions", "Simple to audit", "Risk: role explosion", "Good for stable job functions"] },
            { title: "ABAC", points: ["Policy checks user, resource and context attributes", "Fine-grained and flexible", "Risk: wrong tags grant access", "Good for many similar resources"] },
          ],
        },
      },
      {
        heading: "Protecting privileged accounts",
        body: "Admins should have two accounts: a normal one for email, chat and browsing, and a separate admin account used only for admin tasks. Phishing emails and malicious websites then hit an account with no admin power. The admin account should require phishing-resistant MFA and, ideally, be used only from a dedicated, hardened device called a privileged access workstation (PAW).\n\nEven better is to have no standing admin rights at all. Just-in-time (JIT) access tools, such as Microsoft Entra Privileged Identity Management, let a person request a role for a few hours, with a reason and sometimes an approval. When the time ends, the rights disappear. This turns admin access into logged, short events.\n\nKeep one or two break-glass accounts for emergencies, such as an outage of your identity provider's MFA. Store their credentials securely, exclude them from conditions that could lock them out, and alert on every single use.",
        visual: {
          type: "flow",
          title: "Just-in-time admin access",
          steps: [
            { label: "Request role", detail: "With reason and ticket number" },
            { label: "Approve", detail: "Manager or peer, if required" },
            { label: "Activate", detail: "MFA, then role for e.g. 2 hours" },
            { label: "Work and log", detail: "All actions recorded" },
            { label: "Expire", detail: "Role removed automatically" },
          ],
        },
      },
      {
        heading: "Running an access review",
        body: "An access review (also called recertification) asks the people who understand the work to confirm that each access is still needed. A good review is scoped and regular: privileged roles every quarter, normal application access every six or twelve months, plus event-driven checks when people change teams or leave.\n\nSteps: export who has what from each system, with last-used dates where available. Send each manager a short list for their team, not a 5,000-row spreadsheet. Ask for a decision on each line: keep or remove. Then actually remove what was rejected, record who decided and when, and follow up on items nobody answered.\n\nThe joiner, mover, leaver process is the daily version of this. Joiners get access from their role, movers lose old access when they gain new access, and leavers are disabled on their last day, ideally automatically from the HR system. Orphaned accounts (no matching person) and dormant accounts (no login for 90 days) should be disabled.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Identity lifecycle that prevents privilege creep",
        steps: [
          { label: "Joiner", detail: "Access from role, not copied from a colleague" },
          { label: "Mover", detail: "Old access removed when new is added" },
          { label: "Review", detail: "Managers confirm access regularly" },
          { label: "Clean up", detail: "Remove unused and dormant access" },
          { label: "Leaver", detail: "Disabled on the last day" },
        ],
      },
    ],
    examples: [
      {
        title: "A least-privilege cloud policy for a reporting app",
        explanation: "A reporting service only needs to read files from one storage bucket. Step 1: list its tasks: list the bucket and download reports. Step 2: grant exactly those two actions. Step 3: scope them: ListBucket applies to the bucket ARN, GetObject to objects inside it (the /* form). Step 4: attach the policy to a role the service assumes, not to a long-lived user key. Step 5: after a month, check last-accessed data to confirm nothing else is needed.",
        code: {
          lang: "json",
          code: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\"s3:ListBucket\"],\n      \"Resource\": \"arn:aws:s3:::reports-bucket\"\n    },\n    {\n      \"Effect\": \"Allow\",\n      \"Action\": [\"s3:GetObject\"],\n      \"Resource\": \"arn:aws:s3:::reports-bucket/*\"\n    }\n  ]\n}",
        },
      },
      {
        title: "Finding leavers and dormant accounts",
        explanation: "Step 1: export active employees from HR as a CSV of email addresses. Step 2: export accounts from the application, with their last login date. Step 3: compare the two. Accounts with no matching employee are orphans, often leavers whose access was never removed. Accounts with no login for over 90 days are dormant. Step 4: send the lists to the application owner, disable the confirmed ones, and record the decisions as evidence for audits.",
        code: {
          lang: "python",
          code: "import csv\nfrom datetime import datetime, timedelta\n\nstaff = {r[\"email\"].lower() for r in csv.DictReader(open(\"hr_active.csv\"))}\ncutoff = datetime.now() - timedelta(days=90)\nfor a in csv.DictReader(open(\"app_accounts.csv\")):\n    email, last = a[\"email\"].lower(), datetime.fromisoformat(a[\"last_login\"])\n    if email not in staff:\n        print(\"ORPHAN \", email, a[\"role\"])\n    elif last < cutoff:\n        print(\"DORMANT\", email, a[\"role\"], last.date())",
        },
      },
    ],
    cheatSheet: [
      "Start with no access and add only what each task needs",
      "Give each app its own identity; prefer short-lived roles over long-lived keys",
      "RBAC: users to roles to permissions; ABAC: policies on attributes and context",
      "Admins use a separate admin account with phishing-resistant MFA",
      "Just-in-time access removes standing admin rights",
      "Alert on every use of a break-glass account",
      "Review privileged roles quarterly and remove what managers reject",
      "Disable leavers on the last day; disable accounts with no login for 90 days",
    ],
    quiz: [
      {
        q: "An attacker phishes a developer who reads email with an account that is also a global admin. Which principle was broken?",
        options: ["Defence in depth", "Encryption at rest", "Separation of admin and daily-use accounts", "Data classification"],
        answer: 2,
        why: "Admin rights should live in a separate account that is not used for email and browsing.",
      },
      {
        q: "A company has 400 roles like Sales-EU-Read and Sales-US-Read. Which approach could reduce this?",
        options: ["Give everyone admin", "ABAC policies using region and department attributes", "Disable MFA", "Delete all roles and use shared accounts"],
        answer: 1,
        why: "Attribute-based policies can express one rule that covers all regions instead of a role per combination.",
      },
      {
        q: "What does just-in-time access provide?",
        options: ["Privileges that exist only for a limited, approved time window", "Faster logins", "Permanent admin rights for on-call staff", "Automatic password resets"],
        answer: 0,
        why: "JIT removes standing privilege so admin rights are short-lived and logged.",
      },
      {
        q: "A user moved from Finance to Marketing two years ago and still has the Finance payment role. What is this called?",
        options: ["Role explosion", "Break-glass access", "Separation of duties", "Privilege creep"],
        answer: 3,
        why: "Access that builds up as people change jobs, without old access being removed, is privilege creep.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Design three roles for a small blog platform (Reader, Author, Editor) and list the permissions each needs. Make sure no role has more than it requires.",
        hint: "Think about read, create, edit own, edit any, publish and delete.",
        solution: "Reader: read published posts, comment.\nAuthor: Reader + create drafts, edit own drafts, submit for review.\nEditor: Author + edit any draft, publish, unpublish.\nNone of them: manage users or site settings (that is a separate Admin role).\nAuthors cannot publish, so an editor reviews every post (separation of duties).",
      },
      {
        level: "medium",
        task: "Write an AWS IAM policy that allows starting and stopping EC2 instances only when the instance's project tag matches the caller's project tag.",
        hint: "Use a Condition with aws:ResourceTag/project and ${aws:PrincipalTag/project}.",
        solution: "{\n  \"Version\": \"2012-10-17\",\n  \"Statement\": [{\n    \"Effect\": \"Allow\",\n    \"Action\": [\"ec2:StartInstances\", \"ec2:StopInstances\"],\n    \"Resource\": \"arn:aws:ec2:*:*:instance/*\",\n    \"Condition\": {\"StringEquals\":\n      {\"aws:ResourceTag/project\": \"${aws:PrincipalTag/project}\"}}\n  }]\n}",
      },
      {
        level: "hard",
        task: "Plan a quarterly access review for privileged roles in a company with 20 admins across cloud, Active Directory and the HR system. Include scope, owners, evidence and what happens to unanswered items.",
        hint: "Keep lists short per reviewer and define a default action for no answer.",
        solution: "Scope: cloud admin roles, AD Domain Admins and server admin groups, HR admin role.\nData: export members + last-used date from each system on day 1.\nReviewers: each admin's manager, plus the system owner for service accounts.\nDecision per line: keep (with reason) or remove; due in 10 working days.\nNo answer by the deadline: access is suspended, reviewer is notified.\nAction: owners remove rejected access within 5 days; rescan to confirm.\nEvidence: exports, decisions, timestamps and removal tickets kept for audit.\nFollow-up: move remaining standing admins to just-in-time access.",
      },
    ],
    faq: [
      { q: "What is the difference between least privilege and zero trust?", a: "Least privilege is about how much access each identity has. Zero trust is a wider approach that also means checking identity, device and context on every request instead of trusting the network, and least privilege is one of its core parts." },
      { q: "Should developers have admin access to production?", a: "Usually not standing access. Give them read access for troubleshooting and use just-in-time elevation, with approval and logging, for the rare cases where they need to change production." },
      { q: "What is a break-glass account?", a: "An emergency admin account kept for when normal sign-in fails, for example during an MFA or identity provider outage. Its credentials are locked away, its use is rare, and every login should trigger an alert." },
    ],
  },
};

export default extra;
