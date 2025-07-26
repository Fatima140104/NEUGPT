import { useEffect, useState, useRef, useCallback } from 'react';
import useToast from '@/hooks/useToast';
import { NotificationSeverity } from '@/common/types';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface UseSpeechInputProps {
  onTranscript: (text: string, isFinal: boolean) => void;
}

export const useSpeechInput = ({ onTranscript }: UseSpeechInputProps) => {
  const { showToast } = useToast();
  const [listening, setListening] = useState(false);
  const [browserSupportsSpeechRecognition, setBrowserSupportsSpeechRecognition] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setBrowserSupportsSpeechRecognition(true);
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      // recognitionInstance.lang = 'vi-VN';
      
      recognitionInstance.onstart = () => {
        setListening(true);
      };
      
      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const lastResultIndex = event.results.length - 1;
        const lastResult = event.results[lastResultIndex];
        const transcript = lastResult[0].transcript;
        
        if (lastResult.isFinal) {
          onTranscript(transcript, true);
        } else {
          onTranscript(transcript, false);
        }
      };
      
      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setListening(false);
        
        if (event.error !== 'no-speech') {
          showToast({
            message: "Lỗi nhận diện giọng nói. Vui lòng thử lại!",
            severity: NotificationSeverity.ERROR,
            duration: 3000,
          });
        }
      };
      
      recognitionInstance.onend = () => {
        setListening(false);
      };
      
      recognitionRef.current = recognitionInstance;
    } else {
      setBrowserSupportsSpeechRecognition(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript, showToast]);

  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      showToast({
        message: "Trình duyệt không hỗ trợ nhận diện giọng nói!",
        severity: NotificationSeverity.ERROR,
        duration: 3000,
      });
      return;
    }

    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      showToast({
        message: "Đang lắng nghe... Hãy nói điều gì đó!",
        severity: NotificationSeverity.INFO,
        duration: 2000,
      });
    }
  }, [browserSupportsSpeechRecognition, listening, showToast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && listening) {
      recognitionRef.current.stop();
    }
  }, [listening]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  return {
    listening,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    toggleListening,
  };
}; 