document.addEventListener('contextmenu', (event) => event.preventDefault());

// Convert a WinCC Unified color number to a standard HTML5 color string,
// e.g. "0xFF00FF00" (#Alpha-Red-Green-Blue) to "rgba(0,255,0,255)" (rgba(Red,Green,Blue,Alpha))
function toColor(num) {
  num >>>= 0;
  var b = num & 0xff,
    g = (num & 0xff00) >>> 8,
    r = (num & 0xff0000) >>> 16,
    a = ((num & 0xff000000) >>> 24) / 255;

  return 'rgba(' + [r, g, b, a].join(',') + ')';
}

//==========================================
const canIRun = navigator.mediaDevices.getDisplayMedia;

function takeScreenShot() {
  const canvas = document.getElementById('fake');
  let track = null;
  let bitmap = null;
  let Taken = false;

  navigator.mediaDevices
    .getDisplayMedia({
      video: { mediaSource: 'screen' },
    })
    .then((res) => {
      track = res.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      imageCapture.grabFrame().then((res) => {
        bitmap = res;
        track.stop();
        let d = new Date();
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext('2d');
        context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
        const a = document.createElement('a');
        a.download = `${d.toLocaleDateString()}-${d.toLocaleTimeString()}_AutomationSet.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
        Taken = true;
        WebCC.Events.fire('ScreenshotTaken', Taken);
      });
    });
}

const button = (document.getElementById('cake').onclick = () =>
  canIRun ? takeScreenShot() : {});
//-------------
function Screenshot() {
  canIRun ? takeScreenShot() : {};
}
//==========================================

function setProperty(data) {
  switch (data.key) {
    case 'backgroundColor':
      document.body.style.backgroundColor = toColor(data.value);
      break;
  }
}

WebCC.start(
  function (result) {
    if (result) {
      console.log('connected successfully');
      setProperty({
        key: 'backgroundColor',
        value: WebCC.Properties.backgroundColor,
      });
      // Subscribe for value changes
      WebCC.onPropertyChanged.subscribe(setProperty);
    } else {
      console.log('connection failed');
    }
  },
  // contract (see also manifest.json)
  {
    // Methods
    methods: {
      Screenshot: function () {
        Screenshot();
      },
    },
    // Events
    events: ['ScreenshotTaken'],
    // Properties
    properties: {
      backgroundColor: 4294967295,
    },
  },
  // placeholder to include additional Unified dependencies (not used in this example)
  [],
  // connection timeout
  10000
);
