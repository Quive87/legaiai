'use client'

import { useContext, useRef, useEffect } from 'react'
import { Avatar, Flex } from '@radix-ui/themes'
import { SiOpenai } from 'react-icons/si'
import { HiUser } from 'react-icons/hi'
import { Markdown } from '@/components'
import ChatContext from './chatContext'
import { ChatMessage } from './interface'

export interface MessageProps {
  message: ChatMessage
}
const Message = (props: MessageProps) => {
  const { currentChat } = useContext(ChatContext);
  const { role, content } = props.message;
  const isUser = role === 'user';

  const contentRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const detectLanguage = (text: string): string => {
    const hindiCharacters = /[\u0900-\u097F]/; // Hindi Unicode range
    const bengaliCharacters = /[\u0980-\u09FF\u{11000}-\u{1107F}]/u; // Bengali Unicode range (extended to include Assamese characters)
    const tamilCharacters = /[\u0B80-\u0BFF\u{0B82}-\u{0BFA}]/u; // Tamil Unicode range
    const teluguCharacters = /[\u0C00-\u0C7F]/; // Telugu Unicode range
    const marathiGujaratiCharacters = /[\u0900-\u0AFF]/; // Combined range for Marathi and Gujarati
    const gujaratiCharacters = /[\u0A80-\u0AFF]/; // Gujarati Unicode range
    const englishCharacters = /[a-zA-Z]/; // English characters

    if (hindiCharacters.test(text)) {
        return 'hi-IN'; // Detected as Hindi
    } else if (bengaliCharacters.test(text)) {
        return 'bn-IN'; // Detected as Bengali
    } else if (tamilCharacters.test(text)) {
        return 'ta-IN'; // Detected as Tamil
    } else if (teluguCharacters.test(text)) {
        return 'te-IN'; // Detected as Telugu
    } else if (marathiGujaratiCharacters.test(text)) {
        if (gujaratiCharacters.test(text)) {
            return 'gu-IN'; // Detected as Gujarati
        } else {
            return 'mr-IN'; // Detected as Marathi
        }
    } else if (englishCharacters.test(text)) {
        return 'en-US'; // Detected as English
    } else {
        return 'hi-IN'; // Default to Hindi if no language is detected
    }
};

  const readAloud = () => {
    const textToRead = contentRef.current?.innerText;
  
    if (textToRead) {
      const speechSynthesis = window.speechSynthesis;
  
      // Stop speech synthesis if already speaking
      if (utteranceRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
      }
  
      const detectedLang = detectLanguage(textToRead);
  
      const speechUtterance = new SpeechSynthesisUtterance(textToRead);
  
      // Set language based on detected language
      speechUtterance.lang = detectedLang;
  
      // Select a specific voice (adjust the name based on available voices)
      const voice = speechSynthesis.getVoices().find((v) => {
        if (detectedLang === 'mr-IN') return v.name === 'Marathi';
        if (detectedLang === 'gu-IN') return v.name === 'Gujarati';
        if (detectedLang === 'te-IN') return v.name === 'Telugu';
        if (detectedLang === 'bn-IN') return v.name === 'Bengali';
        if (detectedLang === 'ta-IN') return v.name === 'Tamil';
        return v.name === 'Google हिन्दी'; // Default to Hindi voice for other languages
      });
  
      if (voice) {
        speechUtterance.voice = voice;
      }
  
      // Adjust the rate (speed) and pitch of the speech
      speechUtterance.rate = 1; // Adjust as needed (1 is the default rate)
      speechUtterance.pitch = 1; // Adjust as needed (1 is the default pitch)
  
      // Save the utterance reference for potential future cancellation
      utteranceRef.current = speechUtterance;
  
      speechSynthesis.speak(speechUtterance);
    }
  };
  

  useEffect(() => {
    // Fetch voices when the component mounts
    const fetchVoices = () => {
      const speechSynthesis = window.speechSynthesis;
      speechSynthesis.onvoiceschanged = () => {
        // Do nothing, but this event triggers fetching of voices
      };
    };

    fetchVoices();
  }, []);

  return (
    <Flex gap="4" className="mb-5">
      <Avatar
        fallback={isUser ? <HiUser className="h-4 w-4" /> : <img src="https://dpsranchi.com/img/logo.png" className="h-4 w-4" />}
        color={isUser ? undefined : 'green'}
        size="2"
        radius="full"
      />
      <Flex direction="column" gap="2" className="flex-1 pt-1 break-all">
        <div ref={contentRef}>
          <Markdown>{content}</Markdown>
        </div>
        <button
  className="bg-purple-500 hover:bg-purple-600 text-white w-12 md:w-16 rounded-md md:rounded-lg px-2 py-1 cursor-pointer transition duration-300 mt-1 ml-1"
  style={{ backgroundColor: "#33255d" }}
  onClick={readAloud}
>
  <span role="img" aria-label="loudspeaker">
    📢
  </span>
</button>

      </Flex>
    </Flex>
  );
}

export default Message;