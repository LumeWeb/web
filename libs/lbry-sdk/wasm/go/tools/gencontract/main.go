// Code generator: uses coder/guts for struct→TS conversion + a thin function
// registration table to generate:
//   1. types.generated.ts — TypeScript interfaces from Go struct json tags
//   2. contract.generated.json — runtime contract for mock validation
//
// Usage:
//   go run ./tools/gencontract \
//     -exports ./exports \
//     -outdir ../../src/wasm
package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"

	guts "github.com/coder/guts"
	"github.com/coder/guts/config"
)

// ── Contract types ──

type Contract struct {
	Generated  string              `json:"generated"`
	Entries    []ContractEntry     `json:"entries"`
	FieldRules map[string][]string `json:"fieldRules,omitempty"`
}

type ContractEntry struct {
	FuncName   string          `json:"funcName"`
	GoType     string          `json:"goType"`
	Fields     []FieldContract `json:"fields"`
	NotFields  []string        `json:"notFields,omitempty"`
	Category   string          `json:"category"`
	IsProperty bool            `json:"isProperty"`
}

type FieldContract struct {
	Name     string `json:"name"`
	Type     string `json:"tsType"`
	Optional bool   `json:"optional,omitempty"`
}

// ── SDK function registration table ──
// Maps JS function names → Go result struct types + params + category.
// This is the manually-declared source of truth for which Go struct backs
// each JS function. When a new function is added to main.go's sdk.Set calls,
// add it here.

var funcNameToGoType = map[string]string{
	"makeSeed":              "MakeSeedResult",
	"walletFromMnemonic":    "WalletResult",
	"walletFromSeed":        "WalletResult",
	"walletPublicKeyHex":    "PublicKeyResult",
	"walletPrivateKeyHex":   "PrivateKeyResult",
	"walletPubKeyScriptAt":  "ScriptResult",
	"walletAddress":         "AddressResult",
	"walletAddressAt":       "AddressResult",
	"walletMnemonic":        "MnemonicResult",
	"buildTx":              "BuildTxResult",
	"estimateTxSize":       "TxSizeResult",
	"estimateFee":          "FeeResult",
	"walletClose":          "CloseResult",
	"claimIDFromTxVout":    "ClaimIDResult",
	"createChannelClaim":   "ChannelClaimResult",
	"createStreamClaim":    "StreamClaimResult",
	"createCollectionClaim": "CollectionClaimResult",
	"createRepostClaim":    "RepostClaimResult",
	"signStreamClaim":      "SignStreamResult",
	"parseClaimValue":      "ParsedClaim",
	"compileClaimValue":    "ValueHexResult",
	"selectCoins":          "SelectCoinsResult",
}

// funcParams maps each JS function name to its parameter list.
// Parameter names ending with "?" are optional.
var funcParams = map[string][]JSParam{
	"makeSeed":              {},
	"walletFromMnemonic":    {{"mnemonic", "string"}},
	"walletFromSeed":        {{"seed", "string"}},
	"walletPublicKeyHex":    {{"handle", "number"}},
	"walletPrivateKeyHex":   {{"handle", "number"}},
	"walletPubKeyScriptAt": {{"handle", "number"}, {"chain", "number"}, {"index", "number"}},
	"walletAddress":         {{"handle", "number"}},
	"walletAddressAt":       {{"handle", "number"}, {"chain", "number"}, {"index", "number"}},
	"walletMnemonic":        {{"handle", "number"}},
	"buildTx":              {{"handle", "number"}, {"inputs", "string"}, {"outputs", "string"}},
	"estimateTxSize":       {{"inputCount", "number"}, {"outputCount", "number"}},
	"estimateFee":          {{"size", "number"}, {"feePerByte", "string"}},
	"walletClose":          {{"handle", "number"}},
	"claimIDFromTxVout":    {{"txid", "string"}, {"vout", "number"}},
	"createChannelClaim":   {{"title", "string"}, {"publicKeyHex", "string"}},
	"createStreamClaim":    {{"title", "string"}, {"description", "string"}, {"sdHash", "string"}, {"mediaType", "string"}, {"channelClaimID?", "string"}},
	"createCollectionClaim": {{"title", "string"}, {"claimIDs", "string[]"}},
	"createRepostClaim":    {{"title", "string"}, {"claimID", "string"}},
	"signStreamClaim":      {{"handle", "number"}, {"valueHex", "string"}, {"firstInputTxID", "string"}, {"channelClaimIDHex", "string"}, {"channelChain", "number"}, {"channelIndex", "number"}},
	"parseClaimValue":      {{"claimHex", "string"}},
	"compileClaimValue":    {{"claimHex", "string"}},
	"selectCoins":          {{"utxos", "string"}, {"target", "string"}, {"feePerByte", "string"}, {"costOfChange?", "string"}},
}

