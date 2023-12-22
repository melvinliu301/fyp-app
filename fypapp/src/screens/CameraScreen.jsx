import { useState, useEffect, useRef } from "react";
import React from "react";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Camera } from 'expo-camera';



const CameraScreen = () => {

    const [connection, setConnection] = useState(null);
    const [response, setResponse] = useState(null);
    const [imageStream, setImageStream] = useState(null);

    const cameraRef = useRef(null);
    const captureInterval = useRef(null);
    const toastInterval = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);

    const [hasPermission, setHasPermission] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            setIsCapturing(true);
            console.log("CameraScreen focused");
            return () => {
                setIsCapturing(false);
                stopCapture();
                stopToast();
                console.log("CameraScreen unfocused");
            };
        }, [])
    );
    
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }
    , []);


    useEffect(() => {
        if (isCapturing) {
            startCapture();
            startToast();
        } else {
            stopCapture();
            stopToast();
        }
    }, [isCameraReady, isCapturing]);


    const onCameraReady = () => {
        setIsCameraReady(true);
        console.log("Camera ready");
    };

    const startCapture = () => {
        captureInterval.id = setInterval(() => {
            if (isCameraReady && isCapturing) {captureImage();
            console.log("Capturing image");}
            console.log("running");
          }, 500);
    };

    const stopCapture = () => {
        if (captureInterval.id) {
            clearInterval(captureInterval.id);
            captureInterval.id = null;
            console.log("Capture stopped");
        }
    };

    const startToast = () => {
        toastInterval.id = setInterval(() => {
            Toast.show({
                type: "info",
                position: "top",
                text1: "Try to find some iconic marks or landmarks",
                visibilityTime: 3000,
                autoHide: true,
            });
            console.log("Toast Interval");
        }, 8000);        
    }


    const stopToast = () => {
        if (toastInterval.id) {
            clearInterval(toastInterval.id);
            toastInterval.id = null;
            console.log("Toast stopped");
        }
    }


    const captureImage = async () => {
        if (cameraRef.current) {
        const { uri } = await cameraRef.current.takePictureAsync();
        console.log(uri);
        // Send the image to the server using a network request
        // You can use a library like axios to send the image data to the server
        // Example: axios.post('http://your-server-url', { imageUri: uri });
        
        }
    };

    return (
        <View style={styles.container}>
            {hasPermission? <Camera
                ref={cameraRef}
                style={styles.camera}
                type={Camera.Constants.Type.back}
                flashMode={Camera.Constants.FlashMode.off}
                ratio={"16:9"}
                onCameraReady={onCameraReady}
            >
                <View style={styles.textContainer}>
                    <Text style={styles.camText}>Move Camera around to capture your surroundings</Text> 
                </View>
            </Camera>
            :<Text>No access to camera</Text>}
            <Toast/>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    textContainer: {
        flex: 1,
        backgroundColor: "transparent",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 100,
        
    },  

    camera: {
        flex: 1,
    },

    buttonContainer: {
        flex: 1,
        backgroundColor: "transparent",
        flexDirection: "row",
        margin: 20,
    },

    button: {
        flex: 1,
        alignSelf: "flex-end",
        alignItems: "center",
    },

    camText: {
        fontSize: 16,
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        width: "70%",
        
    },
});

export default CameraScreen;
