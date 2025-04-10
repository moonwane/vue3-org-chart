<template>
  <div
    class="wrapper"
    style="--vue3-org-chart-line-color: pink">
    <button @click="orgChartRef?.resetZoom">Reset Zoom</button>
    <button @click="orgChartRef?.zoomIn">Zoom In</button>
    <button @click="orgChartRef?.zoomOut">Zoom Out</button>
    <button @click="orgChartRef?.expandAll">Expand All</button>
    <button @click="orgChartRef?.collapseAll">Collapse All</button>
    <button @click="minimap = !minimap">Toggle Minimap</button>

    <div
      style="
        border: 1px solid #e8e8e8;
        background: white;
        border-radius: 8px;
        min-height: 70vh;
      ">
      <OrgChart
        ref="orgChartRef"
        :data="data"
        :minimap="minimap">
        <template #node="{ item, children, childrenExpanded, toggleChildren }">
          <div
            class="node-item"
            :class="{ active: childrenExpanded, passive: !childrenExpanded }">
            <div>
              <img
                v-if="item.imageUrl"
                class="avatar"
                :src="item.imageUrl"
                alt="avatar" />
            </div>
            <div>
              <div>{{ item.id }} ({{ children?.length }})</div>
              <div>{{ item.name }}</div>
            </div>
          </div>
          <div style="text-align: center">
            <button
              v-if="children?.length"
              class="node-btn-toggle"
              @click="toggleChildren"
              @touchend="toggleChildren">
              {{ childrenExpanded ? '-' : '+' }}
            </button>
          </div>
        </template>

        <template #noData>
          <div style="color: blue; text-align: center">No data</div>
        </template>
      </OrgChart>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue';
import { OrgChart } from '../dist/vue3-org-chart';
import '../dist/vue3-org-chart.css';

interface Data {
  id: string;
  name: string;
  imageUrl?: string;
  area?: string;
  profileUrl?: string;
  office?: string;
  tags?: string;
  isLoggedUser?: boolean;
  positionName?: string;
  parentId?: string;
  size?: string;
}

const dataUrl =
  'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/sample.json';

const data = ref<Data[]>([]);
const minimap = ref(false);
const orgChartRef = useTemplateRef('orgChartRef');

const fetchData = async () => {
  const res = await fetch(dataUrl);
  data.value = (await res.json()) as Data[];
};

fetchData();
</script>

<style>
body {
  margin: 0;
  background: #eeeeee;
}

.wrapper {
  max-width: 800px;
  margin: 80px auto;
}

.btn {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #fff;
  cursor: pointer;
  outline: none;
}

.node-item {
  display: flex;
  width: 12rem;
  border-radius: 0.35rem;
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
}

.node-item > :not([hidden]) ~ :not([hidden]) {
  margin-left: 1rem;
}

.node-item:hover {
  background-color: rgb(226 232 240);
}

.node-item.active {
  border-color: rgb(165 180 252);
  background-color: rgb(224 231 255);
}

.node-item.passive {
  background-color: rgb(248 250 252);
}

.node-item .avatar {
  height: 3rem;
  width: 3rem;
  border-radius: 9999px;
}

.node-btn-toggle {
  padding: 1px;
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  border: 1px solid #e2e8f0;
  background-color: rgb(255 255 255);
  font-size: 0.75rem;
  line-height: 10px;
}
</style>
