
const fs = require('fs');
const https = require('https');
const fetch = require('node-fetch');

const { MessageAttachment } = require('discord.js');

module.exports.download = function(message, index, cb) {
	if (message.attachments) {
		let attachments = message.attachments;

        i = 0;

		for (let file of attachments) {
			//console.log(JSON.stringify(file[1].url,null,2));

			//let filestream = fs.createWriteStream(`./selfies/${message.author.tag}@${message.id}#${i}.jpg`);

			//i = i + 1;

		// 	let request = https.get(file[1].url, function (response) {
		// 		response.pipe(filestream);
		// 		filestream.on("finish", function () {
		// 			filestream.close(cb);
		// 		});
		// 	})
		// 	.on("error", function (err) {
		// 	fs.unlink(dest); // Delete the file async if there is an error
		// 	if (cb) cb(err.message);
		// });

		// 	request.on("error", function (err) {
		// 		console.log(err);
		// 	});

			//https://cdn.discordapp.com/attachments/871627629831290920/1236618372737794108/2015-02-06_18.06.27-1.jpg?ex=6638aa1b&is=6637589b&hm=217f8dd14f7409b49bf4dd9206f1d4e2d4f1e3c215e8d29dca7648f763dcb3a6&

			let ext = file[1].url.substring(file[1].url.lastIndexOf('.') + 1,file[1].url.lastIndexOf('?'));

			if (ext === 'jpeg'){
			  ext = 'jpg';
			}

			console.log(ext);

			fetch(file[1].url)
    			.then(res =>
        			res.body.pipe(fs.createWriteStream(`./selfies/${message.author.id}_${message.author.tag}_${message.id}#${i}.${ext}`)))
        		.catch(err => console.log(err));

    		i = i + 1;
		}
	}
};




module.exports.selfiescan = async function(client, channelid) {
	const channel = client.channels.cache.get(channelid);

	await channel.messages.fetch({ limit: 100 }).then(async messages => {
		messages.forEach(message => {
			this.download(message, function (err) {
				if (err) {
					console.log(err);
				} else {
					console.log("done");
				}
			});
		});
	});
}

