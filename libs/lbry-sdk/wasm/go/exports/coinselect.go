package exports

import (
	"fmt"

	"go.lumeweb.com/liblbry/coinselect"
)

// UTXOInput is a UTXO available for coin selection.
type UTXOInput struct {
	TxID   string `json:"txid"`
	Vout   uint32 `json:"vout"`
	Amount Amount `json:"amount"`
	Height int    `json:"height"`
}

// SelectCoinsInput holds the parameters for coin selection.
type SelectCoinsInput struct {
	UTXOs        []UTXOInput `json:"utxos"`
	Target       Amount      `json:"target"`
	FeePerByte   Amount      `json:"feePerByte"`
	CostOfChange Amount      `json:"costOfChange"`
}

// SelectedUTXO is a selected UTXO with fee info.
type SelectedUTXO struct {
	TxID            string `json:"txid"`
	Vout            uint32 `json:"vout"`
	Amount          Amount `json:"amount"`
	Fee             Amount `json:"fee"`
	EffectiveAmount Amount `json:"effectiveAmount"`
	Height          int    `json:"height"`
}

// SelectCoinsResult holds the outcome of coin selection.
type SelectCoinsResult struct {
	Selected   []SelectedUTXO `json:"selected"`
	Total      Amount         `json:"total"`
	Effective  Amount         `json:"effective"`
	Waste      Amount         `json:"waste"`
	ExactMatch bool           `json:"exactMatch"`
}

// SelectCoins runs the standard BnB→ClosestMatch→Accumulator selection.
func SelectCoins(input SelectCoinsInput) (*SelectCoinsResult, error) {
	feePerByte := input.FeePerByte.Int64()
	utxos := make([]coinselect.UTXO, len(input.UTXOs))
	for i, u := range input.UTXOs {
		fee := coinselect.EstimateFeeP2PKH(feePerByte)
		amt := u.Amount.Int64()
		utxos[i] = coinselect.UTXO{
			TxID:            u.TxID,
			Vout:            u.Vout,
			Amount:          amt,
			Height:          u.Height,
			Fee:             fee,
			EffectiveAmount: amt - fee,
		}
	}

	selector := coinselect.NewSelector(input.Target.Int64(), input.CostOfChange.Int64())
	result := selector.Standard(utxos)

	if len(result.UTXOs) == 0 {
		available := coinselect.Available(utxos)
		return nil, fmt.Errorf("insufficient funds: need %d, have %d effective", input.Target.Int64(), available)
	}

	selected := make([]SelectedUTXO, len(result.UTXOs))
	for i, u := range result.UTXOs {
		selected[i] = SelectedUTXO{
			TxID:            u.TxID,
			Vout:            u.Vout,
			Amount:          Amount(u.Amount),
			Fee:             Amount(u.Fee),
			EffectiveAmount: Amount(u.EffectiveAmount),
			Height:          u.Height,
		}
	}

	return &SelectCoinsResult{
		Selected:   selected,
		Total:      Amount(result.Total),
		Effective:  Amount(result.Effective),
		Waste:      Amount(result.Waste),
		ExactMatch: result.ExactMatch,
	}, nil
}
