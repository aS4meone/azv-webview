let globalZIndex = 1000;

export const zIndexManager = {
  current: () => globalZIndex,
  increment: () => {
    globalZIndex += 1;
    return globalZIndex;
  },
  decrement: () => {
    globalZIndex -= 1;
    return globalZIndex;
  },
};
