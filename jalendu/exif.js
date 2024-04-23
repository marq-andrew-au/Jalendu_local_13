
var ExifImage = require('exif').ExifImage;
const fs = require('fs');
var request = require('request');

module.exports.exifdata = function(message) {

  if (message.attachments.size > 0) {
    console.log(JSON.stringify(message.attachments.first(), null, 2));

    var options = {
      url: message.attachments.first().url,
      method: "get",
      encoding: null
    };

    console.log('Requesting image..');
    request(options, function(error, response, body) {

      if (error) {
        console.error('error:', error);
      } else {
        console.log('Response: StatusCode:', response && response.statusCode);
        console.log('Response: Body: Length: %d. Is buffer: %s', body.length, (body instanceof Buffer));
        //fs.writeFileSync('test.jpg', body);

        try {
          new ExifImage({ image: body }, function(error, exifData) {
            if (error)
              console.log('Error: ' + error.message);
            else
              console.log(exifData); // Do something with your data!
          });
        } catch (error) {
          console.log('Error: ' + error.message);
        }

      }
    });
  }
  else {
    console.log('exif: message has no attachments');
  }

  // try {
  //   new ExifImage({ image: 'myImage.jpg' }, function(error, exifData) {
  //     if (error)
  //       console.log('Error: ' + error.message);
  //     else
  //       console.log(exifData); // Do something with your data!
  //   });
  // } catch (error) {
  //   console.log('Error: ' + error.message);
  // }
}