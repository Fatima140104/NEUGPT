import { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import useToast from '@/hooks/useToast';
import { NotificationSeverity } from '@/common/types';

interface UseSpeechInputProps {
  onTranscript: (text: string) => void;
}

export const useSpeechInput = ({ onTranscript }: UseSpeechInputProps) => {
  const { showToast } = useToast();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update message when transcript changes
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  const startListening = () => {
    if (!browserSupportsSpeechRecognition) {
      showToast({
        message: "Trình duyệt không hỗ trợ nhận diện giọng nói!",
        severity: NotificationSeverity.ERROR,
        duration: 3000,
      });
      return;
    }

    SpeechRecognition.startListening({ 
      continuous: true,
      interimResults: true,
    });
    
    showToast({
      message: "Đang lắng nghe... Hãy nói điều gì đó!",
      severity: NotificationSeverity.INFO,
      duration: 2000,
      showIcon: false,
    });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const toggleListening = () => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    listening,
    browserSupportsSpeechRecognition,
    startListening,
    stopListening,
    toggleListening,
  };
}; 