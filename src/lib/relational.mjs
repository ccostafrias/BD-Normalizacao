/** @typedef {{from: string[], to: string[]}} Dependency */

/**
 * Compute the least fixed point of X under F, retaining every effective step.
 * A dependency only fires when ALL of its determinant attributes are present.
 * @param {string[]} initial
 * @param {Dependency[]} dependencies
 */
export function attributeClosure(initial, dependencies) {
  const known = new Set(initial);
  /** @type {{dependency: Dependency | null, added: string[], attributes: string[]}[]} */
  const steps = [{ dependency: null, added: [...known], attributes: [...known] }];
  let changed = true;
  while (changed) {
    changed = false;
    for (const dependency of dependencies) {
      if (!dependency.from.every((attribute) => known.has(attribute))) continue;
      const added = dependency.to.filter((attribute) => !known.has(attribute));
      if (!added.length) continue;
      added.forEach((attribute) => known.add(attribute));
      steps.push({ dependency, added, attributes: [...known] });
      changed = true;
    }
  }
  return { attributes: [...known], steps };
}

/** @param {string[]} a @param {string[]} b */
export function sameSet(a, b) {
  const first = new Set(a);
  const second = new Set(b);
  return first.size === second.size && [...first].every((value) => second.has(value));
}

/** @param {string[]} selected @param {string[]} answer */
export function evaluateAnswer(selected, answer) {
  return selected.length > 0 && sameSet(selected, answer);
}

/** @param {string[]} selected @param {string[]} attributes @param {Dependency[]} dependencies @returns {"incomplete" | "candidate" | "superkey"} */
export function keyStatus(selected, attributes, dependencies) {
  const closure = attributeClosure(selected, dependencies).attributes;
  if (!attributes.every((a) => closure.includes(a))) return 'incomplete';
  const isMinimal = selected.every((attribute) => {
    const smaller = attributeClosure(selected.filter((a) => a !== attribute), dependencies).attributes;
    return !attributes.every((a) => smaller.includes(a));
  });
  return isMinimal ? 'candidate' : 'superkey';
}