// knownBadFields lists field names that must NOT appear in a function's return.
// Catches drift from old naming conventions (e.g. txHex → txhex).
var knownBadFields = map[string][]string{
	"buildTx":            {"txHex"},
	"signStreamClaim":    {"signedValueHex"},
	"parseClaimValue":    {"parsed"},
	"selectCoins":        {"fee"},
	"createChannelClaim": {"claimID"},
	"createStreamClaim":  {"claimID"},
}

// JSParam describes one input parameter.
type JSParam struct {
	Name string
	Type string
}

// internalTypes are Go types in the exports package that should not be
// converted to TS interfaces (internal implementation details).
var internalTypes = []string{
	".JSFunc",
	".JSParam",
	".WalletManager",
	".TxBuilder",
	".CompileClaimValueResult",
	".TxInput",
	".TxOutput",
	".UTXOInput",
	".SelectCoinsInput",
}

func categoryFor(funcName string) string {
	switch {
	case strings.HasPrefix(funcName, "wallet"), funcName == "makeSeed":
		return "wallet"
	case strings.HasPrefix(funcName, "build") || strings.HasPrefix(funcName, "estimate") || strings.HasPrefix(funcName, "claimID"):
		return "tx"
	case strings.HasPrefix(funcName, "create") || strings.HasPrefix(funcName, "sign") || strings.HasPrefix(funcName, "parse") || strings.HasPrefix(funcName, "compile"):
		return "claim"
	case strings.HasPrefix(funcName, "select"):
		return "coinselect"
	case funcName == "ready":
		return "meta"
	default:
		return "other"
	}
}

func main() {
	var exportsDir, outDir string
	flag.StringVar(&exportsDir, "exports", "", "path to exports/ directory")
	flag.StringVar(&outDir, "outdir", ".", "output directory")
	flag.Parse()

	if exportsDir == "" {
		fmt.Fprintln(os.Stderr, "usage: gencontract -exports <dir> -outdir <dir>")
		os.Exit(1)
	}

	// 1. Extract struct field contracts from exports/ Go files using AST
	structFields := parseExportsStructs(exportsDir)

	// 2. Build contract entries from the function registration table
	entries := buildEntries(structFields)

	// 3. Apply negative field rules
	for i := range entries {
		if bad, ok := knownBadFields[entries[i].FuncName]; ok {
			entries[i].NotFields = bad
		}
	}

	// 4. Compute field rules (which functions use each field name)
	fieldRules := computeFieldRules(entries)

	// 5. Write contract.generated.json
	contract := Contract{
		Generated:  "generated by tools/gencontract — DO NOT EDIT",
		Entries:    entries,
		FieldRules: fieldRules,
	}
	jsonPath := filepath.Join(outDir, "contract.generated.json")
	jsonBytes, err := json.MarshalIndent(contract, "", "  ")
	if err != nil {
		fatal("marshal contract: %v", err)
	}
	mustWriteFile(jsonPath, append(jsonBytes, '\n'))
	fmt.Printf("wrote %s (%d entries)\n", jsonPath, len(entries))

	// 6. Generate types.generated.ts using guts for struct→TS conversion
	ts := generateTSWithGuts(exportsDir, entries)
	tsPath := filepath.Join(outDir, "types.generated.ts")
	mustWriteFile(tsPath, []byte(ts))
	fmt.Printf("wrote %s\n", tsPath)
}

// parseExportsStructs reads all .go files in exports/ and extracts struct
// field names + types + json tags. Structs without json tags are skipped
// (they're internal types).
func parseExportsStructs(exportsDir string) map[string][]FieldContract {
	result := make(map[string][]FieldContract)

	files, err := filepath.Glob(filepath.Join(exportsDir, "*.go"))
	if err != nil {
		fatal("glob %s: %v", exportsDir, err)
	}

	for _, file := range files {
		if strings.HasSuffix(file, "_test.go") {
			continue
		}

		fset := token.NewFileSet()
		f, err := parser.ParseFile(fset, file, nil, parser.ParseComments)
		if err != nil {
			fatal("parse %s: %v", file, err)
		}

		ast.Inspect(f, func(n ast.Node) bool {
			typeSpec, ok := n.(*ast.TypeSpec)
			if !ok {
				return true
			}

			structType, ok := typeSpec.Type.(*ast.StructType)
			if !ok {
				return true
			}

			structName := typeSpec.Name.Name
			var fields []FieldContract

			for _, field := range structType.Fields.List {
				if len(field.Names) == 0 {
					continue // embedded field
				}

				for range field.Names {
					goType := exprString(field.Type)
					jsonTag := extractJSONTag(field.Tag)
					if jsonTag == "" {
						continue // skip fields without json tags
					}

					optional := false
					if parts := strings.SplitN(jsonTag, ",", 2); len(parts) == 2 && parts[1] == "omitempty" {
						optional = true
						jsonTag = parts[0]
					} else {
						jsonTag = parts[0]
					}

					fields = append(fields, FieldContract{
						Name:     jsonTag,
						Type:     goTypeToTS(goType),
						Optional: optional,
					})
				}
			}

			if len(fields) > 0 {
				result[structName] = fields
			}

			return true
		})
	}

	return result
}

