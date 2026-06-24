declare const __namespaceBrand: unique symbol;
declare const __namespacedIdBrand: unique symbol;

/** A validated namespace string (e.g. "core", "ipfs", "acme") */
export type Namespace = string & { readonly [__namespaceBrand]: true };

/** A validated namespaced ID (e.g. "core:dashboard") */
export type NamespacedId = string & { readonly [__namespacedIdBrand]: true };
