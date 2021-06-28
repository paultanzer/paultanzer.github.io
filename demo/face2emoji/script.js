const video = document.getElementById('video');
const statusElement = document.getElementById('status');
let oldName = 'neutral';
const that = this;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    //const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    that.updateStatus(detections);
    
  }, 1000)
})

function updateStatus(detections) {
  let exp = this.findBestExpression(detections);
  if (exp && exp.name !== oldName) {
    oldName = exp.name;
    //statusElement.innerHTML=`<h2>${exp.name}</h2>`;
    statusElement.innerHTML=`&#x${this.getEmojiCode(exp)}`;
    
  }
}

function findBestExpression(detections) {
  let result = null;
  let max = -1;
  detections.forEach( d => {
    for (let [key, value] of Object.entries(d.expressions)) {
      console.log(d.expressions); 
      if (value > max) {
        result = {};
        result.name = key;
        result.value = value;
        max = value;
      }
    }
  });
  return result;
}

function getEmojiCode(exp) {
  if (exp.name === 'sad') return '1F61E';
  if (exp.name === 'angry') return '1F620';
  if (exp.name === 'neutral') return '1F610';
  if (exp.name === 'happy') return '1F600';
  if (exp.name === 'surprised') return '1F62F';
  if (exp.name === 'fearful') return '1F627';
  if (exp.name === 'disgusted') return '1F62C';
  return '1F636';

}