// extractJSONTag extracts the json tag value from a struct field tag.
func extractJSONTag(tag *ast.BasicLit) string {
	if tag == nil {
		return ""
	}
	value := strings.Trim(tag.Value, "`")
	return reflect.StructTag(value).Get("json")
}

// exprString converts an AST type expression to a string.
func exprString(expr ast.Expr) string {
	switch t := expr.(type) {
	case *ast.Ident:
		return t.Name
	case *ast.StarExpr:
		return "*" + exprString(t.X)
	case *ast.ArrayType:
		if t.Len == nil {
			return "[]" + exprString(t.Elt)
		}
		return fmt.Sprintf("[%s]%s", exprString(t.Len), exprString(t.Elt))
	case *ast.SelectorExpr:
		return exprString(t.X) + "." + t.Sel.Name
	case *ast.MapType:
		return "map[" + exprString(t.Key) + "]" + exprString(t.Value)
	case *ast.InterfaceType:
		return "any"
	}
	return "unknown"
}

// goTypeToTS converts a Go type string to a TypeScript type string.
func goTypeToTS(goType string) string {
	switch goType {
	case "string":
		return "string"
	case "int", "int32", "uint32":
		return "number"
	case "int64", "uint64":
		return "number" // POTENTIAL PRECISION LOSS — use Amount type for monetary values
	case "exports.Amount", "Amount":
		return "string" // int64 serialized as string to preserve precision
	case "bool":
		return "boolean"
	case "[]byte":
		return "string" // hex-encoded
	case "[]string":
		return "string[]"
	case "[]any", "[]interface{}":
		return "unknown[]"
	}
	if strings.HasPrefix(goType, "[]") {
		elem := goType[2:]
		tsType := goTypeToTS(elem)
		if tsType == "unknown" {
			return "unknown[]" // guts will define the interface
		}
		return tsType + "[]"
	}
	return goType // named struct type — guts will define the interface
}

// buildEntries creates contract entries from the function registration table.
func buildEntries(structFields map[string][]FieldContract) []ContractEntry {
	var funcNames []string
	for name := range funcNameToGoType {
		funcNames = append(funcNames, name)
	}
	sort.Strings(funcNames)

	var entries []ContractEntry
	for _, name := range funcNames {
		goType := funcNameToGoType[name]
		fields := structFields[goType]
		if fields == nil {
			fatal("struct %s not found (referenced by %s) — check json tags in exports/", goType, name)
		}

		entries = append(entries, ContractEntry{
			FuncName: name,
			GoType:   goType,
			Fields:   fields,
			Category: categoryFor(name),
		})
	}

	// Add ready property
	entries = append(entries, ContractEntry{
		FuncName:   "ready",
		Category:   "meta",
		IsProperty: true,
		Fields:     []FieldContract{},
	})

	return entries
}

func computeFieldRules(entries []ContractEntry) map[string][]string {
	rules := make(map[string][]string)
	for _, e := range entries {
		for _, f := range e.Fields {
			rules[f.Name] = append(rules[f.Name], e.FuncName)
		}
	}
	return rules
}

// ── TypeScript generation ──

