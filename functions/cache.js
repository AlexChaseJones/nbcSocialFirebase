var url = require('url');
var http = require('http');
 
var sizeOf = require('image-size');

const striptags = require('striptags');
const emojione = require('emojione');

class Cache {
	constructor() {
		this.data;
	}

	normalize(node) {
		const source = node.source.source;
		const imageOrientation = node.height < node.width ? 'landscape' : 'portrait';

		let obj = {};

		obj.imagesrc = node.image;
			
		let messageWithTagsRemoved = striptags(node.unformatted_message, [], ' ');
		let message;

		if (messageWithTagsRemoved.length > 140) {
			let message = Object.assign(messageWithTagsRemoved, {});
			message = messageWithTagsRemoved.substring(0, 140) + '...';
			message = message.substr(0, Math.min(message.length, message.lastIndexOf(" ")))

			let messageArray = message.split(' ');

			for (var i = 0; i < messageArray.length; i++) {
				// for each word, if it begins with a hashtag or @ symbol
				if (messageArray[i].indexOf('#') !== -1 || messageArray[i].indexOf('@') !== -1 || messageArray[i].indexOf('usm.ag') !== -1 || messageArray[i].indexOf('bit.ly') !== -1) {
					//make the word have a class tag wrap
					messageArray[i] = `<a href='#'>${messageArray[i]}</a>`
				}
			}

			obj.message = emojione.unicodeToImage(messageArray.join(' ').trim() + '...');
		} else {
			obj.message =	emojione.unicodeToImage(node.unformatted_message);
		}

		obj.username = node.source.term;
		obj.imageOrientation = imageOrientation;
		obj.imageHeight = node.height;
		if (source === "Twitter") {
			obj.source = 'twitter';
		} else if (source === "Instagram") {
			obj.source = 'insta';
		}

		return obj || null;
	}

	getImageDimensions(node) {
		var options = url.parse(node.imagesrc.replace('https', 'http'));

		return new Promise((resolve, reject) => {
			http.get(options, function (response) {
			  var chunks = [];
			  response.on('data', function (chunk) {
			    chunks.push(chunk);
			  }).on('end', function() {
			    var buffer = Buffer.concat(chunks);
			    var dimensions = sizeOf(buffer);

			    resolve({width: dimensions.width, height: dimensions.height})
			  });
			});
		})

	}

	updateDataCache(data) {
		const _data = data.data.posts.items.map(i => this.normalize(i));

		let promises = _data.map((i, index) => this.getImageDimensions(i));

		return Promise.all(promises)
		.then(res => {
			for (var i = 0; i < res.length; i++) {
				const imageOrientation = res[i].height < res[i].width ? 'landscape' : 'portrait';
				
				if (imageOrientation === 'landscape') {
					if (res[i].width >= 930) {
						_data[i].styleObj = `height: ${res[i].height}px`;
					} else {
						const scale = 930 / res[i].width;
						_data[i].styleObj = `height: ${res[i].height * scale}px`
					}
				} else if (imageOrientation === 'portrait') {
					_data[i].styleObj = "height: 930px"
				}
			}
			this.data = _data;
		})
	}

	getRandomInt(data) {
	  return Math.floor(Math.random() * (data.length));
	}

	getRandomPost() {
		return this.data[this.getRandomInt()]
	}
}

module.exports = Cache
