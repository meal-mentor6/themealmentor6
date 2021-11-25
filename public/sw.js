const cacheName = 'mealmentor';

// Cache all the files to make a PWA
// self.addEventListener('install', (e) => {
// 	e.waitUntil(
// 		caches.open(cacheName).then((cache) => {
// 			return cache.addAll([
// 				'/',
// 				'/views/home.ejs',
// 				'/css/home.css',
// 				'/views/recipe.ejs',
// 				'/css/recipe.css',
// 				'/js/categories.css',
// 				'/views/login.ejs',
// 				'/css/login.css',
// 				'/css/index.css',
// 				'/views/partials/head.ejs',
// 				'/views/partials/navigation.ejs',
// 				'/views/partials/footer.ejs',
// 				'/views/mealPlan.ejs',
// 				'/css/mealplan.css',
// 				'/manifest.json',
// 			]);
// 		})
// 	);
// });

// // Our service worker will intercept all fetch requests
// // and check if we have cached the file
// // if so it will serve the cached file
// self.addEventListener('fetch', (e) => {
// 	e.respondWith((async () => {
// 		const r = await caches.match(e.request);
// 		console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
// 		if (r) {
// 			return r;
// 		}
// 		const response = await fetch(e.request, {credentials: 'same-origin', redirect: 'follow'});
// 		// if (!response || response.status !== 200 || response.type !== 'basic') {
// 		// 	return response;
// 		// }
// 		// const cache = await caches.open(cacheName);
// 		// console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
// 		// cache.put(e.request, response.clone());
// 		return response;
// 	})());
// });

// self.addEventListener('activate', (e) => {
// 	e.waitUntil(caches.keys().then((keyList) => {
// 		return Promise.all(keyList.map((key) => {
// 			if (key === cacheName) {
// 				return;
// 			}
// 			return caches.delete(key);
// 		}));
// 	}));
// });

// Notifications
self.addEventListener('push', function (event) {
	var title = 'Meal Time!';
	var body = {
		body: event.data.text(),
		tag: 'pwa',
		icon: './images/logo48x48.png',
	};
	event.waitUntil(self.registration.showNotification(title, body));
});

self.addEventListener('notificationclick', function (event) {
	// access data from event using event.notification.data
	console.log('On notification click: ', event.notification.data);
	var url = '/mymealplan';

	event.notification.close();

	// open the app and navigate to destination path after clicking the notification.
	event.waitUntil(clients.openWindow(url));
});

// .then(function (response) {
// 	// Check if we received a valid response
// 	if (!response || response.status !== 200 || response.type !== 'basic') {
// 		return response;
// 	}

// 	// IMPORTANT: Clone the response. A response is a stream
// 	// and because we want the browser to consume the response
// 	// as well as the cache consuming the response, we need
// 	// to clone it so we have two streams.
// 	var responseToCache = response.clone();

// 	caches.open(cacheName).then(function (cache) {
// 		cache.put(event.request, responseToCache);
// 	});
// 	return response;
// });