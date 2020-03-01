/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");
importScripts('https://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/md5.js');
importScripts('https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js');

importScripts(
  "/precache-manifest.2c6fec53d1ae0d44c226c6387a8f74e4.js"
);

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute(workbox.precaching.getCacheKeyForURL("/index.html"), {
  
  blacklist: [/^\/_/,/\/[^/?]+\.[^/]+$/],
});

var CACHE_NAME = 'suneelkumar';
var urlsToCache = [
  // '/index.html',
];

// Init indexedDB using idb-keyval, https://github.com/jakearchibald/idb-keyval
const store = new idbKeyval.Store('GraphQL-Cache', 'PostResponses');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

// Workbox with custom handler to use IndexedDB for cache.
workbox.routing.registerRoute(
  new RegExp(/^https:\/\/cors-anywhere.herokuapp.com\/.*/),
  // Uncomment below to see the error thrown from Cache Storage API.
  //workbox.strategies.staleWhileRevalidate(),
  async ({
    event
  }) => {
    return staleWhileRevalidate(event);
  },
  'POST'
);

/*
// When installing SW.
self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then((cache) => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});
*/

// Return cached response when possible, and fetch new results from server in
// the background and update the cache.
// self.addEventListener('fetch', async (event) => {
  

//   if (event.request.method === 'POST') {

//     event.respondWith(staleWhileRevalidate(event));
//   }

//   // TODO: Handles other types of requests.
// });

async function staleWhileRevalidate(event) {
  let promise = null;
  let cachedResponse = await getCache(event.request.clone());
  let fetchPromise = fetch(event.request.clone())
    .then((response) => {
      console.log(response);
      setCache(event.request.clone(), response.clone());
      return response;
    })
    .catch((err) => {
      console.error(err);
    });
  return cachedResponse ? Promise.resolve(cachedResponse) : fetchPromise;
}

async function serializeResponse(response) {
  let serializedHeaders = {};
  for (var entry of response.headers.entries()) {
    serializedHeaders[entry[0]] = entry[1];
  }
  let serialized = {
    headers: serializedHeaders,
    status: response.status,
    statusText: response.statusText
  };
  serialized.body = await response.json();
  return serialized;
}

async function setCache(request, response) {
  var key, data;
  let body = null;
  let contentType = request.headers.get( "Content-Type" );
  if(contentType === "application/x-www-form-urlencoded" ) {
    // get Form-Data
    var newObj = {};
    body = await request.formData().then(formData => {

      for(var pair of formData.entries()) {
        var key = pair[0];
        var value =  pair[1];
        newObj[key] = value;
      }
    });
// Get the post data as plain text as a fallback

  let id = CryptoJS.MD5(JSON.stringify(newObj)).toString();

  var entry = {
    query: newObj,
    response: await serializeResponse(response),
    timestamp: Date.now()
  };
  idbKeyval.set(id, entry, store);
}
}

async function getCache(request) {
  let data;
  var newObj={}; 
  let contentType = request.headers.get( "Content-Type" );
  if(contentType === "application/x-www-form-urlencoded" ) {
  try {
    body = await request.formData().then(formData => {

      for(var pair of formData.entries()) {
        var key = pair[0];
        var value =  pair[1];
        newObj[key] = value;
      }
    });

    let id = CryptoJS.MD5(JSON.stringify(newObj)).toString();
    data = await idbKeyval.get(id, store);
    if (!data) return null;

    // Check cache max age.
    let cacheControl = request.headers.get('Cache-Control');
    let maxAge = cacheControl ? parseInt(cacheControl.split('=')[1]) : 3600;
    if (Date.now() - data.timestamp > maxAge * 1000) {
      console.log(`Cache expired. Load from API endpoint.`);
      return null;
    }

    console.log(`Load response from cache.`);
    return new Response(JSON.stringify(data.response.body), data.response);
  } catch (err) {
    return null;
  }
}
}

async function getPostKey(request) {
  let body = await request.json();
  return JSON.stringify(body);
}
workbox.routing.registerRoute(/^https:\/\/cors-anywhere.herokuapp.com\/.*/, new workbox.strategies.NetworkFirst({ "cacheName":"API", plugins: [new workbox.expiration.Plugin({ maxEntries: 10, purgeOnQuotaError: false }), new workbox.cacheableResponse.Plugin({ statuses: [ 200 ] })] }), 'POST');

workbox.routing.registerRoute(/^https:\/\/schneiderapp.herokuapp.com\/.*/, new workbox.strategies.NetworkFirst({ "cacheName":"suneel", plugins: [new workbox.expiration.Plugin({ maxEntries: 10, purgeOnQuotaError: false }), new workbox.cacheableResponse.Plugin({ statuses: [ 200 ] })] }), 'GET');
workbox.routing.registerRoute(/assets/, new workbox.strategies.NetworkFirst({ "cacheName":"icons", plugins: [new workbox.expiration.Plugin({ maxEntries: 10, purgeOnQuotaError: false }), new workbox.cacheableResponse.Plugin({ statuses: [ 200 ] })] }), 'GET');
