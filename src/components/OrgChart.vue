<script setup lang="ts" generic="T extends INode">
import type { VNode } from 'vue';
import type { INode, NodeSlotParams } from '../types';
import { useData } from '../composables/use-data';
import { usePanzoom } from '../composables/use-panzoom';
import { useState } from '../composables/use-state';
import Minimap from './Minimap.vue';
import Node from './Node.vue';
import '../assets/style.css';

const { data, minimap = false } = defineProps<{
  data: T[];
  minimap?: boolean;
}>();

defineSlots<{
  node: (params: NodeSlotParams<T>) => VNode[];
  noData: () => VNode[];
}>();

const { instance, container, scene, resetZoom, zoomIn, zoomOut } = usePanzoom();

const { nodesData, rootId } = useData(() => data);

const { getState, setState, expandAll, collapseAll } = useState(() => data);

defineExpose({
  resetZoom,
  zoomIn,
  zoomOut,
  expandAll,
  collapseAll,
});
</script>

<template>
  <div class="vue3-org-chart">
    <div
      ref="container"
      class="vue3-org-chart-container">
      <div
        ref="scene"
        class="vue3-org-chart-scene">
        <Node
          v-if="rootId"
          :key="rootId"
          :node-id="rootId"
          :nodes-data="nodesData"
          :get-state="getState"
          :set-state="setState">
          <template #node="params">
            <slot
              name="node"
              v-bind="params">
            </slot>
          </template>
        </Node>
        <div v-else>
          <span>
            <slot name="noData">No data</slot>
          </span>
        </div>
      </div>
    </div>
    <Minimap
      v-if="instance && minimap"
      :instance="instance"
      :container="container"
      :scene="scene" />
  </div>
</template>
