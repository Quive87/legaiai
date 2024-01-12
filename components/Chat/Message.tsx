'use client'

import { useContext, useRef, useEffect, useState } from 'react'
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

  // New state variables for language and voice
  const [selectedLanguage, setSelectedLanguage] = useState<string>('hi-IN');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);


  const contentRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const detectLanguage = (text: string): string => {
    const hindiCharacters = /[\u0900-\u097F]/; // Hindi Unicode range
    const bengaliCharacters = /[\u0980-\u09FF]/; // Bengali Unicode range
    const englishCharacters = /[a-zA-Z]/; // English characters
    const marathiCharacters = /[\u0900-\u097F]/; // Marathi Unicode range
    const gujaratiCharacters = /[\u0A80-\u0AFF]/; // Gujarati Unicode range
    const teluguCharacters = /[\u0C00-\u0C7F]/; // Telugu Unicode range
  
    if (hindiCharacters.test(text)) {
      return 'hi-IN'; // Detected as Hindi
    } else if (bengaliCharacters.test(text)) {
      return 'bn-IN'; // Detected as Bengali
    } else if (marathiCharacters.test(text)) {
      return 'mr-IN'; // Detected as Marathi
    } else if (gujaratiCharacters.test(text)) {
      return 'gu-IN'; // Detected as Gujarati
    } else if (teluguCharacters.test(text)) {
      return 'te-IN'; // Detected as Telugu
    } else if (englishCharacters.test(text)) {
      return 'en-US'; // Detected as English
    } else {
      return 'hi-IN'; // Default to Hindi if not sure
    }
  };
  
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
  };

  const readAloud = () => {
    const textToRead = contentRef.current?.innerText;

    if (textToRead) {
      const speechSynthesis = window.speechSynthesis;

      if (utteranceRef.current && speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
      }

      const detectedLang = detectLanguage(textToRead);

      const speechUtterance = new SpeechSynthesisUtterance(textToRead);
      speechUtterance.lang = selectedLanguage; // Use the selected language

      // Use the selected voice if available, otherwise default to system voice
      speechUtterance.voice = selectedVoice || speechSynthesis.getVoices()[0];

      speechUtterance.rate = 1;
      speechUtterance.pitch = 1;

      utteranceRef.current = speechUtterance;

      speechSynthesis.speak(speechUtterance);
    }
  };

  // Fetch voices when the selected language changes
  useEffect(() => {
    const fetchVoices = () => {
      const speechSynthesis = window.speechSynthesis;
      speechSynthesis.onvoiceschanged = () => {
        const availableVoices = speechSynthesis.getVoices();
        const selectedVoice = availableVoices.find((v) => v.lang === selectedLanguage);
        setSelectedVoice(selectedVoice || null);
      };
    };

    fetchVoices();
  }, [selectedLanguage]);

  return (
    <Flex gap="4" className="mb-5">
    {/* ... (existing code) */}
    <Flex direction="column" gap="2" className="flex-1 pt-1 break-all">
      <div ref={contentRef}>
        <Markdown>{content}</Markdown>
      </div>
      {/* Dropdown menu for selecting language */}
      {/* Container for dropdown and button */}
<div className="flex items-center">
    <button
    className="bg-purple-500 hover:bg-purple-600 text-white w-12 md:w-16 rounded-md md:rounded-lg px-2 py-1 cursor-pointer transition duration-300 mt-1 ml-1"
    style={{ backgroundColor: "#33255d" }}
    onClick={readAloud}
  >
    <span role="img" aria-label="loudspeaker">
      📢
    </span>
  </button>{/* Dropdown menu for selecting language */}
  <select
    value={selectedLanguage}
    onChange={handleLanguageChange}
    style={{ backgroundColor: "#33255d" }}
    className="bg-purple-500 hover:bg-purple-600 text-white w-16 md:w-20 rounded-md md:rounded-lg px-2 py-1 cursor-pointer transition duration-300 mt-1 ml-1"
  >
    <option value="hi-IN">Hin</option>
    <option value="bn-IN">Bngli</option>
    <option value="mr-IN">Mrthi</option>
    <option value="gu-IN">Gjrti</option>
    <option value="te-IN">Telg</option>
    <option value="en-US">Eng</option>
  </select>

  {/* Button for reading aloud */}

</div>
    </Flex>
  </Flex>
  );
}

export default Message;