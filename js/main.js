'use strict';

// Put variables in global scope to make them available to the browser console.
var video = document.querySelector('video');
var canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

var button = document.querySelector('button');

const container = document.getElementById('container');

const take = document.getElementById('take');
const takeagain = document.getElementById('take-again');

take.onclick = function() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  canvas.getContext('2d').
    drawImage(video, 0, 0, canvas.width, canvas.height);

  const rawImgData = canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, '');

  container.className="still";

  predict('estee', rawImgData)
    .then(bestMatch => this.setState({
      bestMatch
  }))

};

takeagain.onclick = function() {
  container.className = "play";
}

var constraints = {
  audio: false,
  video: {
    facingMode: 'environment'
  }
};

function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

function toPercentage(real) {
  return Math.round(real * 100);
}

var source   = document.getElementById("entry-template").innerHTML;
var template = Handlebars.compile(source);

var productsource = document.getElementById("product").innerHTML;
var productTemplate = Handlebars.compile(productsource);

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

//////  Clarifai  ////////

const app = new Clarifai.App({
  apiKey: 'f7ca76c0a1c2401ea7168971e71c12eb'
});

function predict(model, imgUrl) {
  return app.models.predict(model, imgUrl)
    .then(res => {
      const bestMatch = res.rawData.outputs[0].data.concepts[0].name;
      const bestValue = res.rawData.outputs[0].data.concepts[0].value;

      let percentage = toPercentage(bestValue);

      let outputDiv = document.getElementById('results');
      let output = template({percentage: percentage});

      if (bestMatch in products) {
        // get values from products list.
        let product = products[bestMatch];
        // add the percentage
        product.percentage = percentage;
        output += productTemplate(product);
      }

      outputDiv.innerHTML = output;

    });
}
