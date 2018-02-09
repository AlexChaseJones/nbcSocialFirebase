const axios = require('axios');
const moment = require('moment');

var url = require('url');
var http = require('http');
 
var sizeOf = require('image-size');

const striptags = require('striptags');
const emojione = require('emojione');

class Juice {
	constructor() {
		this.url = this.getUrl();
	}

	getUrl() {
		const yesterday = moment().add(-2, 'days');
		const yesterdayFormatted = yesterday.format('YYYY-MM-DD-HH:mm');
		return `https://www.juicer.io/api/feeds/nbcolympics?starting_at=${yesterdayFormatted}&per=100`
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

	getRandomInt(data) {
	  return Math.floor(Math.random() * (data.length));
	}

	fetchPosts(tweets, insta) {
		return axios.get(this.url)
	}
}

module.exports = Juice;