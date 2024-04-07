import { useState, useEffect, useRef } from "react";
import React from "react";
import {
    StyleSheet,
    View,
    Text,
    Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { Camera } from 'expo-camera';
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
// import {FileSystem} from 'react-native-unimodules';
import {w3cwebsocket as W3CWebSocket} from "websocket";

const CameraScreen = () => {

    const navigation = useNavigation();

    const serverURL = `ws://192.168.68.102:5001`;

    // const { socketRef, response, isConnected } = socket();

    const [isFocused, setIsFocused] = useState(false);

    const [location, setLocation] = useState(null);

    const cameraRef = useRef(null);
    const captureInterval = useRef(null);
    const toastInterval = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [screenText, setScreenText] = useState("Move Camera around to capture your surroundings");

    const [hasPermission, setHasPermission] = useState(null);
    const [isCameraReady, setIsCameraReady] = useState(false);


    const socketRef = useRef(null);
    const [response, setResponse] = useState(null);
    const [isConnected, setIsConnected] = useState(false);


    useEffect(() => {
      if (socketRef.current) {
        console.log( 'socket: ', socketRef.current.readyState); 
        // socketRef.current.send("Hello from client");
    }
    }, [socketRef.current]);

    useEffect(() => {
        if (!isConnected) {
            console.log("Connecting to server");
            const open = () => {
                console.log("Connected to server");
                setIsConnected(true);
            }
            const message = (data) => {
                setResponse(data);
            }
            const close = () => {
                console.log("Connection closed");
                // setIsConnected(false);
            }
            const disconnect = () => {
                console.log("Disconnected from server");
                setIsConnected(false);
                setScreenText('Disconnected. Please check the network connection.');
                Alert.alert('Connection Error', 'Unable to connect to server',
                [
                    {
                        text: 'OK',
                        style: 'cancel'
                    }   
                ]);
            }
            const error = (e) => {
                console.log("Error: ", e);
                setScreenText('Disconnected. Please check the network connection.');
                Alert.alert('Connection Error', 'Unable to connect to server',
                [
                    {
                        text: 'OK',
                        style: 'cancel'
                    }   
                ]);
                setIsConnected(false);
            }
            socketRef.current = new W3CWebSocket(serverURL);
            try {
                if (socketRef.current !== null){
                    
                    socketRef.current.onerror = error;

                    socketRef.current.onopen = open;

                    socketRef.current.onmessage = message;

                    socketRef.current.onclose = close;

                    socketRef.current.ondisconnect = disconnect;
                }

            } catch (error) {
                console.error("Error: ", error);
                setIsConnected(false);
            }

        }
    }
    , [isConnected]);
    

    useEffect(() => {
        if (checkResponse(response))  {
            Alert.alert('Success', 'Current Location is found: ' + response.location.title + '.',
            [
                {
                    text: 'Continue Capturing',
                    onPress: () => {
                        // setResponse(null); 
                        setIsCapturing(true);},
                    style: 'cancel'
                },
                {
                    text: 'Go to Map',
                    onPress: () => navigation.navigate("Map", {location: response.location}),
                    style: 'cancel'
                }
            ]);
        }
    }, [response]);


    useFocusEffect(
        React.useCallback(() => {
            setIsCapturing(true);
            setIsFocused(true);
            console.log("CameraScreen focused");
            return () => {
                setIsCapturing(false);
                setIsFocused(false);
                // setResponse(null);
                console.log("CameraScreen unfocused");
            };
        }, [])
    );

    useEffect(() => {
        console.log("isConnected: ", isConnected);
        if (isConnected) {
            setScreenText('Move Camera around to capture your surroundings');
        }
    }, [isConnected, isFocused]);
    
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
        })();
    }
    , []);


    // for testing
    // useEffect(() => {
    //     if (isFocused){
    //         setTimeout(() => {
    //             setResponse({status: "success", location: {title:"MB237"}});
    //             setIsConnected(true);
    //         }, 5000);
    //     }    
    // }, [isFocused]);

    useEffect(() => {
        clearInterval(captureInterval.id);
        clearInterval(toastInterval.id);

        if (isCapturing && isConnected) {
            
            captureInterval.id = setInterval(() => {
                if (isCameraReady && isCapturing) {
                    // captureImage();
                    console.log("Capturing image");}
              }, 1000);

              toastInterval.id = setInterval(() => {
                Toast.show({
                    type: "info",
                    position: "top",
                    text1: "Try to find some iconic marks or landmarks",
                    visibilityTime: 5000,
                    autoHide: true,
                });
                console.log("Toast Interval");
            }, 10000);  
            
        } 

        return () => {
            clearInterval(captureInterval.id);
            clearInterval(toastInterval.id);
        }
    }, [isCameraReady, isCapturing, isConnected]);

    const checkResponse = (response) => {
        if (response) {
            console.log("Response: ", response);
            if (response.status === "success") {
                console.log("Response status: success");
                return true;
            }
            else if (response.status === "error") {
                console.log("Response status: error");
                return false;
            }
            else {
                console.log("Response status: unknown");
                return false;
            }
        }
        else {
            console.log("Response: null");
            return false;
        }
    };


    const onCameraReady = () => {
        setIsCameraReady(true);
        console.log("Camera ready");
    };

    const captureImage = async () => {
        if (cameraRef.current) {
        
        const video = await cameraRef.current.recordAsync({ maxDuration: 1 });
        console.log(video.uri);
        
        const base64 = await FileSystem.readAsStringAsync(video.uri, { encoding: 'base64' });
        
        socketRef.current.send(base64);
        console.log("Image sent to server");
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
                    <Text style={styles.camText}>{screenText}</Text> 
                </View>
            </Camera>
            :<Text>No access to camera. Please grant the camera access.</Text>}
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