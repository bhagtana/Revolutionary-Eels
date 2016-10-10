var signalingChannel = io('/video');
var pc;
var pcs = {};
var userIds = {};
var streams = {};
var configuration = {'iceServers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};

function start(isCaller, pcKey, mode) {
  $('.call-views').show();

  pcs[pcKey] = new RTCPeerConnection(configuration);

  pcs[pcKey].onicecandidate = function (evt) {
    signalingChannel.emit('send candidate', JSON.stringify({ "candidate": evt.candidate, 
                                                              "isCaller": isCaller, 
                                                              "callerId": myId, 
                                                              "pcKey": pcKey, 
                                                              "mode": mode }));
  };

  pcs[pcKey].onaddstream = function (evt) {
    streams[pcKey] = evt.stream;
  };

  pcs[pcKey].oniceconnectionstatechange = function(evt) {
 
    if (pcs[pcKey] && pcs[pcKey].iceConnectionState === 'connected') {

      pcs[pcKey].status = 'connected';

      if (mode === 'direct call') {
        toggleAlertViewState(isCaller, pcKey);
      }

      changeVideoCardListViewState(pcKey, mode);

      function changeVideoCardListViewState(pcKey, mode) {
        var newVidBox = $('#vidBoxTemplate').clone().attr('id', 'vidBox___' + pcKey);
        $('.vid-scrollable-list').append(newVidBox);
        $('#vidBox___' + pcKey + ' .video-element').attr('id', 'remoteVideo___' + pcKey);
        $('#vidBox___' + pcKey + ' .stop-button').attr('id', 'stopButton___' + pcKey).unbind().on('click', function(){
          signalingChannel.emit('disconnect call', JSON.stringify({"pcKey": pcKey}));
        });
        document.querySelector("#remoteVideo___" + pcKey).src = window.URL.createObjectURL(streams[pcKey]);
        $("#vidBox___" + pcKey).show();
      };
      $('.vid-scrollable-list').show();
    }

  };

  pcs[pcKey].onsignalingstatechange = function(evt) {
    if (pcs[pcKey] && (pcs[pcKey].signalingState === 'have-local-offer' || pcs[pcKey].signalingState === 'have-remote-offer')) {
      if (mode === 'direct call') {
        toggleAlertViewState(isCaller, pcKey);
      }
      console.log("STATE IS : ", pcs[pcKey].signalingState)
    }
    if (pcs[pcKey] && pcs[pcKey].signalingState === 'closed') {
      delete pcs[pcKey];
    }
  };

  navigator.getUserMedia({ "audio": true, "video": true }, handleVideo, videoError);

  // This is one of the inputs into navigator.getUserMedia. It takes the stream from the user's webcam, sets it to the
  // local video view, 
  function handleVideo(stream) {
    //localVideo.src = window.URL.createObjectURL(stream);
    pcs[pcKey].addStream(stream);
    // If this is running inside the caller's client, creating an offer sends the description to the remote pper. 
    // If this is in the remote peer's client, the response sends back a description, but with an "answer" state. 
    if (isCaller) {
      pcs[pcKey].createOffer(setDescription, errorGettingDescription);
    } else {
      if (mode === 'direct call') {
        showIncomingCallAlerts(pc, pcKey, signalingChannel, setDescription, errorGettingDescription);
      } 
      if (mode === 'conference call') {
        pcs[pcKey].createAnswer(setDescription, errorGettingDescription);
      }
    }

    function showIncomingCallAlerts(pc, pcKey, signalingChannel, successCallback, errorCallback){
      console.log("showIncomingCallAlerts happens at: ", new Date());

      $('#acceptIcon').unbind().on('click', function(){
        pcs[pcKey].createAnswer(successCallback, errorCallback);
      });

      $('#rejectIcon').unbind().on('click', function(){
        signalingChannel.emit('disconnect call', JSON.stringify({"pcKey": pcKey}));
      });
    }

    function setDescription(desc) {
      pcs[pcKey].setLocalDescription(desc);
      signalingChannel.emit('send offer', JSON.stringify({ "sdp": desc, "callerId": myId, "pcKey": pcKey, "mode": mode}));
    };

    function errorGettingDescription(err) {
      console.log("There was an error getting the description. Error message: ", err);
    };
  };

  function videoError(error) {
    console.log("ERROR! ", error)
  };


};

// Both candidate and video stream data are emitted through 'message' events from the server's socket 
// connection.
signalingChannel.on('message', function(evt) {

  var signal = JSON.parse(evt);

  if (isConnectionAlreadyMade(signal.pcKey)) {
    console.log("You are already connected to this user.");
    return;
  }

  var users = signal.pcKey.split('---');

  if (myId == users[0].toString() || myId == users[1].toString()){
    if (areYouSignalingYourself(signal.callerId)){
      return;
    }
    // If the peer connection hasn't been made yet, invoke the start method to set up the 
    // video connection and ICE candidate signaling. Note that this will only occur in the 
    // client who did not make the call, so use start(false) to set isCaller to false
    if (!pcs[signal.pcKey]) {
      start(false, signal.pcKey, signal.mode);
    } 

    // If the sdp description is present, set the remote description. This puts the remote peer's
    // media stream into the local peer's client.
    // If the candidate is present, the ICE connection protocol is still underway; add the candidate
    // to the connection to connect the clients. 
    if (signal.sdp) {
      pcs[signal.pcKey].setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } else if (signal.candidate) {
      pcs[signal.pcKey].addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
  } 
});

// On the disconnect call event (which can come from either caller or callee) terminates the p2p connection. 
signalingChannel.on('disconnect call', function(evt){
  var signal = JSON.parse(evt);
  pcs[signal.pcKey].close();
  var remoteVideo = document.querySelector("#remoteVideo___" + signal.pcKey);
  remoteVideo.src = undefined;

  $('#vidBox___' + signal.pcKey).remove();
  $('.call-incoming-options').hide();

  // If there is only the template .vid-box element left, the there are no calls active, so the call-views can be hidden.
  if ($('.vid-box').length === 1) {
    $('.call-views').hide();
  }
});

signalingChannel.on('initialize conference call', function(evt) {
  var signal = JSON.parse(evt);
  var meshGrid = signal.meshGrid;
  var myCallsToMake = meshGrid[myId];
  if (myCallsToMake !== undefined) {
    myCallsToMake.forEach(function(pcKey, i){
      setTimeout(function(){
        initSingleCall(pcKey, 'conference call');
        console.log(new Date())
      }, i * 50);
    });
  }
});

function initConferenceCall(){
  // Grab userIds from all the users in the room.
  var userIds = getUserIds();
  var meshGrid = createMeshGrid(userIds);
  signalingChannel.emit('signal conference call', JSON.stringify({"meshGrid": meshGrid}));
}


function areYouSignalingYourself(callerId){
  // Abort if the sender's signal is sent back to the sender.
  if (callerId === myId) {
    return true;
  }
}

function isConnectionAlreadyMade(pcKey){
  var users = pcKey.split("---");
  if (pcs[users[0] + '---' + users[1]]) {
    if (pcs[users[0] + '---' + users[1]].status === 'connected') {
      return true;
    }
  }
  if ( pcs[users[1] + '---' + users[0]]) {
    if (pcs[users[1] + '---' + users[0]].status === 'connected') {
      return true;
    }
  }
};

function initSingleCall(pcKey, mode) {
  start(true, pcKey, mode);
}

function createMeshGrid(userIds) {
  var grid = {};
  for (var i = 0; i < userIds.length; i++){
    if (grid[userIds[i]] === undefined && i !== userIds.length - 1) {
      grid[userIds[i]] = [];
    }
    for (var j = i; j < userIds.length; j++){
      if (i !== j) {
        grid[userIds[i]].push(userIds[i] + '---' + userIds[j]);
      }
    }
  }
  return grid;
}

function getUserIds(){
  // These are hard-coded for testing. In production, get the ids dynamically. 
  userIds = [2, 3, 4, 5, 6];
  return userIds;
}

function toggleAlertViewState(isCaller, pcKey) {
  $('.call-alerts').toggle();
  isCaller ? toggleOutgoingState() : toggleIncomingState();

  function toggleOutgoingState(){
    console.log("toggling OUTGOING state");
    $('.call-alerts-outgoing').toggle();
    animateIcon('#callIcon', 'icon-spin');
  }

  function toggleIncomingState(){
    console.log("toggling incoming state")

    $('.call-alerts-incoming').toggle();
    $('.call-incoming-notifications').toggle();
    animateIcon('#seeOptionsIcon', 'icon-flash');
    $('#seeOptionsIcon').unbind().on('mouseover', function(){
      $('.call-incoming-notifications').css('display', 'inline-block');
      $('.call-incoming-options').css('display', 'inline-block');
    })
  }

  function animateIcon(iconId, iconClass){
    $(iconId).addClass(iconClass);
  };

}