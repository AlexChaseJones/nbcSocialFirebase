const functions = require('firebase-functions');
const express = require('express')

const Juice = require('./juicer.js');
const Cache = require('./cache.js');
const template = require('./html/base.js');
const path = require('path');

const axios = require('axios');
const cache = new Cache;
const juice = new Juice();

const app = express();

app.get('/nbcolympics-landscape', (req, response) => {
	juice.fetchPosts()
	.then(res => {
		let items = res.data.posts.items;
		let node = juice.getRandomInt(items)
		let normalizedItem = juice.normalize(items[node])
		juice.getImageDimensions(normalizedItem)
		.then(res => {
			console.log(res)
			const imageOrientation = res.height < res.width ? 'landscape' : 'portrait';
			
			if (imageOrientation === 'landscape') {
				if (res.width >= 930) {
					normalizedItem.styleObj = `height: ${res.height}px`;
				} else {
					const scale = 930 / res.width;
					normalizedItem.styleObj = `height: ${res.height * scale}px`
				}
			} else if (imageOrientation === 'portrait') {
				normalizedItem.styleObj = "height: 930px; background-color: rgba(255,255,255,.2);"
			}

			normalizedItem.styleSheet = 'landscape-style.css';
			response.send(template(normalizedItem));
		})
	})
})

app.get('/nbcolympics-portrait', (req, response) => {
	juice.fetchPosts()
	.then(res => {
		let items = res.data.posts.items;
		let node = juice.getRandomInt(items)
		let normalizedItem = juice.normalize(items[node])
		juice.getImageDimensions(normalizedItem)
		.then(res => {
			console.log(res)
			const imageOrientation = res.height < res.width ? 'landscape' : 'portrait';
			
			if (imageOrientation === 'landscape') {
				if (res.width >= 930) {
					normalizedItem.styleObj = `height: ${res.height}px`;
				} else {
					const scale = 930 / res.width;
					normalizedItem.styleObj = `height: ${res.height * scale}px`
				}
			} else if (imageOrientation === 'portrait') {
				normalizedItem.styleObj = "height: 930px;  background-color: rgba(255,255,255,.2);"
			}

			normalizedItem.styleSheet = 'portrait-style.css';
			response.send(template(normalizedItem));
		})
	})
})

app.get('/nbcolympics', (req, response) => {
	juice.fetchPosts()
	.then(res => {
		let items = res.data.posts.items;
		let node = juice.getRandomInt(items)
		let normalizedItem = juice.normalize(items[node])
		juice.getImageDimensions(normalizedItem)
		.then(res => {
			console.log(res)
			const imageOrientation = res.height < res.width ? 'landscape' : 'portrait';
			
			if (imageOrientation === 'landscape') {
				if (res.width >= 930) {
					normalizedItem.styleObj = `height: ${res.height}px`;
				} else {
					const scale = 930 / res.width;
					normalizedItem.styleObj = `height: ${res.height * scale}px`
				}
			} else if (imageOrientation === 'portrait') {
				normalizedItem.styleObj = "height: 930px"
			}

			normalizedItem.styleSheet = 'style.css';
			response.send(template(normalizedItem));
		})
	})
})

exports.app = functions.https.onRequest(app);