func generateTSWithGuts(exportsDir string, entries []ContractEntry) string {
	var sb strings.Builder

	sb.WriteString("// Code generated by tools/gencontract — DO NOT EDIT.\n")
	sb.WriteString("// Source: wasm/go/exports/*.go struct json tags\n")
	sb.WriteString("// Regenerate: pnpm --filter @lumeweb/lbry-sdk generate\n\n")

	// Emit WasmResult union type — all WASM functions can return { error: string }
	sb.WriteString("/**\n")
	sb.WriteString(" * Generic WASM function result.\n")
	sb.WriteString(" * All WASM functions return either a success object or { error: string }.\n")
	sb.WriteString(" */\n")
	sb.WriteString("export type WasmResult<T = Record<string, unknown>> = T | { error: string };\n\n")

	// Use guts to generate struct interfaces
	sb.WriteString(generateGutsTS(exportsDir))

	// Generate namespace interfaces with function signatures
	sb.WriteString("\n// ── WASM Function Exports ──\n\n")
	categories := groupByCategory(entries)
	catNames := sortedKeys(categories)

	for _, cat := range catNames {
		vals := categories[cat]
		sb.WriteString(fmt.Sprintf("/** %s namespace */\n", cat))
		sb.WriteString(fmt.Sprintf("export interface Wasm%sExports {\n", title(cat)))
		for _, e := range vals {
			if e.IsProperty {
				sb.WriteString(fmt.Sprintf("  %s: boolean;\n", e.FuncName))
				continue
			}
			params := funcParams[e.FuncName]
			paramParts := make([]string, len(params))
			for i, p := range params {
				paramParts[i] = fmt.Sprintf("%s: %s", p.Name, p.Type)
			}
			fieldParts := make([]string, len(e.Fields))
			for i, f := range e.Fields {
				optional := ""
				if f.Optional {
					optional = "?"
				}
				fieldParts[i] = fmt.Sprintf("%s%s: %s", f.Name, optional, f.Type)
			}
			sb.WriteString(fmt.Sprintf("  %s(%s): WasmResult<{ %s }>;\n", e.FuncName, strings.Join(paramParts, ", "), strings.Join(fieldParts, "; ")))
		}
		sb.WriteString("}\n\n")
	}

	// Generate full WasmExports interface
	sb.WriteString("/** Full shape of the Go-WASM module exported to JS. */\n")
	sb.WriteString("export interface WasmExports {\n")
	for _, cat := range catNames {
		for _, e := range categories[cat] {
			if e.IsProperty {
				sb.WriteString(fmt.Sprintf("  %s: boolean;\n", e.FuncName))
			} else {
				sb.WriteString(fmt.Sprintf("  %s: Wasm%sExports[\"%s\"];\n", e.FuncName, title(cat), e.FuncName))
			}
		}
	}
	sb.WriteString("}\n")

	return sb.String()
}

// generateGutsTS uses coder/guts to convert Go structs to TypeScript interfaces.
// Falls back to AST-based generation if guts can't resolve the module.
func generateGutsTS(exportsDir string) string {
	absPath, err := filepath.Abs(exportsDir)
	if err != nil {
		fatal("resolve exports path: %v", err)
	}

	exportsModule := "go.lumeweb.com/lbry-sdk/wasm/exports"

	g, err := guts.NewGolangParser()
	if err != nil {
		return generateTSFallback(absPath, "// ── Result Types ──\n\n")
	}

	if err := g.IncludeGenerate(exportsModule); err != nil {
		return generateTSFallback(absPath, "// ── Result Types (guts unavailable, using AST) ──\n\n")
	}

	// Exclude internal types
	for _, t := range internalTypes {
		_ = g.ExcludeCustom(exportsModule + t)
	}

	_ = g.IncludeCustom(map[string]string{
		"encoding/json.RawMessage": "string",
	})
	g.IncludeCustomDeclaration(config.StandardMappings())

	ts, err := g.ToTypescript()
	if err != nil {
		return generateTSFallback(absPath, "// ── Result Types (guts unavailable, using AST) ──\n\n")
	}

	ts.ApplyMutations(config.ExportTypes)

	output, err := ts.Serialize()
	// guts returns its header even when the body is empty
	if err != nil || strings.TrimSpace(strings.TrimPrefix(output, "// Code generated by 'guts'. DO NOT EDIT.")) == "" {
		return generateTSFallback(absPath, "// ── Result Types (guts unavailable, using AST) ──\n\n")
	}

	return output + "\n"
}

// generateTSFallback generates TS interfaces using pure Go AST (no guts).
func generateTSFallback(exportsDir string, header string) string {
	structFields := parseExportsStructs(exportsDir)

	var sb strings.Builder
	sb.WriteString(header)

	names := make([]string, 0, len(structFields))
	for name := range structFields {
		names = append(names, name)
	}
	sort.Strings(names)

	for _, name := range names {
		fields := structFields[name]
		sb.WriteString(fmt.Sprintf("export interface %s {\n", name))
		for _, f := range fields {
			optional := ""
			if f.Optional {
				optional = "?"
			}
			sb.WriteString(fmt.Sprintf("  %s%s: %s;\n", f.Name, optional, f.Type))
		}
		sb.WriteString("}\n\n")
	}

	return sb.String()
}

// ── Helpers ──

func groupByCategory(entries []ContractEntry) map[string][]ContractEntry {
	categories := map[string][]ContractEntry{}
	for _, e := range entries {
		categories[e.Category] = append(categories[e.Category], e)
	}
	return categories
}

func sortedKeys(m map[string][]ContractEntry) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	sort.Strings(keys)
	return keys
}

func title(s string) string {
	if len(s) == 0 {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

func fatal(format string, args ...any) {
	fmt.Fprintf(os.Stderr, "error: "+format+"\n", args...)
	os.Exit(1)
}

func mustWriteFile(path string, data []byte) {
	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		fatal("mkdir %s: %v", filepath.Dir(path), err)
	}
	if err := os.WriteFile(path, data, 0644); err != nil {
		fatal("write %s: %v", path, err)
	}
}
