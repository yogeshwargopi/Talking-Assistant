import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Mic, MicOff } from 'lucide-react';
import Avatar from "./Avatar";
import VoiceAndLipSync from "./VoiceAndLipSync";

const AvatarViewer = () => {
    const [currentAudio, setCurrentAudio] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [userText, setUserText] = useState('');
    const recognitionRef = useRef(null);
    const avatarRef = useRef(null);

    // Initialize speech recognition on component mount
    useEffect(() => {
        // Check browser support and initialize
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('Speech recognition not supported');
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            setUserText(transcript);
            
            try {
                const response = await fetch('http://localhost:7070/getUserInput', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: transcript })
                });

                if (!response.ok) throw new Error('Network response was not ok');
                
                const audioBlob = await response.blob();
                const textResponse = response.headers.get('Text-Response');
                
                // Create audio element and play
                const audioUrl = URL.createObjectURL(audioBlob);
                setCurrentAudio(audioUrl);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };
    }, []);

    const startListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.start();
            setIsListening(true);
        } else {
            console.error('Speech recognition not initialized');
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    };

    return (
        <>
            <div style={{ 
                position: 'absolute', 
                top: 10, 
                right: 10, 
                zIndex: 100 
            }}>
                <button
                    onClick={isListening ? stopListening : startListening}
                    style={{
                        padding: '12px',
                        borderRadius: '50%',
                        backgroundColor: isListening ? '#dc3545' : '#28a745',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '50px',
                        height: '50px'
                    }}
                >
                    {isListening ? 
                        <MicOff size={24} /> : 
                        <Mic size={24} />
                    }
                </button>
                {userText && (
                    <div style={{
                        marginTop: '10px',
                        padding: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '4px',
                        maxWidth: '200px'
                    }}>
                        {userText}
                    </div>
                )}
            </div>
            <Canvas camera={{ position: [0, 1.5, 2], fov: 30 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 5, 5]} intensity={1} />
                <Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="gray" /></mesh>}>
                    <Avatar ref={avatarRef} />
                    {currentAudio && (
                        <VoiceAndLipSync 
                            meshRef={avatarRef}
                            audioUrl={currentAudio}
                        />
                    )}
                    <Environment preset="city" />
                </Suspense>
                <OrbitControls 
                    target={[0, 1.5, 0]} 
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI/4}
                    maxPolarAngle={Math.PI/2}
                />
            </Canvas>
        </>
    );
};

export default AvatarViewer;