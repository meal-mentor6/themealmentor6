//Update the Push Notification Status
function updatePushNotificationStatus(status) {
    pushElement.dataset.checked = status;
    if (status) {
        pushElement.innerText = 'Unsubscribe'
        pushImage.innerText = 'check_circle';
    }
    else {
        pushElement.innerText = 'Set Reminder'
        pushImage.innerText = 'sync_disabled';
    }
}

function checkIfPushIsEnabled() {
    //check if push notification permission has been denied by the user
    if (Notification.permission === 'denied') {
        alert('User has blocked push notification.');
        return;
    }
    //check if push notification is supported or not
    if (!('PushManager' in window)) {
        alert('Sorry, Push notification is ' + 'not supported on this browser.');
        return;
    }
    //get push notification subscription if serviceWorker is registered and ready
    navigator.serviceWorker.ready.then(function (registration) {
        registration.pushManager.getSubscription().then(function (subscription) {
            if (subscription) {
                updatePushNotificationStatus(true);
            }
            else {
                updatePushNotificationStatus(false);
            }
        }).catch(function (error) {
            console.error('Error occurred enabling push ', error);
        });
    });
}

// extract the subscription id and send it
// over to the REST service
function sendSubscriptionIDToServer(subscription) {
    fetch('/add-subscribers', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription: subscription })
    });
}

//extract the subscription id and send it over to the REST service
function removeSubscriptionIDFromServer(subscription) {
    var subscriptionid = subscription.endpoint.split('fcm/send/')[1];
    fetch('/remove-subscribers/' + subscriptionid, {
        method: 'delete',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

//subscribe to push notification
function subscribeToPushNotification() {
    navigator.serviceWorker.ready.then(function (registration) {
        if (!registration.pushManager) {
            alert('This browser does not ' + 'support push notification.');
            return false;
        }
        //to subscribe push notification using pushmanager
        //always show notification when received
        registration.pushManager.subscribe({
            userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array('BECfzevdoDU8nKxsGJlhYhgxQZ8t_ndj3GUeWEkRMIjSOQiUhJYhLnSlDj7jJFPoA-GVgVl9M1RcjoNn4hO_sNY')
        }).then(function (subscription) {
            console.log('Push notification subscribed.');
            console.log(subscription);
            sendSubscriptionIDToServer(subscription);
            updatePushNotificationStatus(true);
            M.toast({ html: '<b>Subscribed Successfully!</b>', classes: 'rounded  teal darken-1' })
        }).catch(function (error) {
            updatePushNotificationStatus(false);
            console.error('Push notification subscription error: ', error);
        });
    })
}

//unsubscribe from push notification
function unsubscribeFromPushNotification() {
    navigator.serviceWorker.ready.then(function (registration) {
        registration.pushManager.getSubscription().then(function (subscription) {
            if (!subscription) {
                alert('Unable to unsubscribe from push ' + 'notification.');
                return;
            }
            subscription.unsubscribe().then(function () {
                console.log('Push notification unsubscribed.');
                console.log(subscription);
                removeSubscriptionIDFromServer(subscription);
                updatePushNotificationStatus(false);
                M.toast({ html: '<b>UnSubscribed Successfully!</b>', classes: 'rounded' });
            }).catch(function (error) {
                console.error(error);
            });
        }).catch(function (error) {
            console.error('Failed to unsubscribe push ' + 'notification.');
        });
    })
}

const urlB64ToUint8Array = base64String => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

//get references to the UI elements
var pushElement = document.querySelector('.push-button');
var pushImage = document.querySelector('.push-icon');

//event handler for the push button
pushElement.addEventListener('click', function () {
    //check if you are already subscribed to push notifications
    if (pushElement.dataset.checked === 'true') {
        unsubscribeFromPushNotification();
    }
    else {
        subscribeToPushNotification();
    }
});

checkIfPushIsEnabled();

const sendNotification = function(){
    fetch('/push-notification');
}
