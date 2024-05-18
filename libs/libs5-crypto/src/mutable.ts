import { decodeEndian, encodeEndian } from "@lumeweb/libs5-encoding";
import { xchacha20poly1305 } from "@noble/ciphers/chacha";
import { concatBytes, randomBytes } from "@noble/hashes/utils";
import {
  ENCRYPTION_KEY_LENGTH,
  ENCRYPTION_NONCE_LENGTH,
  ENCRYPTION_OVERHEAD_LENGTH,
} from "./constants";
import { checkPaddedBlock, padFileSizeDefault } from "./padding";

function encryptMutableBytes(
  data: Uint8Array,
  key: Uint8Array,
  nonce = randomBytes(ENCRYPTION_NONCE_LENGTH),
): Uint8Array {
  const lengthInBytes = encodeEndian(data.length, 4);

  const totalOverhead =
    ENCRYPTION_OVERHEAD_LENGTH + 4 + ENCRYPTION_NONCE_LENGTH + 2;

  const finalSize =
    padFileSizeDefault(data.length + totalOverhead) - totalOverhead;

  data = concatBytes(
    lengthInBytes,
    data,
    new Uint8Array(finalSize - data.length),
  );
  // Generate a random nonce.
  const header = [0x8d, 0x01, ...nonce];

  // Encrypt the data.
  const encryptedBytes = xchacha20poly1305(key, nonce).encrypt(data);

  // Prepend the header to the final data.
  return concatBytes(Uint8Array.from(header), encryptedBytes);
}

function decryptMutableBytes(data: Uint8Array, key: Uint8Array): Uint8Array {
  if (key.length !== ENCRYPTION_KEY_LENGTH) {
    throw new Error(
      `wrong encryptionKeyLength (${key.length} != ${ENCRYPTION_KEY_LENGTH})`,
    );
  }

  // Validate that the size of the data corresponds to a padded block.
  if (!checkPaddedBlock(data.length)) {
    throw new Error(
      `Expected parameter 'data' to be padded encrypted data, length was '${
        data.length
      }', nearest padded block is '${padFileSizeDefault(data.length)}'`,
    );
  }

  const version = data[1];
  if (version !== 0x01) {
    throw new Error("Invalid version");
  }

  // Extract the nonce.
  const nonce = data.subarray(2, ENCRYPTION_NONCE_LENGTH + 2);

  const decryptedBytes = xchacha20poly1305(key, nonce).decrypt(
    data.subarray(ENCRYPTION_NONCE_LENGTH + 2),
  );
  const lengthInBytes = decryptedBytes.subarray(0, 4);
  const length = decodeEndian(lengthInBytes);

  return decryptedBytes.subarray(4, length + 4);
}

export { encryptMutableBytes, decryptMutableBytes };
