package exports

import (
	"encoding/hex"
	"fmt"

	"github.com/lbryio/lbcd/btcec"
	"go.lumeweb.com/liblbry/claim"
)

// ChannelClaimResult holds the compiled claim value.
type ChannelClaimResult struct {
	ValueHex string `json:"valueHex"`
}

// CreateChannelClaim creates a channel claim value.
func CreateChannelClaim(title, publicKeyHex string) (*ChannelClaimResult, error) {
	pubKey, err := hex.DecodeString(publicKeyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid publicKey hex: %w", err)
	}
	helper, err := claim.NewChannel(title, pubKey)
	if err != nil {
		return nil, err
	}
	value, err := helper.CompileValue()
	if err != nil {
		return nil, err
	}
	return &ChannelClaimResult{ValueHex: hex.EncodeToString(value)}, nil
}

// StreamClaimResult holds the compiled stream claim value.
type StreamClaimResult struct {
	ValueHex string `json:"valueHex"`
}

// CreateStreamClaim creates a stream claim value.
func CreateStreamClaim(title, description, sdHash, mediaType, channelClaimIDHex string) (*StreamClaimResult, error) {
	var channelClaimID []byte
	if channelClaimIDHex != "" {
		var err error
		channelClaimID, err = hex.DecodeString(channelClaimIDHex)
		if err != nil {
			return nil, fmt.Errorf("invalid channelClaimID hex: %w", err)
		}
	}
	helper, err := claim.NewStream(title, description, sdHash, mediaType, channelClaimID)
	if err != nil {
		return nil, err
	}
	value, err := helper.CompileValue()
	if err != nil {
		return nil, err
	}
	return &StreamClaimResult{ValueHex: hex.EncodeToString(value)}, nil
}

// CollectionClaimResult holds the compiled collection claim value.
type CollectionClaimResult struct {
	ValueHex string `json:"valueHex"`
}

// CreateCollectionClaim creates a collection claim value.
func CreateCollectionClaim(title string, claimIDHexes []string) (*CollectionClaimResult, error) {
	helper, err := claim.NewCollection(title, claimIDHexes)
	if err != nil {
		return nil, err
	}
	value, err := helper.CompileValue()
	if err != nil {
		return nil, err
	}
	return &CollectionClaimResult{ValueHex: hex.EncodeToString(value)}, nil
}

// RepostClaimResult holds the compiled repost claim value.
type RepostClaimResult struct {
	ValueHex string `json:"valueHex"`
}

// CreateRepostClaim creates a repost claim value.
func CreateRepostClaim(title, claimIDHex string) (*RepostClaimResult, error) {
	helper, err := claim.NewRepost(title, claimIDHex)
	if err != nil {
		return nil, err
	}
	value, err := helper.CompileValue()
	if err != nil {
		return nil, err
	}
	return &RepostClaimResult{ValueHex: hex.EncodeToString(value)}, nil
}

// SignStreamResult holds the signed claim value.
type SignStreamResult struct {
	ValueHex string `json:"valueHex"`
}

// SignStreamClaim signs a stream claim value with a channel private key.
func SignStreamClaim(valueHex, firstInputTxID, channelClaimIDHex string, privKey *btcec.PrivateKey) (*SignStreamResult, error) {
	valueBytes, err := hex.DecodeString(valueHex)
	if err != nil {
		return nil, fmt.Errorf("invalid valueHex: %w", err)
	}
	helper, err := claim.ParseClaimValue(valueBytes)
	if err != nil {
		return nil, err
	}

	channelClaimID, err := hex.DecodeString(channelClaimIDHex)
	if err != nil {
		return nil, fmt.Errorf("invalid channelClaimID hex: %w", err)
	}

	if err := claim.SignStream(helper, privKey, firstInputTxID, channelClaimID); err != nil {
		return nil, err
	}

	signedValue, err := helper.CompileValue()
	if err != nil {
		return nil, err
	}
	return &SignStreamResult{ValueHex: hex.EncodeToString(signedValue)}, nil
}

// ParsedClaim holds the parsed fields from a claim value.
type ParsedClaim struct {
	Version      int    `json:"version"`
	HasSignature bool   `json:"hasSignature"`
	ClaimType    string `json:"claimType"`
	Title        string `json:"title"`
	PublicKeyHex string `json:"publicKeyHex,omitempty"`
	MediaType    string `json:"mediaType,omitempty"`
	SdHashHex   string `json:"sdHashHex,omitempty"`
	ClaimIDHex  string `json:"claimIDHex,omitempty"`
	SignatureHex string `json:"signatureHex,omitempty"`
}

// ParseClaimValue parses a claim value hex and returns its fields.
func ParseClaim(valueHex string) (*ParsedClaim, error) {
	valueBytes, err := hex.DecodeString(valueHex)
	if err != nil {
		return nil, fmt.Errorf("invalid valueHex: %w", err)
	}
	helper, err := claim.ParseClaimValue(valueBytes)
	if err != nil {
		return nil, err
	}

	p := &ParsedClaim{
		Version:     int(helper.Version),
		HasSignature: helper.Version == claim.WithSig,
	}

	if helper.Claim != nil {
		p.Title = helper.Claim.Title
		if helper.Claim.GetChannel() != nil {
			p.ClaimType = "channel"
			if helper.Claim.GetChannel().PublicKey != nil {
				p.PublicKeyHex = hex.EncodeToString(helper.Claim.GetChannel().PublicKey)
			}
		}
		if helper.Claim.GetStream() != nil {
			p.ClaimType = "stream"
			if helper.Claim.GetStream().Source != nil {
				p.MediaType = helper.Claim.GetStream().Source.MediaType
				if helper.Claim.GetStream().Source.SdHash != nil {
					p.SdHashHex = hex.EncodeToString(helper.Claim.GetStream().Source.SdHash)
				}
			}
		}
		if helper.Claim.GetCollection() != nil {
			p.ClaimType = "collection"
		}
		if helper.Claim.GetRepost() != nil {
			p.ClaimType = "repost"
		}
	}

	if helper.Version == claim.WithSig {
		p.ClaimIDHex = hex.EncodeToString(helper.ClaimID)
		p.SignatureHex = hex.EncodeToString(helper.Signature)
	}

	return p, nil
}

// CompileClaimValue parses and re-compiles a claim value (round-trip validation).
func CompileClaimValue(valueHex string) (string, error) {
	valueBytes, err := hex.DecodeString(valueHex)
	if err != nil {
		return "", fmt.Errorf("invalid valueHex: %w", err)
	}
	helper, err := claim.ParseClaimValue(valueBytes)
	if err != nil {
		return "", err
	}
	recompiled, err := helper.CompileValue()
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(recompiled), nil
}
