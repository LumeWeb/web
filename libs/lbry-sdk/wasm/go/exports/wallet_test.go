package exports

import (
	"os"
	"testing"
)

// testMnemonic is loaded from the LBRY_TEST_MNEMONIC environment variable.
// No fallback — secrets must not be committed to source.
var testMnemonic = os.Getenv("LBRY_TEST_MNEMONIC")

func TestMakeSeed(t *testing.T) {
	r, err := MakeSeed()
	if err != nil {
		t.Fatalf("MakeSeed: %v", err)
	}
	if r.Mnemonic == "" {
		t.Fatal("empty mnemonic")
	}
}

func TestWalletFromMnemonic(t *testing.T) {
	if testMnemonic == "" {
		t.Skip("LBRY_TEST_MNEMONIC not set")
	}
	wm := NewWalletManager()
	r, err := wm.FromMnemonic(testMnemonic)
	if err != nil {
		t.Fatalf("FromMnemonic: %v", err)
	}
	if r.Handle != 0 {
		t.Errorf("expected handle 0, got %d", r.Handle)
	}
	if r.Address == "" {
		t.Fatal("empty address")
	}
}

func TestWalletFromMnemonicInvalid(t *testing.T) {
	wm := NewWalletManager()
	_, err := wm.FromMnemonic("not a valid mnemonic")
	if err == nil {
		t.Fatal("expected error for invalid mnemonic")
	}
}

func TestWalletAddressAt(t *testing.T) {
	if testMnemonic == "" {
		t.Skip("LBRY_TEST_MNEMONIC not set")
	}
	wm := NewWalletManager()
	r, _ := wm.FromMnemonic(testMnemonic)

	addr0, err := wm.AddressAt(r.Handle, 0, 0)
	if err != nil {
		t.Fatalf("AddressAt(0,0): %v", err)
	}
	addr1, err := wm.AddressAt(r.Handle, 0, 1)
	if err != nil {
		t.Fatalf("AddressAt(0,1): %v", err)
	}
	if addr0 == addr1 {
		t.Errorf("addresses at different indexes should differ: %s == %s", addr0, addr1)
	}
}

func TestWalletMnemonic(t *testing.T) {
	if testMnemonic == "" {
		t.Skip("LBRY_TEST_MNEMONIC not set")
	}
	wm := NewWalletManager()
	r, _ := wm.FromMnemonic(testMnemonic)

	got, err := wm.Mnemonic(r.Handle)
	if err != nil {
		t.Fatalf("Mnemonic: %v", err)
	}
	if got != testMnemonic {
		t.Errorf("mnemonic mismatch: got %q, want %q", got, testMnemonic)
	}
}

func TestWalletPublicKeyHex(t *testing.T) {
	if testMnemonic == "" {
		t.Skip("LBRY_TEST_MNEMONIC not set")
	}
	wm := NewWalletManager()
	r, _ := wm.FromMnemonic(testMnemonic)

	pub, err := wm.PublicKeyHex(r.Handle)
	if err != nil {
		t.Fatalf("PublicKeyHex: %v", err)
	}
	if len(pub) != 66 { // 33 bytes compressed = 66 hex chars
		t.Errorf("expected 66-char compressed pubkey, got %d chars", len(pub))
	}
}

func TestWalletInvalidHandle(t *testing.T) {
	wm := NewWalletManager()
	_, err := wm.Address(999)
	if err == nil {
		t.Fatal("expected error for invalid handle")
	}
}

func TestWalletFromSeed(t *testing.T) {
	seed := os.Getenv("LBRY_TEST_SEED")
	if seed == "" {
		t.Skip("LBRY_TEST_SEED not set")
	}
	wm := NewWalletManager()
	r, err := wm.FromSeed(seed)
	if err != nil {
		t.Fatalf("FromSeed: %v", err)
	}
	if r.Address == "" {
		t.Fatal("empty address from seed")
	}
}

func TestWalletFromSeedInvalidHex(t *testing.T) {
	wm := NewWalletManager()
	_, err := wm.FromSeed("not-hex")
	if err == nil {
		t.Fatal("expected error for invalid hex seed")
	}
}

func TestWalletPubKeyScriptAt(t *testing.T) {
	if testMnemonic == "" {
		t.Skip("LBRY_TEST_MNEMONIC not set")
	}
	wm := NewWalletManager()
	r, _ := wm.FromMnemonic(testMnemonic)

	script, err := wm.PubKeyScriptAt(r.Handle, 0, 0)
	if err != nil {
		t.Fatalf("PubKeyScriptAt: %v", err)
	}
	if script == "" {
		t.Fatal("empty scriptPubKey")
	}
}

// TestMnemonicFromEnv verifies that the test mnemonic is loaded from
// the LBRY_TEST_MNEMONIC environment variable (Kody #3/#8: no secrets in source).
func TestMnemonicFromEnv(t *testing.T) {
	if testMnemonic == "" {
		t.Skip("LBRY_TEST_MNEMONIC not set")
	}
	wm := NewWalletManager()
	r, err := wm.FromMnemonic(testMnemonic)
	if err != nil {
		t.Fatalf("FromMnemonic with testMnemonic failed: %v", err)
	}
	if r.Address == "" {
		t.Fatal("empty address from testMnemonic")
	}
}

// TestMnemonicNotInSource verifies no fallback mnemonic is hard-coded.
func TestMnemonicNotInSource(t *testing.T) {
	// When env var is not set, testMnemonic must be empty — no fallback value.
	if os.Getenv("LBRY_TEST_MNEMONIC") == "" && testMnemonic != "" {
		t.Fatal("testMnemonic has a fallback value — load from LBRY_TEST_MNEMONIC instead")
	}
}
