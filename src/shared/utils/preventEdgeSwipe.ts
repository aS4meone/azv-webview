export function preventEdgeSwipeNavigation() {
  let touchStartX = 0;
  let isDraggingFromEdge = false;

  window.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    isDraggingFromEdge =
      touchStartX < 20 || touchStartX > window.innerWidth - 20;
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (isDraggingFromEdge) {
        const isInsidePushScreen = (e.target as HTMLElement)?.closest(
          ".push-screen"
        );
        if (!isInsidePushScreen) {
          e.preventDefault();
        }
      }
    },
    { passive: false }
  );
}
