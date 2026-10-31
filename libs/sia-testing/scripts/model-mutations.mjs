/**
 * Defines deliberate violations of the model's contract for the regression tests
 * to detect. Each named fault identifies the test file expected to reject it.
 *
 * Compiler nodes keep these controls independent of source formatting. Matching
 * is limited to a named method or helper, and a control must replace exactly one
 * node; a missing or ambiguous target means the control needs attention.
 *
 * This module returns transformed TypeScript source. It does not write files or
 * run tests, so callers can apply independent faults to the same original source.
 */
import ts from "typescript";

const f = ts.factory;
const modelTest = (name) => `tests/model/${name}.test.ts`;
/**
 * Receiver names distinguish lookups such as objects.get from slabs.get; the
 * method name alone would allow a control to target the wrong model rule.
 * @param {ts.Node} node
 * @param {string} owner
 * @param {string} name
 */
const property = (node, owner, name) =>
  ts.isPropertyAccessExpression(node) &&
  ts.isIdentifier(node.expression) &&
  node.expression.text === owner &&
  node.name.text === name;
/** @param {ts.Node} node @param {string} owner @param {string} name */
const call = (node, owner, name) =>
  ts.isCallExpression(node) && property(node.expression, owner, name);
/** @param {ts.Node} node @param {string} owner @param {string} name */
const statementCall = (node, owner, name) =>
  ts.isExpressionStatement(node) && call(node.expression, owner, name);
/**
 * Used for single-argument lookups and map callbacks so a fault changes the key
 * or callback while leaving the called method and its type arguments intact.
 * @param {ts.Node} node
 * @param {ts.Expression} argument
 */
function withArgument(node, argument) {
  const expression = /** @type {ts.CallExpression} */ (node);
  return f.updateCallExpression(
    expression,
    expression.expression,
    expression.typeArguments,
    [argument],
  );
}
/**
 * Optional string filters use an absent-or-matching predicate. Replacing that
 * predicate isolates filtering faults from how host records are copied.
 * @param {string} field
 */
const omittedFilter = (field) => /** @param {ts.Node} node */ (node) =>
  ts.isBinaryExpression(node) &&
  node.operatorToken.kind === ts.SyntaxKind.BarBarToken &&
  ts.isPrefixUnaryExpression(node.left) &&
  property(node.left.operand, "filter", field);

/**
 * These faults target rules whose regressions must remain visible to tests.
 * scope names an implementation method or helper, not an interface declaration.
 * match and replace specify its syntax change; test identifies the regression
 * test file that must reject the resulting behavior.
 * @type {{ name: string; scope: string; test: string; match: (node: ts.Node) => boolean; replace: (node: ts.Node) => ts.Node }[]}
 */
