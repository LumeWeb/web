// Package main is the TinyGo WASM entrypoint for @lumeweb/lbry-sdk.
// It is a thin syscall/js adapter — all business logic lives in the
// exports package and is unit-testable without a JS runtime.
package main

import (
	"fmt"
	"syscall/js"

	"github.com/lbryio/lbcd/btcec"
	"go.lumeweb.com/lbry-sdk/wasm/exports"
)

var wm = exports.NewWalletManager()
var tb = exports.NewTxBuilder()

func main() {
	g := js.Global()
	if g.Get("__lbrySDK__").IsUndefined() {
		g.Set("__lbrySDK__", map[string]any{})
	}
	sdk := g.Get("__lbrySDK__")

	// ── Wallet ──
	sdk.Set("makeSeed", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := exports.MakeSeed()
		return respond(r, err)
	}))

	sdk.Set("walletFromMnemonic", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.FromMnemonic(args[0].String())
		return respond(r, err)
	}))

	sdk.Set("walletFromSeed", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.FromSeed(args[0].String())
		return respond(r, err)
	}))

	sdk.Set("walletPublicKeyHex", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.PublicKeyHex(args[0].Int())
		return respond(&exports.PublicKeyResult{PublicKey: r}, err)
	}))

	sdk.Set("walletPrivateKeyHex", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.PrivateKeyHex(args[0].Int())
		return respond(&exports.PrivateKeyResult{PrivateKey: r}, err)
	}))

	sdk.Set("walletPubKeyScriptAt", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.PubKeyScriptAt(args[0].Int(), args[1].Int(), args[2].Int())
		return respond(&exports.ScriptResult{ScriptPubKey: r}, err)
	}))

	sdk.Set("walletAddress", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.Address(args[0].Int())
		return respond(&exports.AddressResult{Address: r}, err)
	}))

	sdk.Set("walletAddressAt", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.AddressAt(args[0].Int(), args[1].Int(), args[2].Int())
		return respond(&exports.AddressResult{Address: r}, err)
	}))

	sdk.Set("walletMnemonic", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := wm.Mnemonic(args[0].Int())
		return respond(&exports.MnemonicResult{Mnemonic: r}, err)
	}))

	// ── Transaction ──
	sdk.Set("buildTx", js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) < 3 {
			return jsErr("expected 3 args: handle, inputs, outputs")
		}
		inputs, err := parseInputs(args[1])
		if err != nil {
			return jsErr(err.Error())
		}
		outputs, err := parseOutputs(args[2])
		if err != nil {
			return jsErr(err.Error())
		}
		handle := args[0].Int()
		r, err := tb.Build(inputs, outputs, func(idx int) (*btcec.PrivateKey, error) {
			if idx < 0 || idx >= len(inputs) {
				return nil, fmt.Errorf("input index %d out of range (len=%d)", idx, len(inputs))
			}
			in := inputs[idx]
			return wm.PrivateKeyAt(handle, int(in.Chain), int(in.Index))
		})
		return respond(r, err)
	}))

	sdk.Set("estimateTxSize", js.FuncOf(func(this js.Value, args []js.Value) any {
		r := exports.EstimateTxSize(args[0].Int(), args[1].Int())
		return respond(&exports.TxSizeResult{Size: r}, nil)
	}))

	sdk.Set("estimateFee", js.FuncOf(func(this js.Value, args []js.Value) any {
		feePerByte, err := jsAmount(args[1])
		if err != nil {
			return jsErr(fmt.Sprintf("estimateFee feePerByte: %v", err))
		}
		r := exports.EstimateFee(args[0].Int(), feePerByte)
		return respond(&exports.FeeResult{Fee: r}, nil)
	}))

	sdk.Set("walletClose", js.FuncOf(func(this js.Value, args []js.Value) any {
		ok := wm.Close(args[0].Int())
		return respond(&exports.CloseResult{Closed: ok}, nil)
	}))

	sdk.Set("claimIDFromTxVout", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := exports.ClaimIDFromTxVout(args[0].String(), uint32(args[1].Int()))
		return respond(&exports.ClaimIDResult{ClaimIDHex: r}, err)
	}))

	// ── Claims ──
	sdk.Set("createChannelClaim", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := exports.CreateChannelClaim(args[0].String(), args[1].String())
		return respond(r, err)
	}))

	sdk.Set("createStreamClaim", js.FuncOf(func(this js.Value, args []js.Value) any {
		channelID := ""
		if len(args) >= 5 {
			channelID = args[4].String()
		}
		r, err := exports.CreateStreamClaim(args[0].String(), args[1].String(), args[2].String(), args[3].String(), channelID)
		return respond(r, err)
	}))

	sdk.Set("createCollectionClaim", js.FuncOf(func(this js.Value, args []js.Value) any {
		ids := jsSliceToStrings(args[1])
		r, err := exports.CreateCollectionClaim(args[0].String(), ids)
		return respond(r, err)
	}))

	sdk.Set("createRepostClaim", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := exports.CreateRepostClaim(args[0].String(), args[1].String())
		return respond(r, err)
	}))

	sdk.Set("signStreamClaim", js.FuncOf(func(this js.Value, args []js.Value) any {
		// args: handle, valueHex, firstInputTxID, channelClaimIDHex, channelChain, channelIndex
		if len(args) < 6 {
			return jsErr("expected 6 args: handle, valueHex, firstInputTxID, channelClaimIDHex, channelChain, channelIndex")
		}
		privKey, err := wm.PrivateKeyAt(args[0].Int(), args[4].Int(), args[5].Int())
		if err != nil {
			return jsErr(err.Error())
		}
		r, err := exports.SignStreamClaim(args[1].String(), args[2].String(), args[3].String(), privKey)
		return respond(r, err)
	}))

	sdk.Set("parseClaimValue", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := exports.ParseClaim(args[0].String())
		return respond(r, err)
	}))

	sdk.Set("compileClaimValue", js.FuncOf(func(this js.Value, args []js.Value) any {
		r, err := exports.CompileClaimValue(args[0].String())
		return respond(&exports.ValueHexResult{ValueHex: r}, err)
	}))

	// ── Coin Selection ──
	sdk.Set("selectCoins", js.FuncOf(func(this js.Value, args []js.Value) any {
		utxos, err := parseUTXOInputs(args[0])
		if err != nil {
			return jsErr(err.Error())
		}
		target, err := jsAmount(args[1])
		if err != nil {
			return jsErr(fmt.Sprintf("selectCoins target: %v", err))
		}
		feePerByte, err := jsAmount(args[2])
		if err != nil {
			return jsErr(fmt.Sprintf("selectCoins feePerByte: %v", err))
		}
		input := exports.SelectCoinsInput{
			UTXOs:      utxos,
			Target:     target,
			FeePerByte: feePerByte,
		}
		if len(args) >= 4 {
			costOfChange, err := jsAmount(args[3])
			if err != nil {
				return jsErr(fmt.Sprintf("selectCoins costOfChange: %v", err))
			}
			input.CostOfChange = costOfChange
		}
		r, err := exports.SelectCoins(input)
		return respond(r, err)
	}))

	sdk.Set("ready", true)
	select {}
}
