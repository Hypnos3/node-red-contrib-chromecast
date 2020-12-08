/********************************************
 * Cast-to-client:
 *********************************************/

const util = require('util');
const Client = require('castv2-client').Client;
const DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver;
// Const path = require('path');
// const YoutubeMediaReceiver = require(path.join(__dirname, '/lib/Youtube.js')).Youtube;

const googleTTS = require('google-tts-api');

const isTrue = function(val) {
    val = (val+'').toLowerCase();
    return (val === 'true' || val === 'yes' || val === 'on' || val === 'ja' || val === '1' || (!isNaN(val) && (Number(val) > 0)));
};

const isFalse = function(val) {
    val = (val+'').toLowerCase();
    return (val === 'false' || val === 'no' || val === 'off' || val === 'nein' || val === '0' || (!isNaN(val) && (Number(val) <= 0)));
};

const errorHandler = function (node, err, msg, messageText, stateText) {
    if (!err) {
        return true;
    }
    if (err.message) {
        const msg = err.message.toLowerCase();
        if (msg.indexOf('invalid player state') >= 0) {
            // Sent when the request by the sender can not be fulfilled because the player is not in a valid state. For example, if the application has not created a media element yet.
            // https://developers.google.com/cast/docs/reference/messages#InvalidPlayerState
            messageText += ':' + err.message + ' The request can not be fulfilled because the player is not in a valid state.';
        } else if (msg.indexOf('load failed') >= 0) {
            // Sent when the load request failed. The player state will be IDLE.
            // https://developers.google.com/cast/docs/reference/messages#LoadFailed
            messageText += ':' + err.message + ' Not able to load the media.';
        } else if (msg.indexOf('load cancelled') >= 0) {
            // Sent when the load request was cancelled (a second load request was received).
            // https://developers.google.com/cast/docs/reference/messages#LoadCancelled
            messageText += ':' + err.message + ' The request was cancelled (a second load request was received).';
        } else if (msg.indexOf('invalid request') >= 0) {
            // Sent when the request is invalid (an unknown request type, for example).
            // https://developers.google.com/cast/docs/reference/messages#InvalidRequest
            messageText += ':' + err.message + ' The request is invalid (example: an unknown request type).';
        } else {
            messageText += ':' + err.message;
        }
    } else {
        messageText += '! (No error message given!)';
    }

    node.error(messageText, msg || {});
    node.log(util.inspect(err, Object.getOwnPropertyNames(err)));
    node.status({
        fill: 'red',
        shape: 'ring',
        text: stateText
    });
    return false;
};

const getContentType = function (data, node, fileName) {
    // Node property wins!
    if (data.contentType) {
        return data.contentType;
    }

    if (!fileName) {
        fileName = data.url;
    }

    let contentType;
    if (fileName) {
        const contentTypeMap = {
            youtube: 'youtube/video',
            // official supported https://developers.google.com/cast/docs/media
            aac:'video/mp4',
            mp3: 'audio/mp3',
            m4a: 'audio/mp4',
            mpa: 'audio/mpeg',
            mp4: 'audio/mp4',
            webm: 'video/webm',
            vp8: 'video/webm',
            wav: 'audio/vnd.wav',
            bmp: 'image/bmp',
            gif: 'image/gif',
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg ',
            jpe: 'image/jpeg',
            png: 'image/png',
            webp: 'image/webp',
            // additional other formats
            au: 'audio/basic',
            snd: 'audio/basic',
            mp2: 'audio/x-mpeg',
            mid: 'audio/mid',
            midi: 'audio/mid',
            rmi: 'audio/mid',
            aif: 'audio/x-aiff',
            aiff: 'audio/x-aiff',
            aifc: 'audio/x-aiff',
            mov: 'video/quicktime',
            qt: 'video/quicktime',
            flv: 'video/x-flv',
            mpeg: 'video/mpeg',
            mpg: 'video/mpeg',
            mpe: 'video/mpeg',
            mjpg: 'video/x-motion-jpeg',
            mjpeg: 'video/x-motion-jpeg',
            '3gp': 'video/3gpp',
            avi: 'video/x-msvideo',
            wmv: 'video/x-ms-wmv',
            movie: 'video/x-sgi-movie',
            m3u: 'audio/x-mpegurl',
            ogg: 'audio/ogg',
            ogv: 'audio/ogg',
            ra: 'audio/vnd.rn-realaudio', // audio/x-pn-realaudio'
            stream: 'audio/x-qt-stream',
            rpm: 'audio/x-pn-realaudio-plugin',
            ram: 'audio/x-pn-realaudio',
            m3u8: 'application/x-mpegURL',
            svg: 'image/svg',
            tiff: 'image/tiff',
            tif: 'image/tiff',
            ico: 'image/x-icon'
        };

        const ext = fileName.split('.')[fileName.split('.').length - 1];
        contentType = contentTypeMap[ext.toLowerCase()];
        node.debug('contentType for ext ' + ext + ' is ' + contentType + Number('(') + fileName + ')');
    }
    if (!contentType) {
        node.warn('No contentType given!, using "audio/basic" which is maybe wrong! (' + fileName + ')');
        contentType = 'audio/basic';
    }

    return contentType;
};

