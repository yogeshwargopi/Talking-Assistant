import React, { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { Mic, MicOff } from 'lucide-react';
import Avatar from "./Avatar";
import VoiceAndLipSync from "./VoiceAndLipSync";
import { MessageCircle, X } from 'lucide-react'; // Add this import at the top
import WaveAnimation from "./WaveAnimation";

const AvatarViewer = () => {
    const [currentAudio, setCurrentAudio] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [userText, setUserText] = useState('');
    const recognitionRef = useRef(null);
    const avatarRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [showMessages, setShowMessages] = useState(false);
    const [isMessageOpen, setIsMessageOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);


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
                setIsLoading(true);
                setMessages(prev => [...prev, 
                    { type: 'user', text: transcript }
                ]);

                const response = await fetch('/api/getUserInput', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: transcript })
                });

                if (!response.ok) throw new Error('Network response was not ok');
                console.log(response);
                
                const audioBlob = await response.blob();
                const textResponse = response.headers.get('Text-Response');

                console.log("textResponse", textResponse);
                

                setMessages(prev => [...prev,
                    { type: 'assistant', text: textResponse }
                ]);
                
                // Create audio element and play
                const audioUrl = URL.createObjectURL(audioBlob);
                setCurrentAudio(audioUrl);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                // Stop loading regardless of success or failure
                setIsLoading(false);
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

    useEffect(() => {
        if (messages.length > 0 && !showMessages) {
            setShowMessages(true);
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' && !isListening && !e.repeat) {
                e.preventDefault(); // Prevent page scrolling
                startListening();
            }
        };
    
        const handleKeyUp = (e) => {
            if (e.code === 'Space' && isListening) {
                e.preventDefault();
                stopListening();
            }
        };
    
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    
        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isListening, isLoading]);

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

    const toggleMessages = () => {
        setIsMessageOpen(!isMessageOpen);
    };

    return (
        <>
            {/* Mic Button Container - Fixed at bottom */}
            <div className="absolute bottom-4 left-4 z-50">
            <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`p-3 rounded-xl 
                    ${isListening ? 'bg-[#1a7431]' : 'bg-[#2dc653]'}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'} 
                    border-none flex items-center justify-center w-[50px] h-[50px] 
                    shadow-lg relative group text-white`}
                title={isLoading ? "Please wait..." : "Press and hold spacebar to record"}
            >
                {isListening ? 
                    <WaveAnimation /> : 
                    <Mic size={24} />
                }
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                    bg-black/75 text-white text-xs py-1 px-2 rounded opacity-0 
                    group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {isLoading ? "Please wait..." : "Press Space"}
                </span>
            </button>
            </div>

            <button 
                onClick={toggleMessages}
                className="fixed right-4 bottom-4 z-50 p-3 rounded-xl bg-[#2dc653] 
                border-none cursor-pointer flex items-center justify-center w-[50px] h-[50px] 
                shadow-lg hover:opacity-90 md:hidden" // hidden on desktop
            >
                {isMessageOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Messages Container */}
            <div 
                className={`fixed right-0 bottom-0 z-40 transition-transform duration-300 
                ease-in-out w-full md:w-auto md:right-4 md:bottom-4 
                 ${isMessageOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}
                ${showMessages ? 'md:translate-y-0' : 'md:translate-y-full'}`}
            >
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 w-full 
                    sm:w-[250px] md:w-[350px] lg:w-[500px] 
                    max-h-[50vh] overflow-y-auto shadow-lg">
                    <div className="flex flex-col">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`mb-2 p-2 rounded animate-slideUp ${
                                    message.type === 'user' 
                                        ? 'bg-[#7ae582] text-right ml-auto mw-[60%]' 
                                        : 'bg-gray-100 text-left w-[60%]'
                                }`}
                            >
                                {message.text}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </div>

            {isLoading && (
                <div className="fixed top-4 right-4 z-50 bg-black/75 text-white px-4 py-2 rounded-lg 
                    animate-pulse flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-white rounded-full animate-bounce"></span>
                    <span>Thinking...</span>
                </div>
            )}

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