import React, { useState, useRef } from "react";
import {Camera} from "react-camera-pro";

const CameraButton = () => {
    const camera = useRef(null);
    const [image, setImage] = useState(null);

    return (
        <div>
            <div style={{width:"100px",height:"100px" ,zIndex:1}}>
            <Camera ref={camera}/>
            </div>
            <button onClick={() => setImage(camera.current.takePhoto())} style={{zIndex:100}}>Take photo</button>
            <img style={{width:"100px" , height:"100px"}} src={image} alt='Taken photo'/>
        </div>
    );
}

export default CameraButton;
