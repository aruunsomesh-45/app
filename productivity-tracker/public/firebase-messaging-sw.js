// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
// These values are required for the service worker to work correctly.
firebase.initializeApp({
    apiKey: "AIzaSyB_-P1BjKnfGtUwajFoEMLKncNJX3l4PTw",
    authDomain: "prod-tracker-app-new.firebaseapp.com",
    projectId: "prod-tracker-app-new",
    storageBucket: "prod-tracker-app-new.firebasestorage.app",
    messagingSenderId: "363037369341",
    appId: "1:363037369341:web:c1d7593dea5046084caf94"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.data?.icon || '/banana-icon.png',
        badge: '/banana-icon.png',
        data: payload.data // Pass through the data object for clicks
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click to redirect to specific app route
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data?.redirect || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
