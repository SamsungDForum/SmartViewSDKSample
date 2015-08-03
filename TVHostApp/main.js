(function(){
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[MultiScreen]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = ['0'];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }


    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                case 48:
                    // Key 0: Clear logs
                    log();
                    break;
                case 13:
                    //key Enter: show ime
                    document.getElementById('message').focus();
                    break;
                case 65376:
                case 65385:
                    //Close IME
                    if (channel !== null && channel.clients.length > 1 && e.target.value) {
                        channel.publish('say', e.target.value);
                        e.target.value = '';
                    }
                    e.target.blur();
                    document.body.focus();
                    break;
                // Key Return
                case 10009:
                    tizen.application.getCurrentApplication().exit();
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    var channel = null;

    // this function adds a new <div> with message at the top
    function echo(msg, parent) {
        var sp = document.createElement("div");
        var parent = document.querySelector("#msg > div");
        sp.innerHTML = msg;
        parent.insertBefore(sp, parent.firstChild.nextSibling);
    }

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function echo(msg) {
        var messagesEl = document.getElementById('messages');

        if (msg) {
            // Update message box
            console.log('[MultiScreen]: ', msg);
            messagesEl.innerHTML += msg + '<br />';
        } else {
            // Clear message box
            messagesEl.innerHTML = '';
        }

        messagesEl.scrollTop = messagesEl.scrollHeight;
    }


    /**
     * Start the application once loading is finished
     */
    window.onload = function () {
        if (window.tizen === undefined) {
            log('This application needs to be run on Tizen device');
            return;
        }

        displayVersion();
        registerKeys();
        registerKeyHandler();

        // Get a reference to the local "service"
        msf.local(function(err, service) {
            if (err) {
                echo('msf.local error: ' + err, logBox);
                return;
            }
            // Create a reference to a communication "channel"
            channel = service.channel('com.samsung.multiscreen.MultiScreenSimple');

            // Connect to the channel
            channel.connect({name:"The TV"}, function (err) {
                if (err) {
                    return console.error(err);
                }
                log('MultiScreen initialized, channel opened.');
            });

            // Add a message listener. This is where you will receive messages from mobile devices
            channel.on('say', function(msg, from){
                echo(from.attributes.name + ' says: <strong>' + msg + '</strong>');
            });

            // Add a listener for when another client connects, such as a mobile device
            channel.on('clientConnect', function(client){
                // Send the new client a message
                channel.publish('say', 'Hello ' + client.attributes.name, client.id);
                log("Let's welcome a new client: " + client.attributes.name);
            });

            // Add a listener for when a client disconnects
            channel.on('clientDisconnect', function(client){
                log("Sorry to see you go, " + client.attributes.name + ". Goodbye!");
            });
        });
    }
})();






