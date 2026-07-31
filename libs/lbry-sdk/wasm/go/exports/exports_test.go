package exports

import (
	"testing"
)

func TestEstimateTxSize(t *testing.T) {
	// 1 input, 2 outputs: 10 + 250 + 80 = 340
	size := EstimateTxSize(1, 2)
	if size != 340 {
		t.Errorf("EstimateTxSize(1,2) = %d, want 340", size)
	}
}

func TestEstimateFee(t *testing.T) {
	// 340 bytes * 10 sat/byte = 3400
	fee := EstimateFee(340, 10)
	if fee != 3400 {
		t.Errorf("EstimateFee(340, 10) = %d, want 3400", fee)
	}
}

func TestClaimIDFromTxVout(t *testing.T) {
	// Use a known txid + vout to verify the algorithm produces a 40-char hex
	txid := "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6"
	claimID, err := ClaimIDFromTxVout(txid, 0)
	if err != nil {
		t.Fatalf("ClaimIDFromTxVout: %v", err)
	}
	if len(claimID) != 40 {
		t.Errorf("claimID length = %d, want 40", len(claimID))
	}
}

func TestClaimIDFromTxVoutInvalidTxid(t *testing.T) {
	_, err := ClaimIDFromTxVout("not-hex", 0)
	if err == nil {
		t.Fatal("expected error for invalid txid")
	}
}

func TestSelectCoinsSufficient(t *testing.T) {
	input := SelectCoinsInput{
		UTXOs: []UTXOInput{
			{TxID: "abc", Vout: 0, Amount: 5000, Height: 100},
			{TxID: "def", Vout: 1, Amount: 3000, Height: 200},
		},
		Target:     1000,
		FeePerByte: 1,
	}
	r, err := SelectCoins(input)
	if err != nil {
		t.Fatalf("SelectCoins: %v", err)
	}
	if len(r.Selected) == 0 {
		t.Fatal("no UTXOs selected")
	}
	if r.Total < 1000 {
		t.Errorf("total %d < target 1000", r.Total)
	}
}

func TestSelectCoinsInsufficient(t *testing.T) {
	input := SelectCoinsInput{
		UTXOs: []UTXOInput{
			{TxID: "abc", Vout: 0, Amount: 100, Height: 1},
		},
		Target:     100000,
		FeePerByte: 1,
	}
	_, err := SelectCoins(input)
	if err == nil {
		t.Fatal("expected error for insufficient funds")
	}
}

func TestSelectCoinsExactMatch(t *testing.T) {
	// With a single UTXO that exactly matches target + fee
	input := SelectCoinsInput{
		UTXOs: []UTXOInput{
			{TxID: "abc", Vout: 0, Amount: 1148, Height: 1}, // 1148 - 148 (fee) = 1000 exact
		},
		Target:       1000,
		FeePerByte:   1,
		CostOfChange: 0,
	}
	r, err := SelectCoins(input)
	if err != nil {
		t.Fatalf("SelectCoins: %v", err)
	}
	if !r.ExactMatch {
		t.Errorf("expected exact match, got waste=%d", r.Waste)
	}
}

func TestCreateChannelClaim(t *testing.T) {
	// 33-byte compressed pubkey (all zeros for test)
	pubKeyHex := "000000000000000000000000000000000000000000000000000000000000000000"
	r, err := CreateChannelClaim("Test Channel", pubKeyHex)
	if err != nil {
		t.Fatalf("CreateChannelClaim: %v", err)
	}
	if r.ValueHex == "" {
		t.Fatal("empty valueHex")
	}
}

func TestCreateChannelClaimInvalidPubKey(t *testing.T) {
	_, err := CreateChannelClaim("Test", "tooshort")
	if err == nil {
		t.Fatal("expected error for invalid pubkey length")
	}
}

func TestCreateStreamClaim(t *testing.T) {
	// 48-byte sdHash hex (SHA-384 = 96 hex chars)
	sdHash := "768412320f7b0aa5812fce428dc4706b3cae50e02a64caa16a782249bfe8efc4b7ef1ccb126255d196047dfedf17a0a9"
	r, err := CreateStreamClaim("Test Stream", "A description", sdHash, "video/mp4", "")
	if err != nil {
		t.Fatalf("CreateStreamClaim: %v", err)
	}
	if r.ValueHex == "" {
		t.Fatal("empty valueHex")
	}
}

func TestCreateStreamClaimInvalidSdHash(t *testing.T) {
	_, err := CreateStreamClaim("Test", "desc", "tooshort", "video/mp4", "")
	if err == nil {
		t.Fatal("expected error for invalid sdHash length")
	}
}

func TestParseClaimRoundTrip(t *testing.T) {
	// Create a channel claim, then parse it back
	pubKeyHex := "03672b90e99b4326c49523d112ac7d1a2775b0ea676472212dbb479b1eac3d5761"
	r, err := CreateChannelClaim("Round Trip Channel", pubKeyHex)
	if err != nil {
		t.Fatalf("CreateChannelClaim: %v", err)
	}

	parsed, err := ParseClaim(r.ValueHex)
	if err != nil {
		t.Fatalf("ParseClaim: %v", err)
	}
	if parsed.ClaimType != "channel" {
		t.Errorf("claimType = %q, want \"channel\"", parsed.ClaimType)
	}
	if parsed.Title != "Round Trip Channel" {
		t.Errorf("title = %q, want \"Round Trip Channel\"", parsed.Title)
	}
	if parsed.PublicKeyHex != pubKeyHex {
		t.Errorf("publicKeyHex = %q, want %q", parsed.PublicKeyHex, pubKeyHex)
	}
}

func TestCompileClaimValueRoundTrip(t *testing.T) {
	pubKeyHex := "03672b90e99b4326c49523d112ac7d1a2775b0ea676472212dbb479b1eac3d5761"
	r, _ := CreateChannelClaim("Test", pubKeyHex)

	recompiled, err := CompileClaimValue(r.ValueHex)
	if err != nil {
		t.Fatalf("CompileClaimValue: %v", err)
	}
	if recompiled != r.ValueHex {
		t.Errorf("round-trip mismatch:\n  original:    %s\n  recompiled: %s", r.ValueHex, recompiled)
	}
}

func TestParseClaimInvalidHex(t *testing.T) {
	_, err := ParseClaim("not-hex")
	if err == nil {
		t.Fatal("expected error for invalid hex")
	}
}

func TestParseClaimTooShort(t *testing.T) {
	// Empty protobuf message body — valid encoding but no claim fields.
	// Should parse but produce empty/default ParsedClaim.
	parsed, err := ParseClaim("00")
	if err != nil {
		t.Fatalf("ParseClaim(\"00\"): %v", err)
	}
	if parsed.HasSignature {
		t.Error("expected no signature for version 0")
	}
}

func TestCreateRepostClaim(t *testing.T) {
	claimID := "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
	r, err := CreateRepostClaim("Repost Title", claimID)
	if err != nil {
		t.Fatalf("CreateRepostClaim: %v", err)
	}
	if r.ValueHex == "" {
		t.Fatal("empty valueHex")
	}
}

func TestCreateCollectionClaim(t *testing.T) {
	ids := []string{
		"a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
		"b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3",
	}
	r, err := CreateCollectionClaim("Collection Title", ids)
	if err != nil {
		t.Fatalf("CreateCollectionClaim: %v", err)
	}
	if r.ValueHex == "" {
		t.Fatal("empty valueHex")
	}
}
