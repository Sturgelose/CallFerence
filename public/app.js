/*https://github.com/nwah/peerjs-audio-chat/blob/master/public/app.js*/

// Handle prefixed versions
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

// State
var me = {};
var myStream;

// keep track of all connecting peers
// def peer {
//  id,
//  MediaConnection incoming,
//  MediaStream incomingStream,
//  outgoing
//}
var peers = {};

//init(false);

// Start everything up
function init(isEndpoint) {

  console.log("peer starts to launch");


  if (!navigator.getUserMedia) return unsupported();

  // Get access to the microphone
  getLocalAudioStream(function(err, stream) {
    if (err || !stream) return;

    connectToPeerJS(isEndpoint, function(err) {
      if (err) return;

      //TODO: start to call other peers?

    });
  });
}

// Get access to the microphone, return either an Error or audioStream
function getLocalAudioStream(cb) {
  display('Trying to access your microphone. Please click "Allow".');

  navigator.getUserMedia (
    {video: false, audio: true},

    function success(audioStream) {
      display('Microphone is open.');
      myStream = audioStream;
      if (cb) cb(null, myStream);
    },

    function error(err) {
      display('Couldn\'t connect to microphone. Reload the page to try again.');
      if (cb) cb(err);
    }
  );
}


// Connect to PeerJS and get an ID
function connectToPeerJS(isEndpoint, cb) {
  display('Connecting to PeerJS...');
  if (isEndpoint)
    me = new Peer('endpoint',{host:'lionroar.herokuapp.com', secure:true, port:443, debug:true});
  else
    me = new Peer({host:'lionroar.herokuapp.com', secure:true, port:443, debug:true});

  // when someone initiates a call via PeerJS
  //Set listeners for peer events. Emitted when a remote peer attempts to call you.
  me.on('call', function(call){
    display('incoming call from ' + call.peer);

    // Must first answer the call, providing our mediaStream
    call.answer(myStream);

    // Then lister for stream event
    // call.peer is the ID of the peer on the other end of this connection.
    // keep track of the incoming call and put it into peers list
    var peer = getPeer(call.peer);
    peer.incoming = call;
    //equals to peer.incoming.on('stream', function(stream){})
    call.on('stream', function(stream) {
      // `stream` is the MediaStream of the remote peer.
      // Here you'd add it to an HTML video/canvas element.
      addIncomingStream(peer, stream);
    });
  });

  // when i open up (for calling others)
  // Emitted when a connection to the PeerServer is established.
  me.on('open', function() {
    display('Connected.');
    display('ID: ' + me.id);
    cb && cb(null, me);
  });

  me.on('error', function(err) {
    display(err);
    cb && cb(err);
  });
}

// Add the new audio stream. Either from an incoming call, or
// from the response to one of our outgoing calls
function addIncomingStream(peer, stream) {
  display('Adding incoming stream from ' + peer.id);
  peer.incomingStream = stream;
  playStream(stream);
}

// Create an <audio> element to play the audio stream
function playStream(stream) {
  console.log("audio stream should be played");
  var audio = $('<audio autoplay />').appendTo('body');
  audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);
}

// connected to PeerJS, i'm able to call other peers
function startCall(peerID) {
  console.log("start to call "+peerID);
  callPeer(peerID);
}

function callPeer(peerId) {
  display('Calling ' + peerId +'...');
  var peer = getPeer(peerId);
  peer.outgoing = me.call(peerId, myStream);

  peer.outgoing.on('error', function(err) {
    display(err);
  });

  peer.outgoing.on('stream', function(stream) {
    display('Connected to ' + peerId + '.');
    addIncomingStream(peer, stream);
  });
}

///////////helper function///////////////
// either get or add new peer into the list
function getPeer(peerId) {
  return peers[peerId] || (peers[peerId] = {id: peerId});
}

function unsupported() {
  display("Your browser doesn't support getUserMedia.");
}

function display(message) {
  $('#display').append(message+'</br>');
}
