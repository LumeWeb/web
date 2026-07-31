package exports

import (
	"encoding/json"
	"fmt"
	"strconv"
)

// Amount wraps int64 to JSON-serialize as a string, avoiding
// JavaScript Number precision loss above 2^53.
//
// All monetary values (sats) crossing the WASM boundary use this type.
// JS callers must parse strings with BigInt() or Number() as needed.
type Amount int64

// MarshalJSON serializes Amount as a JSON string (e.g., "100000000").
func (a Amount) MarshalJSON() ([]byte, error) {
	return json.Marshal(strconv.FormatInt(int64(a), 10))
}

// UnmarshalJSON accepts both string ("100000000") and number (100000000).
func (a *Amount) UnmarshalJSON(data []byte) error {
	// Try string first
	var s string
	if err := json.Unmarshal(data, &s); err == nil {
		v, err := strconv.ParseInt(s, 10, 64)
		if err != nil {
			return fmt.Errorf("Amount string parse: %w", err)
		}
		*a = Amount(v)
		return nil
	}

	// Fallback: number (for backwards compat)
	var n int64
	if err := json.Unmarshal(data, &n); err != nil {
		return fmt.Errorf("Amount must be string or number: %w", err)
	}
	*a = Amount(n)
	return nil
}

// Int64 returns the underlying int64 value.
func (a Amount) Int64() int64 {
	return int64(a)
}

// String returns the decimal string representation.
func (a Amount) String() string {
	return strconv.FormatInt(int64(a), 10)
}
