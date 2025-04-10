import type { INode, NodeState } from '@/types';
import type { MaybeRefOrGetter, Ref } from 'vue';
import { ref, shallowRef, toValue, watchEffect } from 'vue';

export function useState<T extends INode>(data: MaybeRefOrGetter<T[]>) {
  const states = shallowRef<Map<string, Ref<NodeState>>>(new Map());

  function getState(id: string) {
    return states.value.get(id);
  }

  function setState(id: string, state: Partial<NodeState>) {
    const nodeState = getState(id);
    if (!nodeState) return;
    nodeState.value = {
      ...nodeState.value,
      ...state,
    };
  }

  function expandAll() {
    states.value.forEach((state) => {
      state.value.childrenExpanded = true;
    });
  }

  function collapseAll() {
    states.value.forEach((state) => {
      state.value.childrenExpanded = false;
    });
  }

  watchEffect(() => {
    if (!toValue(data).length) return;
    states.value = getStates(toValue(data));
  });

  return {
    getState,
    setState,
    expandAll,
    collapseAll,
  };
}

function getStates<T extends INode>(data: T[]) {
  return new Map<string, Ref<NodeState>>(
    data.map((node) => [
      node.id,
      ref({ childrenExpanded: node.parentId ? false : true }),
    ]),
  );
}
