import { HDKey } from "ed25519-keygen/hdkey";
import * as bip39 from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";

const BIP44_PATH = "m/44'/1627'/0'/0'/0'";

const mn = bip39.generateMnemonic(wordlist);
console.log(mn);

const hdkey = HDKey.fromMasterSeed(await bip39.mnemonicToSeed(mn));

console.log(Buffer.from(hdkey.derive(BIP44_PATH).publicKeyRaw).toString("hex"));
