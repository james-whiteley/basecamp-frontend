// Cache all static files when service worker install event is triggered
self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open('basecamp').then(function(cache) {
     return cache.addAll([
       '/',
       '/index.html',
       '/tasks.html',
       '/task.html',
       '/main.css',
       'bundle.js',
       '/img/loading-more.gif',
       'https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css',
       'https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
     ]);
   })
 );
});

self.addEventListener('activate', function(event) {
  console.log('SERVICE WORKER ACTIVATED');
  console.log(event);
  //event.waitUntil(
    //console.log("CREATE DATABASE...")
    createDB();
  //);
});

// Retrieve static file from cache if possible
self.addEventListener('fetch', function(event) {
 event.respondWith(
   caches.match(event.request).then(function(response) {
     return response || fetch(event.request);
   })
 );
});

function createDB() {
  let db;
  let request = indexedDB.open('basecamp', 1);
  request.onerror = function(event) {
    console.log(request.errorCode);
  };

  request.onsuccess = function(event) {
    
  }

  request.onupgradeneeded = function(event) {
    console.log('UPGRADING DATABASE');
    db = event.target.result;

    // Create projects object store
    db.createObjectStore('projects', { keyPath: 'id' });

    // Create tasks object store
    let tasksOS = db.createObjectStore('tasks', { keyPath: 'id' });

    // Create index on project_id field of tasks object store
    tasksOS.createIndex('project_id', 'project_id', { unique: false, multiEntry: true });
  }
}

function readDB() {
  indexedDB.open('basecamp', 1).then(function(db) {
    var tx = db.transaction(['projects'], 'readonly');
    var store = tx.objectStore('projects');
    return store.getAll();
  }).then(function(items) {
    console.log(items);
    // Use beverage data
  });
}