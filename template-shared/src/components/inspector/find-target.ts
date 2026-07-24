/**
 * Every shadcn primitive already renders `data-slot="<part>"` on its meaningful DOM nodes (e.g.
 * `data-slot="button"`, `data-slot="dialog-content"`) — riding on that instead of inventing a
 * parallel labeling scheme means the inspector works on every component with zero source changes.
 */
export function findInspectableTarget(el: Element): Element {
  return el.closest('[data-slot]') ?? el
}

export function isInsideInspectorUi(el: Element): boolean {
  return el.closest('[data-inspector-ui]') !== null
}
