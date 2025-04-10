<script setup lang="ts" generic="T extends INode">
import type { Ref, VNode } from 'vue';
import type { INode, NodeData, NodeSlotParams, NodeState } from '../types';

const { nodeId, nodesData, getState, setState } = defineProps<{
  nodeId: string;
  nodesData: Map<string, NodeData<T>>;
  getState: (id: string) => Ref<NodeState> | undefined;
  setState: (id: string, state: Partial<NodeState>) => void;
}>();

defineSlots<{
  topBorder: () => VNode[];
  node: (params: NodeSlotParams<T>) => VNode[];
}>();

const nodeData = nodesData.get(nodeId)!;

const { children, data } = nodeData;

const state = getState(nodeId)!;

// toggle visibility of children
const toggleChildren = () => {
  setState(nodeId, { childrenExpanded: !state.value.childrenExpanded });
};
</script>

<template>
  <div class="vue3-org-chart-node">
    <slot name="topBorder"></slot>
    <div
      ref="element"
      class="vue3-org-chart-node-element">
      <div
        v-if="data.parentId"
        class="vue3-org-chart-node-element-top-line"></div>
      <div tabindex="0">
        <!-- prettier-ignore-attribute -->
        <slot
          name="node"
          :item="(data as T)"
          :children="children"
          :children-expanded="state.childrenExpanded"
          :toggle-children="toggleChildren">
        </slot>
      </div>
      <div
        v-if="children.length && state.childrenExpanded"
        class="vue3-org-chart-node-element-bottom-line"></div>
    </div>

    <Transition name="nodeTransition">
      <div
        v-if="children.length && state.childrenExpanded"
        class="vue3-org-chart-node-container">
        <Node
          v-for="(id, index) in children"
          :key="id"
          :node-id="id"
          :nodes-data="nodesData"
          :get-state="getState"
          :set-state="setState">
          <template #topBorder>
            <div
              class="vue3-org-chart-node-element-horizontal-line"
              :class="{
                left: index !== 0,
                right: index !== children.length - 1,
              }"></div>
          </template>
          <template #node="params">
            <slot
              name="node"
              v-bind="params">
            </slot>
          </template>
        </Node>
      </div>
    </Transition>
  </div>
</template>
