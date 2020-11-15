# node-red-contrib-cast for NodeRED

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/hypnos3/node-red-contrib-cast/graphs/commit-activity)
[![HitCount](http://hits.dwyl.io/hypnos3/node-red-contrib-cast.svg)](http://hits.dwyl.io/hypnos3/node-red-contrib-cast)
[![Dependencies Status](https://img.shields.io/david/hypnos3/node-red-contrib-cast.svg)](https://david-dm.org/hypnos3/node-red-contrib-cast)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Issues](https://img.shields.io/github/issues/hypnos3/node-red-contrib-cast.svg?style=flat-square)](https://github.com/hypnos3/node-red-contrib-cast/issues)

[![NPM](https://nodei.co/npm/node-red-contrib-cast.png)](https://nodei.co/npm/node-red-contrib-cast/)

<!-- [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) -->

These nodes are based on a fork of the node-red-contrib-chromecast. It is for stream media on a chromecast or a google home device.

![nodes](images/appearance1.png?raw=true)

> Because I no longer use this node myself, there is unfortunately only limited support.


## Table of contents

- [node-red-contrib-cast for NodeRED](#node-red-contrib-cast-for-nodered)
	- [Table of contents](#table-of-contents)
	- [Installation](#installation)
	- [Quick Start](#quick-start)
		- [stream a url](#stream-a-url)
		- [sends an text to Google TTS](#sends-an-text-to-google-tts)
		- [play a video on chromecast](#play-a-video-on-chromecast)
		- [get status of a cast device](#get-status-of-a-cast-device)
	- [Implemented Nodes](#implemented-nodes)
	- [How to use](#how-to-use)
		- [Media Types](#media-types)
	- [Advanced](#advanced)
	- [Tip](#tip)
	- [Examples](#examples)
		- [Play local files](#play-local-files)
		- [changing ip, url, contentType, streamType](#changing-ip-url-contenttype-streamtype)
	- [Bugs and Feedback](#bugs-and-feedback)
		- [:moneybag: Donations ![Donate](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XDPSATTXBXHCL)](#moneybag-donations-)
	- [LICENSE](#license)
	- [Other](#other)

## Installation

```bash
cd ~/.node-red
npm install node-red-contrib-cast
```

## Quick Start

This package provides a single node, cast, which will be under the "functions" group in the pallete.

### stream a url

Simple flow that sends an mp3 to the chromecast or google cast device:

![example 1](images/example1.png?raw=true)

    [{"id":"a21f1807.41d7f8","type":"cast-to-client","z":"d900d7d9.c4c498","name":"","url":null,"contentType":"","message":null,"language":"en","ip":"","port":"","volume":null,"x":590,"y":80,"wires":[["fba1eb3.2515918"]]},{"id":"74313baf.f282f4","type":"inject","z":"d900d7d9.c4c498","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":80,"wires":[["53d91dd8.67b924"]]},{"id":"53d91dd8.67b924","type":"change","z":"d900d7d9.c4c498","name":"","rules":[{"t":"set","p":"ip","pt":"msg","to":"192.168.1.125","tot":"str"},{"t":"set","p":"url","pt":"msg","to":"http://translate.google.com/translate_tts?ie=UTF-8&total=1&idx=0&textlen=32&client=tw-ob&q=Word%20Up&tl=En-gb","tot":"str"},{"t":"set","p":"contentType","pt":"msg","to":"audio/mp3","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":380,"y":80,"wires":[["a21f1807.41d7f8"]]},{"id":"fba1eb3.2515918","type":"debug","z":"d900d7d9.c4c498","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":790,"y":80,"wires":[]},{"id":"9ef34079.24061","type":"comment","z":"d900d7d9.c4c498","name":"stream a url","info":"","x":130,"y":40,"wires":[]}]

### sends an text to Google TTS

Simple flow that sends an text to Google TTS and the result to a the chromecast or google cast device:

![example 2](images/example2.png?raw=true)

    [{"id":"8d9663a.05e27a","type":"cast-to-client","z":"d900d7d9.c4c498","name":"","url":null,"contentType":"","message":null,"language":"en","ip":"","port":"","volume":null,"x":590,"y":200,"wires":[["b885e401.447548"]]},{"id":"6faf449b.c11efc","type":"inject","z":"d900d7d9.c4c498","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":160,"y":200,"wires":[["23bdf480.46b85c"]]},{"id":"23bdf480.46b85c","type":"change","z":"d900d7d9.c4c498","name":"","rules":[{"t":"set","p":"ip","pt":"msg","to":"192.168.1.125","tot":"str"},{"t":"set","p":"message","pt":"msg","to":"Word Up","tot":"str"},{"t":"set","p":"language","pt":"msg","to":"En-gb","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":380,"y":200,"wires":[["8d9663a.05e27a"]]},{"id":"b885e401.447548","type":"debug","z":"d900d7d9.c4c498","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":790,"y":200,"wires":[]},{"id":"9a5a2ce.5ae7ed","type":"comment","z":"d900d7d9.c4c498","name":"say a text","info":"","x":120,"y":160,"wires":[]}]

### play a video on chromecast

    [{"id":"443984d.4919a7c","type":"cast-to-client","z":"c4dd07cf.84ae98","name":"","url":"","contentType":"","message":"","language":"de","ip":"192.168.1.125","port":"","volume":"","x":490,"y":840,"wires":[["cad88339.e69ff"]]},{"id":"cc601032.ef8b9","type":"inject","z":"c4dd07cf.84ae98","name":"","topic":"","payload":"youtube","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":840,"wires":[["62aea8fa.99c718"]]},{"id":"cad88339.e69ff","type":"debug","z":"c4dd07cf.84ae98","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":710,"y":840,"wires":[]},{"id":"62aea8fa.99c718","type":"change","z":"c4dd07cf.84ae98","name":"","rules":[{"t":"set","p":"url","pt":"msg","to":"http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4","tot":"str"},{"t":"set","p":"contentType","pt":"msg","to":"video/mp4","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":300,"y":840,"wires":[["443984d.4919a7c"]]}]

### get status of a cast device

    [{"id":"82e3c67a.27b218","type":"cast-to-client","z":"c4dd07cf.84ae98","name":"","url":"","contentType":"","message":"","language":"en","ip":"192.168.1.125","port":"","volume":"","x":490,"y":220,"wires":[["6bc79592.92574c"]]},{"id":"a5bddaf0.4e9578","type":"inject","z":"c4dd07cf.84ae98","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":110,"y":220,"wires":[["82e3c67a.27b218"]]},{"id":"6bc79592.92574c","type":"debug","z":"c4dd07cf.84ae98","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":710,"y":220,"wires":[]}]

This will given an object of the following form:

```
{
	"applications": [{
			"appId": "CC1AD845",
			"displayName": "Default Media Receiver",
			"iconUrl": "",
			"isIdleScreen": false,
			"launchedFromCloud": false,
			"namespaces": [{
					"name": "urn:x-cast:com.google.cast.cac"
				}, {
					"name": "urn:x-cast:com.google.cast.broadcast"
				}, {
					"name": "urn:x-cast:com.google.cast.media"
				}
			],
			"sessionId": "8g547685-4ce7-4968-b656-8679b01f9a77",
			"statusText": "Default Media Receiver",
			"transportId": "8g547685-4ce7-4968-b656-8679b01f9a77"
		}
	],
	"userEq": {
		"high_shelf": {
			"frequency": 4500,
			"gain_db": 0,
			"quality": 0.707
		},
		"low_shelf": {
			"frequency": 150,
			"gain_db": 0,
			"quality": 0.707
		},
		"max_peaking_eqs": 0,
		"peaking_eqs": []
	},
	"volume": {
		"controlType": "master",
		"level": 0.15000000596046448,
		"muted": false,
		"stepInterval": 0.019999999552965164
	}
}
```

or if currently playing media

```
{
	"applications": [{
			"appId": "12F05308",
			"displayName": "TuneIn Free",
			"iconUrl": "https://lh3.googleusercontent.com/HY9FJJF6gvT-JykObo1KvoNbewRoUJa2VjsE8TRgmBUmFFYGDI3FYJRGxGkj9gkMh_f3K-QSytav8G8",
			"isIdleScreen": false,
			"launchedFromCloud": true,
			"namespaces": [{
					"name": "urn:x-cast:com.google.cast.cac"
				}, {
					"name": "urn:x-cast:com.tunein.cast.init"
				}, {
					"name": "urn:x-cast:com.tunein.cast.initUrl"
				}, {
					"name": "urn:x-cast:com.tunein.cast.play"
				}, {
					"name": "urn:x-cast:com.tunein.cast.pause"
				}, {
					"name": "urn:x-cast:com.tunein.cast.stop"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.addSender"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.mediaLoaded"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.playState"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.tuneDataLoaded"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.scrubberMovedMessage"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.nowPlayingDataLoaded"
				}, {
					"name": "urn:x-cast:com.tunein.cast.comm.error"
				}, {
					"name": "urn:x-cast:com.google.cast.broadcast"
				}, {
					"name": "urn:x-cast:com.google.cast.media"
				}
			],
			"sessionId": "1f8d64e1-fde4-42kb-xxc3-b77493ej54a6",
			"statusText": "Casting: Radio Dresden",
			"transportId": "1f8d64e1-fde4-42kb-xxc3-b77493ej54a6"
		}
	],
	"userEq": {
		"high_shelf": {
			"frequency": 4500,
			"gain_db": 0,
			"quality": 0.707
		},
		"low_shelf": {
			"frequency": 150,
			"gain_db": 0,
			"quality": 0.707
		},
		"max_peaking_eqs": 0,
		"peaking_eqs": []
	},
	"volume": {
		"controlType": "master",
		"level": 0.15000000596046448,
		"muted": false,
		"stepInterval": 0.019999999552965164
	}
}
```

## Implemented Nodes

- Cast Node - Send media to chromecast or google home devices

## How to use

The cast node has a couple of settings, which can be provided by the configuration or by the incoming message object.

Configuration possibilities:<br>
![configuration of the node](images/node-cast-properties.png?raw=true)

Options for the incoming message object:

- **IP**, `msg.ip` or `msg.payload.ip` the IP address of the device to cast the media. Could also be defined in the configuration of the node.
- **Port**, `msg.port` or `msg.payload.port` the port of the device (if not given default <code>8009</code> will be used).
- **Media Url**, `msg.url` or `msg.payload.url` url to a media file which should be cast to the cast device. For a chromecast this could be a media or a video file. For a Google Home device without a display this could only a audio file.
- **Media Type**, `msg.contentType` or `msg.payload.contentType` the content type (mime type) of the file in the url. This property is required if a url is given. Could also be defined in the configuration of the node.
- **Image Url**, `msg.imageUrl` or `msg.payload.imageUrl` url to a image file which represents the artwork for the url which should be cast to the cast device. For a chromecast this should be an image file. For a Google Home device without a display this is irrelevant.
- **Image Url**, `msg.imageUrl` or `msg.payload.imageUrl` url to a image file which represents the artwork for the url which should be cast to the cast device. For a chromecast this should be an image file. For a Google Home device without a display this is irrelevant.
- **Title**, `msg.contentTitle` or `msg.payload.contentTitle` a text which should be send to the google tts engine as the title of the message. For TTS the `msg.topic` will be set as contentTitle if no `msg.contentTitle` or `msg.payload.contentTitle` are given. Otherwise the filename will be used.
- **Language**, `msg.language` or `msg.payload.language` the language which should be used for converting the message to the media file.
- **Volume**, `msg.volume` or `msg.payload.volume` the volume should be set.

- Additional options (not configurable):
  - `msg.status` is set to `true` the player status will be queried and send as output, No media will be played
  - `msg.lowerVolumeLimit` or `msg.payload.lowerVolumeLimit` will set the volume to this value, if the current volume is below this value.
  - `msg.upperVolumeLimit` or `msg.payload.upperVolumeLimit` will set the volume to this value, if the current volume is above this limit.
  - `msg.muted` or `msg.payload.muted` the volume will be muted if set to false, otherwise the volume will be unmuted.
  - `msg.seek` or `msg.payload.seek` will sets the current position in the stream.
  - `msg.duration` or `msg.payload.duration` will sets the duration of the playing stream in seconds.
  - `msg.urlList` or `msg.payload.urlList` could be set to a list of urls which should be played. This could be an array or a string with multiple urls separated by comma, semicolon, lineBreak or |.

So the config can be at 3 places. The config of the node, a property of the `msg.payload` or a property of the `msg` object. The information is loaded in that order (e.g. url):

- _(1st)_ If the `msg.payload` is a object and contains a property `msg.payload.url` this setting will be used.
  - _(2nd)_ otherwise if the `msg` object contains the property `msg.url` this setting will be used.
    - _(3rd)_ otherwise if in the configuration the **Media Url** property is set this url will be used.

### Media Types

Example of Common Video File MIME Types are:

| Video Type     | Extension | MIME Type             |
| -------------- | --------- | --------------------- |
| Flash          | .flv      | video/x-flv           |
| MPEG-4         | .mp4      | video/mp4             |
| iPhone Index   | .m3u8     | application/x-mpegURL |
| iPhone Segment | .ts       | video/MP2T            |
| 3GP Mobile     | .3gp      | video/3gpp            |
| QuickTime      | .mov      | video/quicktime       |
| A/V Interleave | .avi      | video/x-msvideo       |
| Windows Media  | .wmv      | video/x-ms-wmv        |

Common Audio File MIME Types are:

| File Extension | MIME Type              |
| -------------- | ---------------------- |
| au             | audio/basic            |
| snd            | audio/basic            |
| Linear PCM     | audio/L24              |
| mid            | audio/mid              |
| rmi            | audio/mid              |
| mp3            | audio/mp3              |
| mp4 audio      | audio/mp4              |
| aif            | audio/x-aiff           |
| aifc           | audio/x-aiff           |
| aiff           | audio/x-aiff           |
| m3u            | audio/x-mpegurl        |
| ra             | audio/vnd.rn-realaudio |
| ram            | audio/vnd.rn-realaudio |
| Ogg Vorbis     | audio/ogg              |
| Vorbis         | audio/vorbis           |
| wav            | audio/vnd.wav          |

Please note that it does not mean that these types are also supported by the respective cast device. For the suported formats, please have a look at the [documentation on Google](https://developers.google.com/cast/docs/media).

## Advanced

When no **Media Url** or **Message** is setup, the player will stop playing the current media and the status will be queried and send as output. If only the status should be get without interrupting the current playing media `msg.status` needs to be set to `true`.

More advanced control is possible by using `msg.payload.media`. This must be an [object](https://developers.google.com/cast/docs/reference/messages#MediaInformation) with the following properties:

| Name        | Type   | Description                                                                                                                                                                                                             |
| ----------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| contentId   | string | Url of the media.<br>If the url is defined in configuration or by `msg.payload.url` or `msg.url` this property will be set or overwritten.                                                                              |
| streamType  | string | Describes the type of media artifact as one of the following:<br> `NONE`, `BUFFERED` or `LIVE`.<br>If not defined, `BUFFERED` will be used.                                                                             |
| contentType | string | MIME content type of the media being played.<br>If defined in configuration or by `msg.contentType` or `msg.payload.contentType` this property will be set or overwritten.<br>If not defined, `audio/mp3` will be used. |
| _metadata_  | object | [metadata](https://developers.google.com/cast/docs/reference/messages#MediaInformation) which should be used.                                                                                                           |
| _duration_  | double | Duration of the currently playing stream in seconds.<br>If defined as `msg.duration` or `msg.payload.duration` this property will be set or overwritten.                                                                |

## Tip

To differentiate different receivers, it may be helpful to choose different icons.<br>
![node appearance](images/appearance2.png?raw=true)<br>
This is possible by choosing another icon in the Node Settings:<br>
![node settings](images/changing_node_icon.png?raw=true)<br>
For this purpose, the node already comes with a selection of useful icons:<br>
![useful icons](images/node-icons.png?raw=true)

## Examples

### Play local files

The node sends only the address of a media file to the cast device. So the cast device needs access to that media file. For normal local files this is not possible. As a solution to this you can serve an mp3 file directly from Node-Red using an HTTP node:

![example3](images/example3.png?raw=true)

	[{"id":"e9028c5b.27f29","type":"comment","z":"9e5f07b4.280818","name":"Doorbell routine","info":"","x":120,"y":880,"wires":[]},{"id":"8d5390b3.5e3e8","type":"link out","z":"9e5f07b4.280818","name":"","links":["c873cb6.6216e38"],"x":395,"y":1080,"wires":[],"icon":"node-red-contrib-huemagic/hue-group.png"},{"id":"4b9bb17b.5c119","type":"http in","z":"9e5f07b4.280818","name":"","url":"/doorbell","method":"get","upload":false,"swaggerDoc":"","x":110,"y":940,"wires":[["3283748e.b1669c"]]},{"id":"156d5629.1e369a","type":"http response","z":"9e5f07b4.280818","name":"","statusCode":"","headers":{"content-type":"audio/mpeg"},"x":410,"y":940,"wires":[]},{"id":"3283748e.b1669c","type":"file in","z":"9e5f07b4.280818","name":"doorbell.mp3","filename":"/home/pi/.node-red/doorbell.mp3","format":"","chunk":false,"sendError":false,"x":270,"y":940,"wires":[["156d5629.1e369a"]]},{"id":"821eb341.0478b","type":"link out","z":"9e5f07b4.280818","name":"","links":["ac60ad8.0709d5"],"x":395,"y":1120,"wires":[],"icon":"node-red-contrib-telegrambot-home/telegram.png"},{"id":"359f33cd.ed919c","type":"ButtonPressed","z":"9e5f07b4.280818","name":"Dash Button","mac":"${DASHBUTTONMAC}","x":110,"y":1060,"wires":[["5b101da.ce5abe4","59398cb6.bb6134","56f6951f.34631c","ba9ea684.c25988"]]},{"id":"5b101da.ce5abe4","type":"trigger","z":"9e5f07b4.280818","op1":"{\"ip\":\"${CASTIP}\",\"url\":\"http://${NODEREDIP}:1880/doorbell\",\"contentType\":\"audio/mp3\",\"volume\":50}","op2":"{\"ip\":\"${CASTIP}\",\"volume\":50}","op1type":"json","op2type":"json","duration":"13","extend":false,"units":"s","reset":"","bytopic":"all","name":"TTS + reset volume","x":330,"y":1000,"wires":[["f739fc31.14339"]]},{"id":"59398cb6.bb6134","type":"trigger","z":"9e5f07b4.280818","op1":"{\"ip\":\"${CASTIP}\",\"url\":\"http://${NODEREDIP}:1880/doorbell\",\"contentType\":\"audio/mp3\",\"volume\":50}","op2":"{\"ip\":\"${CASTIP}\",\"volume\":30}","op1type":"json","op2type":"json","duration":"13","extend":false,"units":"s","reset":"","bytopic":"all","name":"TTS + reset volume","x":330,"y":1040,"wires":[["61966b21.195fb4"]]},{"id":"56f6951f.34631c","type":"change","z":"9e5f07b4.280818","name":"Hue alert","rules":[{"t":"set","p":"payload","pt":"msg","to":"{\"alert\":2,\"hex\":\"ffca7b\"}","tot":"json"}],"action":"","property":"","from":"","to":"","reg":false,"x":300,"y":1080,"wires":[["8d5390b3.5e3e8"]]},{"id":"ba9ea684.c25988","type":"change","z":"9e5f07b4.280818","name":"Message","rules":[{"t":"set","p":"payload","pt":"msg","to":"Quelqu'un sonne a la porte !","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":300,"y":1120,"wires":[["821eb341.0478b"]]},{"id":"f739fc31.14339","type":"cast-to-client","z":"9e5f07b4.280818","name":"","url":"","contentType":"","message":"","language":"fr","ip":"","port":"","volume":"","x":490,"y":1000,"wires":[[]]},{"id":"61966b21.195fb4","type":"cast-to-client","z":"9e5f07b4.280818","name":"","url":"","contentType":"","message":"","language":"fr","ip":"","port":"","volume":"","x":490,"y":1040,"wires":[[]]}]

### changing ip, url, contentType, streamType

	[{"id":"c4d9d977.484068","type":"cast-to-client","z":"d900d7d9.c4c498","name":"","url":"","contentType":"","message":"","language":"en","ip":"localhost","port":"","volume":"","x":570,"y":600,"wires":[["98ac674c.cf52d8"]]},{"id":"86798168.185b7","type":"inject","z":"d900d7d9.c4c498","name":"","topic":"","payload":"","payloadType":"date","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":140,"y":600,"wires":[["b8e606ea.49f628"]]},{"id":"b8e606ea.49f628","type":"change","z":"d900d7d9.c4c498","name":"","rules":[{"t":"set","p":"ip","pt":"msg","to":"192.168.1.125","tot":"str"},{"t":"set","p":"url","pt":"msg","to":"http://does niot exists","tot":"str"},{"t":"set","p":"contentType","pt":"msg","to":"audio/mp3","tot":"str"},{"t":"set","p":"streamType","pt":"msg","to":"BUFFERED","tot":"str"}],"action":"","property":"","from":"","to":"","reg":false,"x":360,"y":600,"wires":[["c4d9d977.484068"]]},{"id":"98ac674c.cf52d8","type":"debug","z":"d900d7d9.c4c498","name":"test3","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"payload","x":750,"y":600,"wires":[]}]




## Bugs and Feedback

For bugs, questions and discussions please use the
[GitHub Issues](https://github.com/Hypnos3/node-red-contrib-cast/issues).

### :moneybag: Donations [![Donate](https://img.shields.io/badge/donate-PayPal-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XDPSATTXBXHCL)

Even for those that don't have the technical knowhow to help developing on there are ways to support development. So if you want to donate some money please feel free to send money via [PayPal](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XDPSATTXBXHCL).

## LICENSE

Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.

## Other

this node is published also here:
  - [NPM package](https://www.npmjs.com/package/node-red-contrib-cast)
  - [Node-Red](https://flows.nodered.org/node/node-red-contrib-cast)