const definitions = [
  {
    match: (node) => call(node, "objects", "get"),
    name: "account scoping",
    replace: (node) =>
      withArgument(node, f.createStringLiteral("mutation-account")),
    scope: "object",
    test: modelTest("accounts"),
  },
  // Rejecting all nonempty metadata must fail tests of valid values below the cap.
  {
    match: (node) => ts.isNumericLiteral(node) && node.text === "1024",
    name: "metadata size limit",
    replace: () => f.createNumericLiteral(0),
    scope: "pinObject",
    test: modelTest("objects"),
  },
  {
    match: (node) =>
      ts.isIfStatement(node) &&
      ts.isPrefixUnaryExpression(node.expression) &&
      property(node.expression.operand, "request", "approved"),
    name: "connection approval",
    replace: () => f.createEmptyStatement(),
    scope: "registerConnection",
    test: modelTest("connections"),
  },
  // Approval is single-use; registering once must not leave a request usable for another account.
  {
    match: (node) => statementCall(node, "requests", "delete"),
    name: "connection consumption",
    replace: () => f.createEmptyStatement(),
    scope: "registerConnection",
    test: modelTest("connections"),
  },
  // Reset must discard approval state as well as accounts, or a pending signer could survive it.
  {
    match: (node) => statementCall(node, "requests", "clear"),
    name: "connection reset",
    replace: () => f.createEmptyStatement(),
    scope: "reset",
    test: "tests/http/auth.test.ts",
  },
  // A valid sharing key must not authorize another recipient; expiry checks stay active here.
  {
    match: ts.isIfStatement,
    name: "sharing recipient scope",
    replace: () => f.createEmptyStatement(),
    scope: "recipientShare",
    test: modelTest("sharing"),
  },
  // Base64 text length can exceed the byte cap even when its decoded metadata fits.
  {
    match: (node) =>
      ts.isPropertyAccessExpression(node) &&
      node.name.text === "length" &&
      ts.isCallExpression(node.expression),
    name: "decoded-byte accounting",
    replace: () =>
      f.createPropertyAccessExpression(f.createIdentifier("value"), "length"),
    scope: "decodedBase64Length",
    test: modelTest("objects"),
  },
  {
    match: omittedFilter("countryCode"),
    name: "host country filter",
    replace: () => f.createTrue(),
    scope: "hosts",
    test: modelTest("hosts"),
  },
  // false requests non-upload-ready hosts; treating it as an omitted filter loses that restriction.
  {
    match: (node) =>
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
      property(node.left, "filter", "goodForUpload") &&
      ts.isIdentifier(node.right) &&
      node.right.text === "undefined",
    name: "host upload status",
    replace: () =>
      f.createPrefixUnaryExpression(
        ts.SyntaxKind.ExclamationToken,
        f.createPropertyAccessExpression(
          f.createIdentifier("filter"),
          "goodForUpload",
        ),
      ),
    scope: "hosts",
    test: modelTest("hosts"),
  },
  {
    match: omittedFilter("publicKey"),
    name: "host public key filter",
    replace: () => f.createTrue(),
    scope: "hosts",
    test: modelTest("hosts"),
  },
  {
    match: (node) =>
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "map" &&
      node.arguments.length === 1 &&
      ts.isIdentifier(node.arguments[0]) &&
      node.arguments[0].text === "copyHost",
    name: "host record ownership",
    replace: (node) =>
      withArgument(
        node,
        f.createArrowFunction(
          undefined,
          undefined,
          [f.createParameterDeclaration(undefined, undefined, "host")],
          undefined,
          f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          f.createIdentifier("host"),
        ),
      ),
    scope: "hosts",
    test: modelTest("hosts"),
  },
  // Copying a host record is insufficient if its address array still exposes model state.
  {
    match: (node) =>
      ts.isArrayLiteralExpression(node) &&
      node.elements.length === 1 &&
      ts.isSpreadElement(node.elements[0]) &&
      property(node.elements[0].expression, "host", "addresses"),
    name: "host address ownership",
    replace: () =>
      f.createPropertyAccessExpression(f.createIdentifier("host"), "addresses"),
    scope: "copyHost",
    test: modelTest("hosts"),
  },
  {
    match: (node) =>
      ts.isExpressionStatement(node) &&
      ts.isCallExpression(node.expression) &&
      ts.isIdentifier(node.expression.expression) &&
      node.expression.expression.text === "requireAccount",
    name: "host account lookup",
    replace: () => f.createEmptyStatement(),
    scope: "hosts",
    test: modelTest("hosts"),
  },
  // Valid recipient credentials must stop working once the sharing key expires.
  {
    match: ts.isReturnStatement,
    name: "share expiry",
    replace: () => f.createReturnStatement(f.createFalse()),
    scope: "expired",
    test: modelTest("sharing"),
  },
  // Corrupting a slab lookup changes byte totals without changing object counts.
  {
    match: (node) => call(node, "slabs", "get"),
    name: "slab accounting",
    replace: (node) =>
      withArgument(
        node,
        f.createBinaryExpression(
          f.createStringLiteral("mutation-"),
          ts.SyntaxKind.PlusToken,
          f.createIdentifier("id"),
        ),
      ),
    scope: "slabBytes",
    test: modelTest("sharing"),
  },
];

export const modelMutations = definitions.map(({ name, test: testFile }) => ({
  name,
  testFile,
}));

/**
 * Returns a complete TypeScript module containing the named fault. Unknown names
 * and targets that match zero or multiple nodes throw instead of producing a
 * misleading no-op or combining faults. The input text remains unchanged.
 * @param {string} source Original model TypeScript source.
 * @param {string} name A name from modelMutations.
 * @returns {string} Source with one transformed syntax node.
 */
export function mutateModelSource(source, name) {
  const definition = definitions.find((mutation) => mutation.name === name);
  if (!definition) throw new Error(`unknown mutation: ${name}`);
  const file = ts.createSourceFile(
    "model.ts",
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  let matches = 0;
  const result = ts.transform(file, [
    (context) => {
      /** @type {ts.Visitor} */
      const mutate = (node) => {
        if (definition.match(node)) {
          matches++;
          return definition.replace(node);
        }
        return ts.visitEachChild(node, mutate, context);
      };
      // Restrict each fault to its named method or helper; similar expressions elsewhere have different contracts.
      /** @type {ts.Visitor} */
      const visit = (node) => {
        if (
          (ts.isMethodDeclaration(node) || ts.isFunctionDeclaration(node)) &&
          node.name &&
          ts.isIdentifier(node.name) &&
          node.name.text === definition.scope
        ) {
          return ts.visitEachChild(node, mutate, context);
        }
        return ts.visitEachChild(node, visit, context);
      };
      return (sourceFile) => ts.visitEachChild(sourceFile, visit, context);
    },
  ]);
  try {
    // Refactors must not silently turn a control into a no-op or change multiple sites.
    if (matches !== 1)
      throw new Error(`${name}: expected one target, found ${matches}`);
    return ts.createPrinter().printFile(result.transformed[0]);
  } finally {
    result.dispose();
  }
}
