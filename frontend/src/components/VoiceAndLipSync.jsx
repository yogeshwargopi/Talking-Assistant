import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VoiceAndLipSync = ({ meshRef, audioUrl }) => {
    const isPlayingRef = useRef(false);
    const startTimeRef = useRef(0);
    const lastMorphRef = useRef({});
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);

    useEffect(() => {
        if (!audioUrl || !meshRef.current) return;

        // Initialize Audio Context
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);

        // Load and connect audio
        fetch(audioUrl)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContextRef.current.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                const source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(analyserRef.current);
                analyserRef.current.connect(audioContextRef.current.destination);
                
                source.onended = () => {
                    isPlayingRef.current = false;
                    resetMouthShape();
                };

                source.start(0);
                isPlayingRef.current = true;
                startTimeRef.current = Date.now();
            })
            .catch(error => console.error('Error loading audio:', error));

        return () => {
            if (audioContextRef.current?.state !== 'closed') {
                audioContextRef.current?.close();
            }
            isPlayingRef.current = false;
            resetMouthShape();
        };
    }, [audioUrl]);

    useFrame(() => {
        if (!isPlayingRef.current || !analyserRef.current || !meshRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        const average = dataArrayRef.current.reduce((a, b) => a + b) / dataArrayRef.current.length;
        const normalizedValue = Math.min(average / 128, 1);

        meshRef.current.traverse((child) => {
            if (child.isMesh && child.morphTargetDictionary) {
                const morphTargets = {
                    mouthOpen: child.morphTargetDictionary['mouthOpen'],
                    jawOpen: child.morphTargetDictionary['jawOpen']
                };

                Object.entries(morphTargets).forEach(([key, index]) => {
                    if (index !== undefined) {
                        child.morphTargetInfluences[index] = normalizedValue * 0.5;
                    }
                });
            }
        });
    });

    const resetMouthShape = () => {
        if (!meshRef.current) return;

        meshRef.current.traverse((child) => {
            if (child.isMesh && child.morphTargetDictionary) {
                Object.keys(child.morphTargetDictionary).forEach(key => {
                    const index = child.morphTargetDictionary[key];
                    if (index !== undefined) {
                        child.morphTargetInfluences[index] = 0;
                    }
                });
            }
        });
        
        lastMorphRef.current = {};
    };

    return null;
};

export default VoiceAndLipSync;