export function findInspectableTarget(el: Element): Element {
  return el.closest('[data-slot]') ?? el
}

export function isInsideInspectorUi(el: Element): boolean {
  return el.closest('[data-inspector-ui]') !== null
}