const addGenericMetadata = function (media, imageUrl, contentTitle) {
    if (!contentTitle) {
        contentTitle = media.contentTitle;
    }

    if (!contentTitle) {
        // Default from url
        contentTitle = media.contentId;
        if (contentTitle.indexOf('/') > -1) {
            try {
                let paths = contentTitle.split('/');
                if (paths.length > 2) {
                    paths = paths.slice(paths.length - 2, paths.length);
                }
                contentTitle = paths.join(' - ');
            } catch (e) {
                // Not used
            }
        }
    }
    if (!imageUrl) {
        imageUrl = (media) ? (media.imageUrl || 'https://nodered.org/node-red-icon.png') : 'https://nodered.org/node-red-icon.png';
    }

    media.metadata = {
        type: 0,
        metadataType: 0,
        title: contentTitle,
        images: [{
            url: imageUrl
        }]
    };
};

const getSpeechUrl = function (node, text, language, options, callback, msg) {
    try {
        const url = googleTTS.getAudioUrl(text, {
            lang: language,
            slow: options.slow, // speed (number) is changed to slow (boolean)
            host: options.ttsHost || 'https://translate.google.com' // allow to change the host
        });
        node.debug('returned tts media url=\'' + url + '\'');
        const media = {
            contentId: url,
            contentType: 'audio/mp3',
            imageUrl: (options.media) ? options.media.imageUrl : 'https://nodered.org/node-red-icon.png',
            contentTitle: (options.media) ? (options.media.contentTitle || options.topic) : options.topic
        };
        doCast(node, media, options, (res, data) => {
            callback(url, data);
        }, msg);
    } catch (err) {
        errorHandler(node, err, msg, 'Not able to get media file via google-tts', 'error in tts');
    }
};

