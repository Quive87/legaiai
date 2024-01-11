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
    const bengaliCharacters = /[\u0980-\u09FF]/; // Bengali Unicode range
    const englishCharacters = /[a-zA-Z]/; // English characters

    if (hindiCharacters.test(text)) {
      return 'hi-IN'; // Detected as Hindi
    } else if (bengaliCharacters.test(text)) {
      return 'bn-IN'; // Detected as Bengali
    } else if (englishCharacters.test(text)) {
      return 'en-US'; // Detected as English
    } else {
      return 'hi-IN'; // Default to English if not sure
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
      const voice = speechSynthesis.getVoices().find((v) => v.name === 'Google हिन्दी');
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