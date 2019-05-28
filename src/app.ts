export const dva = {
  config: {
    onError(err: ErrorEvent) {
      err.preventDefault();
      console.error(err.message);
    },
  },
};

export function render(oldRender) {
  function onDeviceReady() {
    oldRender();
  }
  document.addEventListener('deviceready', onDeviceReady, false);
}
