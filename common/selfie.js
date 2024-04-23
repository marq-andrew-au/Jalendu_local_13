

var ExifImage = require('exif').ExifImage;
var fs = require('fs');
var request = require('request');
const readlineSync = require('readline-sync');

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


module.exports.selfie = function(id, response, data) {

  const filePath = './data/selfie_template.html';

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');

  var out = '';

  for (const line of lines) {
    out = out + '\n' + line;
    if (line.includes("<!--ADD FIELDS-->")) {
      newline = `<input type="hidden" name="id" value="${id}">`;
      out = out + '\n' + newline;
    }
    else if (line.includes("<!--RESPONSE-->")) {
      newline = response;
      out = out + '\n' + newline;
    }
    else if (line.includes("<!--DATA-->")) {
      newline = response;
      out = out + '\n' + newline;
    }
  }
  return out;
}

module.exports.exif = function(imagepath) {

  new ExifImage({ image: imagepath }, function(error, exifData) {
    response = new Object();
    if (error) {
      console.log('Error: ' + error.message);
      response.success = false;
      response.data = `An error occured when trying to read your photo's exif metadata: ${error.message}`;
      console.log(response);
      return response;
    }
    else {
      console.log(exifData);
      response.success = true;
      response.data = exifData;
      return response;
    }
  });
}