export class DependencyGraph<T extends string | number | symbol> {
  #nodes = new Set<T>();
  #dependencies = new Map<T, Set<T>>();
  #reverseLookup = new Map<T, Set<T>>();

  addNode(node: T): void {
    if (!this.#nodes.has(node)) {
      this.#nodes.add(node);
      this.#dependencies.set(node, new Set());
      this.#reverseLookup.set(node, new Set());
    }
  }

  addDependency(from: T, to: T): void {
    this.addNode(from);
    this.addNode(to);
    
    this.#dependencies.get(from)!.add(to);
    this.#reverseLookup.get(to)!.add(from);
  }

  getDependencies(node: T): Set<T> {
    return new Set(this.#dependencies.get(node));
  }

  getDependents(node: T): Set<T> {
    return new Set(this.#reverseLookup.get(node));
  }

  topologicalSort(): T[] {
    const visited = new Set<T>();
    const sorted: T[] = [];
    const temp = new Set<T>();

    const visit = (node: T) => {
      if (temp.has(node)) {
        throw new Error(`Circular dependency detected involving ${String(node)}`);
      }
      
      if (!visited.has(node)) {
        temp.add(node);
        
        for (const dep of this.#dependencies.get(node)!) {
          visit(dep);
        }

        temp.delete(node);
        visited.add(node);
        sorted.push(node);
      }
    };

    // Start with nodes that have no dependents
    const rootNodes = Array.from(this.#nodes).filter(
      node => this.#reverseLookup.get(node)!.size === 0
    );
    
    for (const node of rootNodes) {
      visit(node);
    }

    // Then process remaining nodes
    for (const node of this.#nodes) {
      visit(node);
    }

    return sorted;
  }
}
