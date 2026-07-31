package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"syscall/js"

	"go.lumeweb.com/lbry-sdk/wasm/exports"
)

// respond converts a result struct or error to a JS-friendly map.
// Uses json.Marshal + unmarshal to map[string]any so that json struct tags
// are the single source of truth for field names.
func respond(result any, err error) any {
	if err != nil {
		return map[string]any{"error": err.Error()}
	}
	if result == nil {
		return map[string]any{}
	}
	return toJSMap(result)
}

func jsErr(msg string) map[string]any {
	return map[string]any{"error": msg}
}

// toJSMap converts any struct with json tags to a map[string]any.
// This is the runtime bridge — at build time, the contract generator reads
// the same json tags via Go AST to produce TypeScript types.
func toJSMap(v any) any {
	// Fast path for map[string]any (used by jsErr)
	if m, ok := v.(map[string]any); ok {
		return m
	}

	// Marshal to JSON using struct tags, then unmarshal to map
	data, err := json.Marshal(v)
	if err != nil {
		return map[string]any{"error": fmt.Sprintf("marshal: %v", err)}
	}

	var m map[string]any
	if err := json.Unmarshal(data, &m); err != nil {
		return map[string]any{"error": fmt.Sprintf("unmarshal: %v", err)}
	}

	// Clean up empty strings (don't send empty fields for ParsedClaim etc.)
	return m
}

// ── JS value parsing helpers ──

// jsAmount reads an Amount from a js.Value as an integer satoshi string.
// Numeric JS types are rejected because syscall/js.Value.Int() is 32-bit
// on wasm32, causing silent overflow for amounts above ~21.47 LBC.
// All monetary values must cross the WASM boundary as strings.
func jsAmount(v js.Value) (exports.Amount, error) {
	if v.Type() != js.TypeString {
		return 0, fmt.Errorf("amount must be an integer satoshi string, got %s", v.Type().String())
	}
	n, err := strconv.ParseInt(v.String(), 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid amount %q: %w", v.String(), err)
	}
	return exports.Amount(n), nil
}

func jsSliceToStrings(arr js.Value) []string {
	if arr.IsUndefined() || arr.IsNull() {
		return nil
	}
	length := arr.Length()
	out := make([]string, length)
	for i := 0; i < length; i++ {
		out[i] = arr.Index(i).String()
	}
	return out
}

func parseInputs(arr js.Value) ([]exports.TxInput, error) {
	if arr.IsUndefined() || arr.IsNull() {
		return nil, nil
	}
	// Handle JSON string input from TS (JSON.stringify)
	if arr.Type() == js.TypeString {
		var out []exports.TxInput
		if err := json.Unmarshal([]byte(arr.String()), &out); err != nil {
			return nil, fmt.Errorf("invalid inputs JSON: %w", err)
		}
		return out, nil
	}
	length := arr.Length()
	out := make([]exports.TxInput, length)
	for i := 0; i < length; i++ {
		in := arr.Index(i)
		amt, err := jsAmount(in.Get("amount"))
		if err != nil {
			return nil, fmt.Errorf("input %d amount: %w", i, err)
		}
		out[i] = exports.TxInput{
			TxID:         in.Get("txid").String(),
			Vout:         uint32(in.Get("vout").Int()),
			Amount:       amt,
			ScriptPubKey: in.Get("scriptPubKey").String(),
			Chain:        uint32(in.Get("chain").Int()),
			Index:        uint32(in.Get("index").Int()),
		}
	}
	return out, nil
}

func parseOutputs(arr js.Value) ([]exports.TxOutput, error) {
	if arr.IsUndefined() || arr.IsNull() {
		return nil, nil
	}
	// Handle JSON string input from TS (JSON.stringify)
	if arr.Type() == js.TypeString {
		var out []exports.TxOutput
		if err := json.Unmarshal([]byte(arr.String()), &out); err != nil {
			return nil, fmt.Errorf("invalid outputs JSON: %w", err)
		}
		return out, nil
	}
	length := arr.Length()
	out := make([]exports.TxOutput, length)
	for i := 0; i < length; i++ {
		o := arr.Index(i)
		amt, err := jsAmount(o.Get("amount"))
		if err != nil {
			return nil, fmt.Errorf("output %d amount: %w", i, err)
		}
		out[i] = exports.TxOutput{
			Address:       o.Get("address").String(),
			Amount:        amt,
			IsClaim:       o.Get("isClaim").Bool(),
			ClaimName:     o.Get("claimName").String(),
			ClaimValueHex: o.Get("claimValueHex").String(),
			ClaimIDHex:    o.Get("claimIDHex").String(),
			ClaimType:     o.Get("claimType").Int(),
		}
	}
	return out, nil
}

func parseUTXOInputs(arr js.Value) ([]exports.UTXOInput, error) {
	if arr.IsUndefined() || arr.IsNull() {
		return nil, nil
	}
	// Handle JSON string input from TS (JSON.stringify)
	if arr.Type() == js.TypeString {
		var out []exports.UTXOInput
		if err := json.Unmarshal([]byte(arr.String()), &out); err != nil {
			return nil, fmt.Errorf("invalid UTXO JSON: %w", err)
		}
		return out, nil
	}
	length := arr.Length()
	out := make([]exports.UTXOInput, length)
	for i := 0; i < length; i++ {
		u := arr.Index(i)
		amt, err := jsAmount(u.Get("amount"))
		if err != nil {
			return nil, fmt.Errorf("utxo %d amount: %w", i, err)
		}
		out[i] = exports.UTXOInput{
			TxID:   u.Get("txid").String(),
			Vout:   uint32(u.Get("vout").Int()),
			Amount: amt,
			Height: u.Get("height").Int(),
		}
	}
	return out, nil
}
