import { useState, useEffect, useCallback, useRef } from 'react';

const useVoice = (options = { lang: 'hi-IN' }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const finalTranscriptRef = useRef('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (!SpeechRecognition) {
                setError('Speech Recognition API is not supported in this browser.');
                return;
            }

            const rec = new SpeechRecognition();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = options.lang || 'hi-IN';

            rec.onresult = (event) => {
                let currentInterim = '';
                let currentFinal = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcriptPiece = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        currentFinal += transcriptPiece + ' ';
                    } else {
                        currentInterim += transcriptPiece;
                    }
                }

                if (currentFinal) {
                    finalTranscriptRef.current += currentFinal;
                }

                setTranscript(finalTranscriptRef.current + currentInterim);
            };

            rec.onerror = (event) => {
                if (event.error !== 'aborted') {
                    console.error('Speech recognition error:', event.error);
                    setError(event.error);
                }
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            };

            recognitionRef.current = rec;

            return () => {
                if (recognitionRef.current) {
                    recognitionRef.current.abort();
                }
            }
        }
    }, [options.lang]);

    const startListening = useCallback(async () => {
        try {
            setError(null);

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mRecorder = new MediaRecorder(stream);
            const audioChunks = [];

            mRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mRecorder;
            mRecorder.start();

            if (recognitionRef.current) {
                finalTranscriptRef.current = '';
                setTranscript('');
                setAudioUrl(null);

                try {
                    recognitionRef.current.start();
                    setIsListening(true);
                } catch (e) {
                    console.error("Recognition start error:", e);
                }
            }
        } catch (err) {
            console.error('MediaRecorder setup failed:', err);
            setError('Microphone permission denied or not available.');
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsListening(false);
    }, []);

    return {
        isListening,
        transcript,
        error,
        audioUrl,
        startListening,
        stopListening,
        setTranscript
    };
};

export default useVoice;
