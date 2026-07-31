package exports

// PrimitiveResult wraps a single string value for WASM bridge functions
// that return a primitive (not a complex struct).

// PublicKeyResult holds a public key hex string.
type PublicKeyResult struct {
	PublicKey string `json:"publicKey"`
}

// PrivateKeyResult holds a private key hex string.
type PrivateKeyResult struct {
	PrivateKey string `json:"privateKey"`
}

// ScriptResult holds a scriptPubKey hex string.
type ScriptResult struct {
	ScriptPubKey string `json:"scriptPubKey"`
}

// AddressResult holds a base58check address.
type AddressResult struct {
	Address string `json:"address"`
}

// MnemonicResult holds a mnemonic phrase.
type MnemonicResult struct {
	Mnemonic string `json:"mnemonic"`
}

// TxSizeResult holds an estimated transaction size in bytes.
type TxSizeResult struct {
	Size int `json:"size"`
}

// FeeResult holds an estimated fee in satoshis.
type FeeResult struct {
	Fee Amount `json:"fee"`
}

// ClaimIDResult holds a claim ID hex string.
type ClaimIDResult struct {
	ClaimIDHex string `json:"claimIDHex"`
}

// ValueHexResult holds a compiled claim value hex string.
type ValueHexResult struct {
	ValueHex string `json:"valueHex"`
}

// JSFunc describes one sdk.Set() registration for contract generation.
// It maps a JS function name to its Go result type and parameter list.
type JSFunc struct {
	Name     string   // JS function name (e.g., "walletFromMnemonic")
	GoType   string   // Go result type (e.g., "WalletResult")
	Params   []JSParam // input parameters
	Category string   // namespace: wallet, tx, claim, coinselect, meta
}

// JSParam describes one input parameter.
type JSParam struct {
	Name string // JS parameter name
	Type string // TypeScript type ("string", "number", "string[]")
}

// CompileClaimValueResult is an alias for ValueHexResult for compileClaimValue.
type CompileClaimValueResult = ValueHexResult
