if('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('/serviceWorker.js')
  .then(function() { console.log("Service Worker Registered"); });
}

function updateOnlineStatus(event) {
  var condition = navigator.onLine ? "online" : "offline";

  let online_indicator = document.getElementById("online-indicator");
  online_indicator.removeAttribute('class');
  online_indicator.setAttribute('class', condition);
}

window.addEventListener('load', updateOnlineStatus);
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);