import type { PanZoom } from 'panzoom';
import { ref, watchEffect } from 'vue';
import panzoom from 'panzoom';

export function usePanzoom() {
  // panzoom instance
  const instance = ref<PanZoom | null>(null);
  const scene = ref<HTMLElement | null>(null);
  const container = ref<HTMLElement | null>(null);

  function resetZoom() {
    if (!instance.value) return;

    const transform = instance.value.getTransform();
    if (transform.scale !== 1) {
      // calculate the point that should not move
      const reverseScale = 1 - transform.scale;
      const x = transform.x / reverseScale;
      const y = transform.y / reverseScale;
      instance.value.smoothZoomAbs(x, y, 1);
    } else {
      instance.value.smoothMoveTo(0, 40);
    }
  }

  function getCurrentScenePosition() {
    const transform = instance.value?.getTransform();
    const rect = container.value?.getBoundingClientRect();
    const sceneRect = scene.value?.getBoundingClientRect();

    if (!transform || !rect || !sceneRect) {
      return { x: 0, y: 40, scale: 1 };
    }

    const posX = sceneRect.x - rect.x;
    const posY = sceneRect.y - rect.y;
    const x = posX + sceneRect.width / 2;
    const y = posY + sceneRect.height / 2;

    return { x, y, scale: transform.scale };
  }

  function zoomIn() {
    const { x, y, scale } = getCurrentScenePosition();

    instance.value?.smoothZoomAbs(x, y, (scale * 3) / 2);
  }

  function zoomOut() {
    const { x, y, scale } = getCurrentScenePosition();

    instance.value?.smoothZoomAbs(x, y, (scale * 2) / 3);
  }

  // set panzoom instance
  function setInstance() {
    if (!scene.value) {
      return;
    }
    instance.value = panzoom(scene.value, {
      zoomDoubleClickSpeed: 1.4,
      maxZoom: 5,
      minZoom: 0.02,
      initialZoom: 1,
      bounds: false,
    });
  }

  // initialize panzoom instance, if not already set
  watchEffect(() => {
    if (!instance.value) {
      setInstance();
      resetZoom();
    }
  });

  return {
    instance,
    container,
    scene,
    resetZoom,
    zoomIn,
    zoomOut,
  };
}
