import type { INode, NodeData } from '@/types';
import type { MaybeRefOrGetter } from 'vue';
import { ref, shallowRef, toValue, watchEffect } from 'vue';

export function useData<T extends INode>(data: MaybeRefOrGetter<T[]>) {
  const nodesData = shallowRef<Map<string, NodeData<T>>>(new Map());
  const rootId = ref<string>();

  watchEffect(() => {
    if (!toValue(data).length) return;
    [nodesData.value, rootId.value] = getNodesDataAndRootId(toValue(data));
  });

  return {
    nodesData,
    rootId,
  };
}

function getNodesDataAndRootId<T extends INode>(
  data: T[],
): [Map<string, NodeData<T>>, string | undefined] {
  const _data: [string, NodeData<T>][] = data.map((node) => [
    node.id,
    {
      children: [],
      data: node,
    },
  ]);

  const nodesData = new Map(_data);
  let rootId;

  for (const [id, nodeData] of nodesData) {
    const parentId = nodeData.data.parentId;
    if (!parentId) {
      if (rootId) console.warn('Multiple root nodes found');
      rootId = id;
      continue;
    }

    const parentNodeData = nodesData.get(parentId);
    parentNodeData?.children.push(id);
  }

  return [nodesData, rootId];
}
