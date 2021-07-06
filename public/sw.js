const cacheName = 'mealmentor';

// Cache all the files to make a PWA
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll([
        '/',
        '/views/home.ejs',
        '/views/login.ejs',
        '/views/partials/head.ejs',
        '/views/partials/navigation.ejs',
        '/views/partials/footer.ejs',
        '/views/search.ejs',
        '/views/slider.ejs',
        '/views/profile.ejs',
        '/views/recipe.ejs',
        '/views/mealPlan.ejs',
        '/manifest.json'
      ]);
    })
  );
});

// Our service worker will intercept all fetch requests
// and check if we have cached the file
// if so it will serve the cached file
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request))
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key)
          return caches.delete(key)
        }
      }))
    }).then(() => self.clients.claim())
  )
})

self.addEventListener('push', function(event) {
  var title = 'Meal Time!';
  var body = {
      'body': event.data.text(), 'tag': 'pwa',
      'icon': './images/logo48x48.png'
  };
  event.waitUntil(self.registration.showNotification(title, body));
});

self.addEventListener('notificationclick', function(event) {
  // access data from event using event.notification.data
  console.log('On notification click: ', event.notification.data);
  var url = '/mymealplan';

  event.notification.close();

  // open the app and navigate to destination path after clicking the notification.
  event.waitUntil(
      clients.openWindow(url)
  );
});