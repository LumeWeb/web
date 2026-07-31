package exports

import (
	"encoding/hex"
	"fmt"

	"github.com/lbryio/lbcd/btcec"
	"go.lumeweb.com/liblbry/chain"
)

// TxInput is a transaction input (UTXO to spend).
type TxInput struct {
	TxID         string `json:"txid"`
	Vout         uint32 `json:"vout"`
	Amount       Amount `json:"amount"`
	ScriptPubKey string `json:"scriptPubKey"`
	Chain        uint32 `json:"chain"`  // HD chain (0=external/receiving, 1=internal/change)
	Index        uint32 `json:"index"`  // HD address index within the chain
}

// TxOutput is a transaction output to create.
type TxOutput struct {
	Address string `json:"address"`
	Amount  Amount `json:"amount"`

	// Claim fields (optional)
	IsClaim       bool   `json:"isClaim"`
	ClaimName     string `json:"claimName"`
	ClaimValueHex string `json:"claimValueHex"`
	ClaimIDHex    string `json:"claimIDHex"`
	ClaimType     int    `json:"claimType"` // 1=name, 2=update, 3=support
}

// BuildTxResult holds a signed raw transaction.
type BuildTxResult struct {
	TxHex string `json:"txhex"`
	TxID  string `json:"txid"`
}

// TxBuilder wraps chain.Builder with a fixed key derivation function.
type TxBuilder struct {
	builder *chain.Builder
}

// NewTxBuilder creates a TxBuilder for LBRY mainnet.
func NewTxBuilder() *TxBuilder {
	return &TxBuilder{builder: chain.NewBuilder(chain.LBRYParams())}
}

// Build constructs and signs a raw transaction.
// keyFn derives the private key for each input index.
func (tb *TxBuilder) Build(inputs []TxInput, outputs []TxOutput, keyFn func(idx int) (*btcec.PrivateKey, error)) (*BuildTxResult, error) {
	chainInputs, err := toChainInputs(inputs)
	if err != nil {
		return nil, err
	}
	chainOutputs, err := toChainOutputs(outputs)
	if err != nil {
		return nil, err
	}

	msgTx, err := tb.builder.Build(chainInputs, chainOutputs, func(idx int, in chain.Input) (*btcec.PrivateKey, error) {
		return keyFn(idx)
	})
	if err != nil {
		return nil, err
	}

	txHex, err := chain.SerializeHex(msgTx)
	if err != nil {
		return nil, err
	}

	return &BuildTxResult{
		TxHex: txHex,
		TxID:  chain.TxID(msgTx),
	}, nil
}

// EstimateTxSize returns a rough size estimate for a transaction.
func EstimateTxSize(numInputs, numOutputs int) int {
	return chain.EstimateTxSize(numInputs, numOutputs)
}

// EstimateFee calculates the fee for a given size and rate.
func EstimateFee(size int, feePerByte Amount) Amount {
	return Amount(chain.EstimateFee(size, feePerByte.Int64()))
}

// ClaimIDFromTxVout computes the claim ID for a txid+vout.
func ClaimIDFromTxVout(txidHex string, vout uint32) (string, error) {
	claimID, err := chain.NewClaimIDFromTxVout(txidHex, vout)
	if err != nil {
		return "", err
	}
	return claimID.String(), nil
}

func toChainInputs(inputs []TxInput) ([]chain.Input, error) {
	out := make([]chain.Input, len(inputs))
	for i, in := range inputs {
		script, err := hex.DecodeString(in.ScriptPubKey)
		if err != nil {
			return nil, fmt.Errorf("input %d scriptPubKey: %w", i, err)
		}
		out[i] = chain.Input{
			TxID:   in.TxID,
			Vout:   in.Vout,
			Amount: in.Amount.Int64(),
			Script: script,
		}
	}
	return out, nil
}

func toChainOutputs(outputs []TxOutput) ([]chain.Output, error) {
	out := make([]chain.Output, len(outputs))
	for i, o := range outputs {
		co := chain.Output{
			Address: o.Address,
			Amount:  o.Amount.Int64(),
		}
		if o.IsClaim {
			co.IsClaim = true
			co.ClaimName = o.ClaimName
			co.ClaimType = chain.ClaimType(o.ClaimType)
			if o.ClaimValueHex != "" {
				val, err := hex.DecodeString(o.ClaimValueHex)
				if err != nil {
					return nil, fmt.Errorf("output %d claimValueHex: %w", i, err)
				}
				co.ClaimValue = val
			}
			if o.ClaimIDHex != "" {
				claimID, err := chain.NewClaimIDFromString(o.ClaimIDHex)
				if err != nil {
					return nil, fmt.Errorf("output %d claimIDHex: %w", i, err)
				}
				co.ClaimID = claimID
			}
		}
		out[i] = co
	}
	return out, nil
}
