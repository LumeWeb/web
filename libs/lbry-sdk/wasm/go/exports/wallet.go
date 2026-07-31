// Package exports contains the pure-Go business logic for the WASM bridge.
// Each function returns a result struct or an error — no syscall/js here.
// The main package wraps these with syscall/js adapters.
package exports

import (
	"encoding/hex"
	"fmt"
	"sync"

	"github.com/lbryio/lbcd/btcec"
	"go.lumeweb.com/liblbry/wallet"
)

// WalletManager manages wallet instances by handle.
type WalletManager struct {
	mu        sync.RWMutex
	wallets   map[int]*wallet.Wallet
	nextHandle int
}

// NewWalletManager creates a new WalletManager.
func NewWalletManager() *WalletManager {
	return &WalletManager{
		wallets: make(map[int]*wallet.Wallet),
	}
}

// MakeSeedResult holds the result of mnemonic generation.
type MakeSeedResult struct {
	Mnemonic string `json:"mnemonic"`
}

// CloseResult holds the result of walletClose.
type CloseResult struct {
	Closed bool `json:"closed"`
}

// MakeSeed generates a new Electrum mnemonic.
func MakeSeed() (*MakeSeedResult, error) {
	mnemonic, err := wallet.MakeSeed()
	if err != nil {
		return nil, err
	}
	return &MakeSeedResult{Mnemonic: mnemonic}, nil
}

// WalletResult holds the result of wallet creation.
type WalletResult struct {
	Handle  int    `json:"handle"`
	Address string `json:"address"`
}

// FromMnemonic creates a wallet from a mnemonic phrase.
func (wm *WalletManager) FromMnemonic(mnemonic string) (*WalletResult, error) {
	w, err := wallet.NewFromMnemonic(mnemonic)
	if err != nil {
		return nil, err
	}
	return wm.register(w), nil
}

// FromSeed creates a wallet from raw seed hex.
func (wm *WalletManager) FromSeed(seedHex string) (*WalletResult, error) {
	seed, err := hex.DecodeString(seedHex)
	if err != nil {
		return nil, fmt.Errorf("invalid seed hex: %w", err)
	}
	w, err := wallet.NewFromSeed(seed)
	if err != nil {
		return nil, err
	}
	return wm.register(w), nil
}

// Address returns the primary address (m/0/0).
func (wm *WalletManager) Address(handle int) (string, error) {
	var addr string
	err := wm.get(handle, func(w *wallet.Wallet) error {
		addr = w.AddressString()
		return nil
	})
	return addr, err
}

// AddressAt returns the address at m/chain/index.
func (wm *WalletManager) AddressAt(handle, chain, index int) (string, error) {
	var addr string
	err := wm.get(handle, func(w *wallet.Wallet) error {
		var e error
		addr, e = w.AddressStringAt(uint32(chain), uint32(index))
		return e
	})
	return addr, err
}

// Mnemonic returns the mnemonic for a wallet handle.
func (wm *WalletManager) Mnemonic(handle int) (string, error) {
	var mn string
	err := wm.get(handle, func(w *wallet.Wallet) error {
		mn = w.Mnemonic()
		return nil
	})
	return mn, err
}

// PublicKeyHex returns the compressed public key hex for m/0/0.
func (wm *WalletManager) PublicKeyHex(handle int) (string, error) {
	var pk string
	err := wm.get(handle, func(w *wallet.Wallet) error {
		pk = w.PublicKeyHex()
		return nil
	})
	return pk, err
}

// PrivateKeyHex returns the private key hex for m/0/0.
func (wm *WalletManager) PrivateKeyHex(handle int) (string, error) {
	var pk string
	err := wm.get(handle, func(w *wallet.Wallet) error {
		pk = w.PrivateKeyHex()
		return nil
	})
	return pk, err
}

// PubKeyScriptAt returns the scriptPubKey hex for m/chain/index.
func (wm *WalletManager) PubKeyScriptAt(handle, chain, index int) (string, error) {
	var scriptHex string
	err := wm.get(handle, func(w *wallet.Wallet) error {
		script, e := w.PubKeyScriptAt(uint32(chain), uint32(index))
		if e != nil {
			return e
		}
		scriptHex = hex.EncodeToString(script)
		return nil
	})
	return scriptHex, err
}

// PrivateKeyAt returns the private key at m/chain/index for signing.
func (wm *WalletManager) PrivateKeyAt(handle, chain, index int) (*btcec.PrivateKey, error) {
	var pk *btcec.PrivateKey
	err := wm.get(handle, func(w *wallet.Wallet) error {
		var e error
		pk, e = w.PrivateKeyAt(uint32(chain), uint32(index))
		return e
	})
	return pk, err
}

// Close releases a wallet handle, clearing private key material from memory.
func (wm *WalletManager) Close(handle int) bool {
	wm.mu.Lock()
	defer wm.mu.Unlock()
	w, ok := wm.wallets[handle]
	if !ok {
		return false
	}
	w.Zero()
	delete(wm.wallets, handle)
	return true
}

func (wm *WalletManager) register(w *wallet.Wallet) *WalletResult {
	wm.mu.Lock()
	defer wm.mu.Unlock()
	handle := wm.nextHandle
	wm.nextHandle++
	wm.wallets[handle] = w
	return &WalletResult{
		Handle:  handle,
		Address: w.AddressString(),
	}
}

// get retrieves a wallet by handle under a read lock.
// Callers perform their operations while the RLock is held via the
// provided callback to prevent use-after-close races.
func (wm *WalletManager) get(handle int, fn func(*wallet.Wallet) error) error {
	wm.mu.RLock()
	defer wm.mu.RUnlock()
	w, ok := wm.wallets[handle]
	if !ok {
		return fmt.Errorf("invalid wallet handle: %d", handle)
	}
	return fn(w)
}
