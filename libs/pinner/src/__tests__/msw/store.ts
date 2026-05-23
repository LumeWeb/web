/**
 * Generic Map-based store with CRUD operations.
 * Used as the foundation for all stateful test handler stores.
 */
export class MapStore<K, V> {
  private map = new Map<K, V>();
  private initialEntries: Array<readonly [K, V]> = [];

  constructor(initialEntries: Array<readonly [K, V]> = []) {
    this.initialEntries = [...initialEntries];
    for (const [key, value] of this.initialEntries) {
      this.map.set(key, value);
    }
  }

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  set(key: K, value: V): this {
    this.map.set(key, value);
    return this;
  }

  delete(key: K): boolean {
    return this.map.delete(key);
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  list(): V[] {
    return Array.from(this.map.values());
  }

  entries(): Array<readonly [K, V]> {
    return Array.from(this.map.entries());
  }

  size(): number {
    return this.map.size;
  }

  clear(): void {
    this.map.clear();
  }

  /** Reset to initial state (re-populate with initial entries) */
  reset(): void {
    this.map.clear();
    for (const [key, value] of this.initialEntries) {
      this.map.set(key, value);
    }
  }

  /** Update an existing entry by key, applying an update function */
  update(key: K, updater: (current: V) => V): boolean {
    const current = this.map.get(key);
    if (current === undefined) return false;
    this.map.set(key, updater(current));
    return true;
  }
}
