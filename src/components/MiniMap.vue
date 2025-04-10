<script setup lang="ts">
import type { PanZoom } from 'panzoom';
import { computed, onMounted, ref } from 'vue';

const {
  instance,
  scene,
  container,
  size = 1 / 6,
} = defineProps<{
  instance: PanZoom;
  scene: HTMLElement | null;
  container: HTMLElement | null;
  size?: number;
}>();

// Reactive references for container and scene rectangles
const containerRect = ref({ width: 0, height: 0, top: 0, left: 0 });
const sceneRect = ref({ width: 0, height: 0, top: 0, left: 0 });

// Computed properties for minimap dimensions
const minimapMaxWidth = computed(() => containerRect.value.width * size);
const minimapMaxHeight = computed(() => containerRect.value.height * size);

// Debounce function to limit the rate of function execution
const debounce = (
  func: (...args: unknown[]) => void,
  wait: number,
): ((...args: unknown[]) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function (this: unknown, ...args: unknown[]): void {
    clearTimeout(timeout as ReturnType<typeof setTimeout>);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Update the container and scene rectangle dimensions
const updateRectangles = () => {
  if (!container || !scene || !(scene.firstElementChild instanceof HTMLElement))
    return;

  containerRect.value = container.getBoundingClientRect();
  sceneRect.value = scene.firstElementChild.getBoundingClientRect();
};

const updateRectanglesDebounced = debounce(updateRectangles, 350);

// Set up event listeners and observers on mount
onMounted(() => {
  updateRectangles();
  instance.on('transform', updateRectangles);

  const resizeObserver = new ResizeObserver(updateRectanglesDebounced);
  if (container) resizeObserver.observe(container);
  if (scene) resizeObserver.observe(scene);
});

// Compute the maximum boundaries of the scene
const maxBoundaries = computed(() => ({
  left:
    containerRect.value.left - sceneRect.value.left + containerRect.value.width,
  right:
    sceneRect.value.left - containerRect.value.left + sceneRect.value.width,
  top:
    containerRect.value.top - sceneRect.value.top + containerRect.value.height,
  bottom:
    sceneRect.value.top - containerRect.value.top + sceneRect.value.height,
}));

// Scale a value based on minimap dimensions
const scale = (value: number) => {
  const maxWidth = Math.max(
    maxBoundaries.value.left,
    maxBoundaries.value.right,
    containerRect.value.width,
    sceneRect.value.width,
  );
  const maxHeight = Math.max(
    maxBoundaries.value.top,
    maxBoundaries.value.bottom,
    containerRect.value.height,
    sceneRect.value.height,
  );

  return (
    value *
    Math.min(
      minimapMaxWidth.value / maxWidth,
      minimapMaxHeight.value / maxHeight,
    )
  );
};

// Compute the style of the minimap container and scene
const computeStyle = (
  width: number,
  height: number,
  left: number,
  top: number,
) => {
  return {
    width: `${width}px`,
    height: `${height}px`,
    left: `${Math.max(left, 0)}px`,
    top: `${Math.max(top, 0)}px`,
  };
};

const containerStyle = computed(() => {
  const width = scale(containerRect.value.width);
  const height = scale(containerRect.value.height);
  const left = scale(containerRect.value.left - sceneRect.value.left);
  const top = scale(containerRect.value.top - sceneRect.value.top);

  return computeStyle(width, height, left, top);
});

const sceneStyle = computed(() => {
  const width = scale(sceneRect.value.width);
  const height = scale(sceneRect.value.height);
  const left = Math.min(
    scale(sceneRect.value.left - containerRect.value.left),
    minimapMaxWidth.value - scale(sceneRect.value.width),
  );
  const top = Math.min(
    scale(sceneRect.value.top - containerRect.value.top),
    minimapMaxHeight.value - scale(sceneRect.value.height),
  );

  return computeStyle(width, height, left, top);
});
</script>

<template>
  <div
    class="vue3-org-chart-minimap"
    :style="{ width: minimapMaxWidth + 'px', height: minimapMaxHeight + 'px' }">
    <div
      class="vue3-org-chart-minimap-scene"
      :style="sceneStyle"></div>
    <div
      class="vue3-org-chart-minimap-container"
      :style="containerStyle"></div>
  </div>
</template>