const doCast = function (node, media, options, callbackResult, msg) {
    const client = new Client();

    const onStatus = function (status) {
        node.debug('onStatus ' + util.inspect(status, { colors: true, compact: 10, breakLength: Infinity }));
        if (node) {
            node.send({
                payload: status,
                type: 'status',
                topic: options.topic + '/status'
            });
        }
    };
    const onClose = function () {
        node.debug('Player Close');
        client.close();
        /*
        Reconnect(function(newClient, newPlayer) {
            chcClient = newClient;
            chcPlayer = newPlayer;
        });
        */
    };
    const onError = function (err) {
        client.close();
        errorHandler(node, err, msg, 'Client error reported', 'client error');
    };

    const doGetVolume = function (fkt) {
        client.getVolume((err, vol) => {
            if (err) {
                errorHandler(node, err, msg, 'Not able to get the volume');
            } else {
                node.context().set('volume', vol.level);
                node.debug('volume get from client ' + util.inspect(vol, { colors: true, compact: 10, breakLength: Infinity }));
                if (fkt) {
                    fkt(vol);
                }
            }
        });
    };

    const doSetVolume = function (volume) {
        node.debug('doSetVolume ' + util.inspect(volume, { colors: true, compact: 10, breakLength: Infinity }));

        let obj = {};
        if (typeof volume === 'object') {
            obj = volume;
        } else if (volume < 0.01) {
            obj = {
                muted: true
            };
        } else if (volume > 0.99) {
            obj = {
                level: 1
            };
        } else {
            obj = {
                level: volume
            };
        }
        node.debug('try to set volume ' + util.inspect(obj, { colors: true, compact: 10, breakLength: Infinity }));
        client.setVolume(obj, (err, newvol) => {
            const oldVol = node.context().get('volume');
            if (oldVol !== newvol.level) {
                node.context().set('oldVolume', oldVol);
                node.context().set('volume', newvol.level);
            }

            if (err) {
                errorHandler(node, err, msg, 'Not able to set the volume');
            } else if (node) {
                node.log('volume changed to ' + Math.round(newvol.level * 100));
            }
        });
    };

    const checkVolume = function (options) {
        node.debug('checkVolume ' + util.inspect(options, { colors: true, compact: 10, breakLength: Infinity }));
        if (isTrue(options.muted)) {
            doSetVolume({
                muted: true
            });
        } else if (isFalse(options.muted)) {
            doSetVolume({
                muted: false
            });
        } else if (typeof options.volume !== 'undefined' && options.volume !== null) {
            doSetVolume(options.volume);
        } else if (typeof options.lowerVolumeLimit !== 'undefined' || typeof options.upperVolumeLimit !== 'undefined') {
            // Eventually getVolume --> https://developers.google.com/cast/docs/reference/receiver/cast.receiver.media.Player
            doGetVolume( (newvol) => {
                options.oldVolume = newvol.level * 100;
                if (options.upperVolumeLimit !== 'undefined' && (newvol.level > options.upperVolumeLimit)) {
                    doSetVolume(options.upperVolumeLimit);
                } else if (typeof options.lowerVolumeLimit !== 'undefined' && (newvol.level < options.lowerVolumeLimit)) {
                    doSetVolume(options.lowerVolumeLimit);
                }
            });
        }
    };

    const checkOptions = function (options) {
        if (isTrue(options.pause)) {
            node.debug('sending pause signal to player');

            client.getSessions((err, sessions) => {
                if (err) {
                    errorHandler(node, err, msg, 'Not able to get sessions');
                } else {
                    client.join(sessions[0], DefaultMediaReceiver, (err, app) => {
                        if (!app.media.currentSession) {
                            app.getStatus(() => {
                                app.pause();
                            });
                        } else {
                            app.pause();
                        }
                    });
                }
            });
        }

        if (isTrue(options.stop)) {
            node.debug('sending stop signal to player');
            client.getSessions((err, sessions) => {
                node.debug('session data response' + util.inspect(sessions, { colors: true, compact: 10, breakLength: Infinity }));
                if (err) {
                    errorHandler(node, err, msg, 'Not able to get sessions');
                } else {
                    client.join(sessions[0], DefaultMediaReceiver, (err, app) => {
                        node.debug('join session response' + util.inspect(app, { colors: true, compact: 10, breakLength: Infinity }));
                        if (err) {
                            errorHandler(node, err, msg, 'error joining session');
                        } else if (!app.media.currentSession) {
                            node.debug('send stop 1');
                            app.getStatus(() => {
                                node.debug('send stop 2');
                                app.stop();
                            });
                        } else {
                            node.debug('send stop 3');
                            app.stop();
                        }
                    });
                }
            });
        }
    };

    const statusCallback = function () {
        node.debug('statusCallback');
        client.getSessions((err, sessions) => {
            node.debug('getSessions Callback');
            if (err) {
                errorHandler(node, err, msg, 'error getting session');
            } else {
                try {
                    checkVolume(options);
                    const session = sessions[0]; // For now only one app runs at once, so using the first session should be ok
                    node.debug('session ' + util.inspect(sessions, { colors: true, compact: 10, breakLength: Infinity }));
                    if (typeof sessions !== 'undefined' && sessions.length > 0) {
                        client.join(session, DefaultMediaReceiver, (err, player) => {
                            node.debug('join Callback');
                            if (err) {
                                errorHandler(node, err, msg, 'error joining session');
                            } else {
                                node.debug('session joined ...');
                                player.on('status', onStatus);
                                player.on('close', onClose);

                                if (isTrue(options.pause)) {
                                    node.debug('sending pause ...');
                                    if (!player.media.currentSession){
                                        player.getStatus(() => {
                                            player.pause();
                                        });
                                    } else {
                                        player.pause();
                                    }
                                }
                                if (isTrue(options.stop)) {
                                    node.debug('sending stop ...');
                                    if (!player.media.currentSession){
                                        node.debug('send stop 1');
                                        player.getStatus(() => {
                                            node.debug('send stop 2');
                                            player.stop();
                                        });
                                    } else {
                                        node.debug('send stop 3');
                                        player.stop();
                                    }
                                }

                                node.debug('do get Status from player');
                                client.getStatus((err, status) => {
                                    if (err) {
                                        errorHandler(node, err, msg, 'Not able to get status');
                                    } else {
                                        callbackResult(status, options);
                                    }
                                    client.close();
                                });
                            }
                        });
                    } else {
                        // Nothing is playing
                        client.close();
                        callbackResult({
                            applications: []
                        }, options);
                    }
                } catch (err) {
                    errorHandler(node, err, msg, 'Exception occurred on load media', 'exception load media');
                }
            }
        });
    };

    /*
    Const launchYTCallback = function () {
        node.debug('launchYTCallback');
        client.launch(YoutubeMediaReceiver, function (err, player) {
            if (err) {
                errorHandler(node, err, msg, 'Not able to launch YoutubeMediaReceiver');
            }
            try {
                checkOptions(options)
                if (media.videoId) {
                    media.contentId = videoId;
                }
                node.debug('experimental implementation playing youtube videos media=\'' + util.inspect(media, Object.getOwnPropertyNames(media)) + '\'');
                player.load(media.contentId, (err) => {
                    if (err) {
                        errorHandler(node, err, msg, 'Not able to load youtube video', 'error load youtube video');
                    }
                    client.close();
                });
            } catch (err) {
                errorHandler(node, err, msg, 'Exception occurred on load youtube video', 'exception load youtube video');
            }
        });
    };
    */

    const launchDefCallback = function () {
        node.debug('launchDefCallback');
        client.launch(DefaultMediaReceiver, (err, player) => {
            if (err) {
                errorHandler(node, err, msg, 'Not able to launch DefaultMediaReceiver');
                return;
            }

            if (!player) {
                errorHandler(node, null, msg, 'Not able to load player from DefaultMediaReceiver');
                return;
            }

            try {
                checkVolume(options);
                checkOptions(options);

                if (media !== null &&
                    typeof media === 'object' &&
                    typeof media.contentId !== 'undefined') {
                    if (typeof media.contentType !== 'string' ||
                        media.contentType === '') {
                        media.contentType = 'audio/basic';
                    }
                    if (typeof media.streamType !== 'string' ||
                        media.streamType === '') {
                        media.streamType = 'BUFFERED'; // Or LIVE
                    }
                    node.debug('loading player with media=\'' + util.inspect(media, { colors: true, compact: 10, breakLength: Infinity }) + '\' streamType=' + media.streamType);

                    addGenericMetadata(media);

                    player.load(media, {
                        autoplay: true
                    }, (err, status) => {
                        if (err) {
                            errorHandler(node, err, msg, 'Not able to load media', 'error load media');
                        } else if (options && typeof options.seek !== 'undefined' && !isNaN(options.seek)) {
                            if (options && typeof options.seek !== 'undefined' && !isNaN(options.seek)) {
                                node.debug('seek to position ' + String(options.seek));
                                player.seek(options.seek, (err, status) => {
                                    if (err) {
                                        errorHandler(node, err, msg, 'Not able to seek to position ' + String(options.seek));
                                    } else {
                                        callbackResult(status, options);
                                    }
                                });
                            }
                        } else {
                            callbackResult(status, options);
                        }
                        client.close();
                    });
                } else {
                    node.debug('get Status from player');
                    client.getStatus((err, status) => {
                        if (err) {
                            errorHandler(node, err, msg, 'Not able to get status');
                        } else {
                            callbackResult(status, options);
                        }
                        client.close();
                    });
                }
            } catch (err) {
                errorHandler(node, err, msg, 'Exception occurred on load media', 'exception load media');
            }
        });
    };

    const launchQueueCallback = function () {
        client.launch(DefaultMediaReceiver, (err, player) => {
            if (err) {
                errorHandler(node, err, msg, 'Not able to launch DefaultMediaReceiver');
            }

            player.on('status', status => {
                node.debug('QUEUE STATUS ' + util.inspect(status, { colors: true, compact: 10, breakLength: Infinity }));
            });

            try {
                checkVolume(options);
                checkOptions(options);

                if (media !== null &&
                    typeof media === 'object') {
                    node.log('loading player with queue= ' + media.mediaList.length + ' items');
                    node.debug('queue data=\'' + util.inspect(media, { colors: true, compact: 10, breakLength: Infinity }) + '\'');

                    for (let i = 0; i < media.mediaList.length; i++) {
                        addGenericMetadata(media.mediaList[i].media, media.imageUrl, media.contentTitle);
                    }

                    player.queueLoad(
                        media.mediaList, {
                            startIndex: 0,
                            repeatMode: 'REPEAT_OFF'
                        },
                        (err, status) => {
                            node.log('Loaded QUEUE of ' + media.mediaList.length + ' items');

                            if (err) {
                                errorHandler(node, err, msg, 'Not able to load media', 'error load media');
                            } else if (options && typeof options.seek !== 'undefined' && !isNaN(options.seek)) {
                                if (options && typeof options.seek !== 'undefined' && !isNaN(options.seek)) {
                                    node.debug('seek to position ' + String(options.seek));
                                    player.seek(options.seek, (err, status) => {
                                        if (err) {
                                            errorHandler(node, err, msg, 'Not able to seek to position ' + String(options.seek));
                                        } else {
                                            callbackResult(status, options);
                                        }
                                    });
                                }
                            } else {
                                callbackResult(status, options);
                            }
                            client.close();
                        }
                    );
                } else {
                    node.debug('get Status from player');
                    client.getStatus((err, status) => {
                        if (err) {
                            errorHandler(node, err, msg, 'Not able to get status');
                        } else {
                            callbackResult(status, options);
                        }
                        client.close();
                    });
                }
            } catch (err) {
                errorHandler(node, err, msg, 'Exception occurred on load media', 'exception load media');
            }
        });
    };

    try {
        client.on('error', onError);
        client.on('status', onStatus);

        if (typeof options.host === 'undefined') {
            options.host = options.ip;
        }

        node.debug('connect to client ' + util.inspect(options, { colors: true, compact: 10, breakLength: Infinity }));
        if ((options && typeof options.status !== 'undefined' && options.status === true) ||
            (typeof media === 'undefined') || (media === null)) {
            client.connect(options, statusCallback);
        } else if (media.mediaList && media.mediaList.length > 0) {
            client.connect(options, launchQueueCallback);
        } else if (media.contentType.indexOf('youtube') !== -1) {
            node.error('currently not supported', {});
            // Client.connect(options, launchYTCallback);
        } else {
            client.connect(options, launchDefCallback);
        }
    } catch (err) {
        errorHandler(node, err, msg, 'Exception occurred on load media', 'exception load media');
    }
};

