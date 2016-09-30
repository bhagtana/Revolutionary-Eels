import React from 'react';

const AppVideo = () => { 

  return (
    <div>
      <div className="vid-labels">
        <label for="localVideo" className="vid-left">Your Webcam Feed</label>
        <label for="remoteVideo" className="vid-right">Their Webcam Feed</label>
      </div>
      <div className="vid-box">        
        <div className="vid-left">
          <video id="localVideo" className="videoElement" autoPlay="true"></video>
        </div>
        <div className="vid-right">
          <video id="remoteVideo" className="videoElement" autoPlay="true"></video>
        </div>
      </div>
      <div className="button-row">
        <div className="button-box">
          <button id="startButton">Start</button>
        </div>  
        <div className="button-box">
          <button id="callButton">Call</button>
        </div>
        <div className="button-box">
          <button id="stopButton">Hang Up</button>
        </div>  
      </div>
    </div>
  )
  
};

export default AppVideo;