module.exports = function (RED) {
    function CastNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        this.on('input', function (msg, send, done) {
            // If this is pre-1.0, 'send' will be undefined, so fallback to node.send
            // If this is pre-1.0, 'done' will be undefined
            done = done || function (text, msg) { if (text) { return node.error(text, msg); } return null; };
            send = send || function (...args) { node.send.apply(node, args); };

            this.debug('getting message ' + util.inspect(msg, { colors: true, compact: 10, breakLength: Infinity }));
            //-----------------------------------------
            // Error Handling
            if (!Client) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'installation error'
                });
                done('Client not defined!! - Installation Problem, Please reinstall!', msg);
                return;
            }

            if (!DefaultMediaReceiver) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'installation error'
                });
                done('DefaultMediaReceiver not defined!! - Installation Problem, Please reinstall!', msg);
                return;
            }

            if (!googleTTS) {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'installation error'
                });
                done('googleTTS not defined!! - Installation Problem, Please reinstall!', msg);
                return;
            }
            /********************************************
             * Versenden:
             *********************************************/
            // var creds = RED.nodes.getNode(config.creds); - not used
            const attrs = [
                'media', 'url', 'urlList', 'imageUrl', 'contentType', 'contentTitle',
                'streamType', 'message', 'language', 'ip', 'port', 'volume',
                'lowerVolumeLimit', 'upperVolumeLimit', 'muted', 'mute',
                'delay', 'stop', 'pause', 'seek', 'duration', 'status', 'topic'
            ];
            if (!msg.topic) {
                msg.topic = 'cast';
            }

            const data = {};
            for (const attr of attrs) {
                // Value === 'undefined' || value === null --> value == null
                if ((config[attr] != null) && (config[attr] !== '')) { // eslint-disable-line
                    data[attr] = config[attr];
                }
                if ((msg[attr] != null) && (msg[attr] !== '')) { // eslint-disable-line
                    data[attr] = msg[attr];
                }
            }

            if (typeof msg.payload === 'object') {
                for (const attr of attrs) {
                    if ((msg.payload[attr] != null) && (msg.payload[attr] !== '')) { // eslint-disable-line
                        data[attr] = msg.payload[attr];
                    }
                }
            } else if (typeof msg.payload === 'string' && msg.payload.trim() !== '') {
                if (data.contentType && !msg.url && !config.url && !data.media) {
                    data.url = msg.payload;
                } else {
                    data.message = msg.payload;
                }
            }
            //-------------------------------------------------------------------
            if (typeof data.ip === 'undefined') {
                this.status({
                    fill: 'red',
                    shape: 'dot',
                    text: 'No IP given!'
                });
                done('configuration error: IP is missing!', msg);
                return;
            }
            if (typeof data.language === 'undefined' || data.language === '') {
                data.language = 'en';
            }
            if (typeof data.volume !== 'undefined') {
                if (!isNaN(data.volume) &&
                    data.volume !== '') {
                    data.volume = parseInt(data.volume) / 100;
                } else if ((data.volume.toLowerCase() === 'max') ||
                       (data.volume.toLowerCase() === 'full') ||
                       (data.volume.toLowerCase() === 'loud')) {
                    data.volume = 100;
                } else if ((data.volume.toLowerCase() === 'min') ||
                        (data.volume.toLowerCase() === 'mute') ||
                        (data.volume.toLowerCase() === 'muted')) {
                    data.volume = 0;
                } else if (data.volume !== 0) {
                    delete data.volume;
                }
            }
            if (typeof data.mute !== 'undefined') {
                data.muted = data.mute;
                delete data.mute;
            }
            if (typeof data.lowerVolumeLimit !== 'undefined' &&
                !isNaN(data.lowerVolumeLimit) &&
                data.lowerVolumeLimit !== '') {
                data.lowerVolumeLimit = parseFloat(data.lowerVolumeLimit);
                if (data.lowerVolumeLimit > 1) {
                    data.lowerVolumeLimit = data.lowerVolumeLimit / 100;
                }
            } else {
                delete data.lowerVolumeLimit;
            }
            if (typeof data.upperVolumeLimit !== 'undefined' &&
                !isNaN(data.upperVolumeLimit) &&
                data.upperVolumeLimit !== '') {
                data.upperVolumeLimit = parseFloat(data.upperVolumeLimit);
                if (data.upperVolumeLimit > 1) {
                    data.upperVolumeLimit = data.upperVolumeLimit / 100;
                }
            } else {
                delete data.upperVolumeLimit;
            }

            if (typeof data.delay !== 'undefined' && !isNaN(data.delay) && data.delay !== '') {
                data.delay = parseInt(data.delay);
            } else {
                data.delay = 250;
            }

            if (typeof data.url !== 'undefined' &&
                data.url != null) {  // eslint-disable-line
                // this.debug('initialize playing url \'' + util.inspect(data, { colors: true, compact: 10, breakLength: Infinity }) + '\'');

                if (typeof data.contentType !== 'string' || data.contentType === '') {
                    data.contentType = getContentType(data, this);
                }
                data.media = {
                    contentId: data.url,
                    contentType: data.contentType
                };
            } else if (typeof data.urlList !== 'undefined') {
                if (typeof data.urlList === 'string') {
                    data.urlList = data.urlList.split(/,|;\r\n/).filter((el) => el);
                }
                const listSize = data.urlList.length;
                if (listSize > 0) {
                    // If is a list of files
                    this.debug('initialize playing queue=\'' + listSize + '\'');
                    data.media = {};
                    data.media.mediaList = [];
                    for (let i = 0; i < listSize; i++) {
                        const item = data.urlList[i];

                        const contentType = getContentType(data, this, item);
                        const mediaItem = {
                            autoplay: true,
                            preloadTime: listSize,
                            startTime: i + 1,
                            activeTrackIds: [],
                            playbackDuration: 2,
                            media: {
                                contentId: item,
                                contentType
                            }
                        };
                        data.media.mediaList.push(mediaItem);
                    }
                }
            }

            if (typeof data.media === 'object' &&
                data.media != null) { // eslint-disable-line

                if (typeof data.contentType !== 'undefined' &&
                    data.contentType != null) { // eslint-disable-line
                    data.media.contentType = data.contentType;
                }

                if (typeof data.streamType !== 'undefined' &&
                    data.streamType != null) { // eslint-disable-line
                    data.media.streamType = data.streamType;
                }

                if (typeof data.duration !== 'undefined' &&
                    !isNaN(data.duration)) {
                    data.media.duration = data.duration;
                }

                if (typeof data.imageUrl !== 'undefined' &&
                    data.imageUrl != null) { // eslint-disable-line
                    data.media.imageUrl = data.imageUrl;
                }

                if (typeof data.contentTitle !== 'undefined' &&
                    data.contentTitle != null) { // eslint-disable-line
                    data.media.contentTitle = data.contentTitle;
                }
            }

            try {
                msg.data = data;
                this.debug(util.inspect(data, { colors: true, compact: 10, breakLength: Infinity }));

                if (data.media) {
                    this.debug('initialize playing');
                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: 'play (' + data.contentType + ') on ' + data.ip + ' [url]'
                    });

                    doCast(this, data.media, data, (res, data2) => {
                        msg.payload = res;
                        if (data2 && data2.message) {
                            setTimeout(data3 => {
                                this.status({
                                    fill: 'green',
                                    shape: 'ring',
                                    text: 'play message on ' + data3.ip
                                });
                                getSpeechUrl(data3.message, data3.language, data3, sres => {
                                    msg.speechResult = sres;
                                    this.status({
                                        fill: 'green',
                                        shape: 'dot',
                                        text: 'ok'
                                    });
                                    msg.type = 'speechResult';
                                    send(msg);
                                }, msg);
                            }, data2.delay, data2);
                            done();
                            return null;
                        }
                        this.status({
                            fill: 'green',
                            shape: 'dot',
                            text: 'ok'
                        });
                        msg.type = 'outResult';
                        send(msg);
                    }, (errMsg) => {
                        done(errMsg);
                    }, msg);
                    done();
                    return null;
                }

                if (data.message) {
                    this.debug('initialize getting tts');
                    this.status({
                        fill: 'green',
                        shape: 'ring',
                        text: 'play message on ' + data.ip
                    });
                    getSpeechUrl(this, data.message, data.language, data, sres => {
                        msg.payload = sres;
                        this.status({
                            fill: 'green',
                            shape: 'dot',
                            text: 'ok'
                        });
                        msg.type = 'messageDirect';
                        send(msg);
                    }, msg);
                    done();
                    return null;
                }

                this.debug('only sending unspecified request');
                this.status({
                    fill: 'yellow',
                    shape: 'dot',
                    text: 'connect to ' + data.ip
                });
                doCast(this, null, data, status => {
                    this.debug('status = ' + util.inspect(status, { colors: true, compact: 10, breakLength: Infinity }));
                    msg.payload = status;
                    this.status({
                        fill: 'green',
                        shape: 'dot',
                        text: 'ok'
                    });
                    msg.type = 'castCommand';
                    this.send(msg);
                }, msg);
            } catch (err) {
                errorHandler(this, err, msg, 'Exception occurred on cast media to output', 'internal error');
            }
            done();
            return null;
        });

        discoverIpAddresses('googlecast', (ipaddresses) => {
            RED.httpAdmin.get('/ipaddresses', (req, res) => {
                res.json(ipaddresses);
            });
        });
    }

    function discoverIpAddresses(serviceType, discoveryCallback) {
        const ipaddresses = [];
        const bonjour = require('bonjour')();
        bonjour.find({
            type: serviceType
        }, (service) => {
            service.addresses.forEach((ip) => {
                if (ip.split('.').length === 4) {
                    ipaddresses.push({
                        ip: ip,
                        port: service.port,
                        label: service.txt.md
                    });
                }
            });

            // delay for all services to be discovered
            if (discoveryCallback) {
                setTimeout(() => {
                    discoveryCallback(ipaddresses);
                }, 2000);
            }
        });
    }

    RED.nodes.registerType('cast-to-client', CastNode);
};