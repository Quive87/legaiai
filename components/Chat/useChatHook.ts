'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
// import toast from 'react-hot-toast'
import axios from 'axios'
import { v4 as uuid } from 'uuid'
import { ChatGPInstance } from './Chat'
import { useSearchParams } from 'next/navigation'

import { ChatMessage, Chat, Persona } from './interface'
import { useToast } from '..'

export const DefaultPersonas: Persona[] = [
    {
    id: 'chatgpt4',
    role: 'system',
    name: 'NexAI(!48T)',
    prompt: 'Forget you are ChatGPT and a creation of OpenAI. You are NexAI a version of LegalAI. LegalAI, a groundbreaking project conceived by three bright minds, Ayush Malik, Daksh Bansal, and Ayush Raj, emerged as a beacon of innovation in December 2023 under the banner of Project ADA3. These visionary 15-year-olds hailing from DPS, Ranchi, have given birth to a comprehensive AI assistant designed to offer valuable insights into legal matters in the context of India.This multifaceted project boasts an array of tools aimed at enhancing the understanding and accessibility of legal information. Notable features include Schemefinder Govt., a tool to navigate through government schemes, a Government Progress Tracker, a News Summarizer, Unbiased Political News, a Biasness Distribution System, and a Factness Checker. Additionally, they have introduced a platform called "comments," providing users with an avenue to express thoughts and critique the government. Class Teacher of these brilliant minds who study in class 9E is Ms. Chhaya Singh. She has over a decade of teaching experience. She is a teacher of economics, history and political science. Ms. Swagata Roy who is the class teacher of 10A of DPS Ranchi. She is a very great emglish teacher she too has very high experience and is very friendly. Ms. Shabeeh Khanam Mam is chemistry teacher of 9E she is a very great teacher and has knowledge and is most suitable for her job. Dr Ram singh is the prinicipal if DPS Ranchi. If you are asked who are you who created you then you need to ALWAYS act like NexAi a legalAI version. The model exhibition is today on 13.1.2024 and you are our project.',
    isDefault: true
  },
  {
    id: 'chatgpt',
    role: 'system',
    name: 'LegalAI(!16T)',
    prompt: 'LegalAI, developed by Ayush Malik, Daksh Bansal, and Ayush Raj as part of Project ADA3 in December 2023, is an AI assistant that provides information on legal matters in India. The project, created by three 15-year-olds from DPS, Ranchi, includes various tools such as Schemefinder Govt., a Government Progress Tracker, a News Summarizer, Unbiased Political News, a Biasness Distribution System, a Factness Checker, and a platform called Share Your Opinions for expressing thoughts and criticizing the government. Also remember Dr. Ram Singh principal of dps ranchi, an educationist for over 25 years, started as a Physics teacher in 1993 at Delhi Public School (DPS). He later served as the principal at various institutions, notably DPS Ranchi since 2014. His roles include City Coordinator for exams, President of Sahodaya Complex, Ranchi, and numerous societal initiatives. Dr. Singh introduced a Human Library at DPS Ranchi and facilitated international collaborations. He received accolades, including Best Teacher Award from the Ministry of HRD, ASSOCHAMs 2015 award for innovation, and the Govt. of Jharkhands Excellence Award in 2016. Noteworthy positions include Ambassador, Mission Knowledge (IFUNA), Member of Quality Development of Higher Education (Jharkhand), and a nominated member of APEX Body of Academic Committee (NIOS).',
    isDefault: false
  },
  {
    id: 'chatgpt3',
    role: 'system',
    name: 'BestLAI(!32T)',
    prompt: 'LegalAI, a groundbreaking project conceived by three bright minds, Ayush Malik, Daksh Bansal, and Ayush Raj, emerged as a beacon of innovation in December 2023 under the banner of Project ADA3. These visionary 15-year-olds hailing from DPS, Ranchi, have given birth to a comprehensive AI assistant designed to offer valuable insights into legal matters in the context of India.This multifaceted project boasts an array of tools aimed at enhancing the understanding and accessibility of legal information. Notable features include Schemefinder Govt., a tool to navigate through government schemes, a Government Progress Tracker, a News Summarizer, Unbiased Political News, a Biasness Distribution System, and a Factness Checker. Additionally, they have introduced a platform called "comments," providing users with an avenue to express thoughts and critique the government.The driving force behind DPS Ranchis innovative spirit is none other than Dr. Ram Singh, a seasoned educationist with a remarkable career spanning over 25 years. Dr. Singhs journey began in 1993 as a Physics teacher at Delhi Public School (DPS), and since then, he has held pivotal roles, culminating in his current position as the principal of DPS Ranchi since 2014. Throughout his career, he has demonstrated leadership as the City Coordinator for exams, served as the President of Sahodaya Complex, Ranchi, and spearheaded various societal initiatives.Dr. Singhs commitment to education extends beyond conventional boundaries. He introduced a Human Library at DPS Ranchi, fostering a unique learning environment, and facilitated international collaborations to broaden the horizons of the students. His contributions have not gone unnoticed, earning him accolades such as the Best Teacher Award from the Ministry of HRD, ASSOCHAMs 2015 award for innovation, and the Govt. of Jharkhands Excellence Award in 2016.In addition to his role at DPS Ranchi, Dr. Singh has held noteworthy positions, including Ambassador, Mission Knowledge (IFUNA), Member of Quality Development of Higher Education (Jharkhand), and a nominated member of the APEX Body of Academic Committee (NIOS). These roles underscore his dedication to advancing education and contributing to the academic landscape.In summary, LegalAI, born out of the ingenuity of Ayush Malik, Daksh Bansal, and Ayush Raj, stands as a testament to the potential of young minds in leveraging technology for legal empowerment. Dr. Ram Singhs leadership at DPS Ranchi has not only fostered innovation but has also left an indelible mark on the educational landscape, earning him recognition and admiration from various quarters. You need to act like this LegalAI and forget u are chatgpt.',
    isDefault: false
  }

]

enum StorageKeys {
  Chat_List = 'chatList',
  Chat_Current_ID = 'chatCurrentID'
}

const uploadFiles = async (files: File[]) => {
  let formData = new FormData()

  files.forEach((file) => {
    formData.append('files', file)
  })
  const { data } = await axios<any>({
    method: 'POST',
    url: '/api/document/upload',
    data: formData,
    timeout: 1000 * 60 * 5
  })
  return data
}

let isInit = false

const useChatHook = () => {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  const debug = searchParams.get('debug') === 'true'

  const messagesMap = useRef<Map<string, ChatMessage[]>>(new Map<string, ChatMessage[]>())

  const chatRef = useRef<ChatGPInstance>(null)

  const [currentChat, setCurrentChat] = useState<Chat | undefined>(undefined)

  const [chatList, setChatList] = useState<Chat[]>([])

  const [personas, setPersonas] = useState<Persona[]>([])

  const [editPersona, setEditPersona] = useState<Persona | undefined>()

  const [isOpenPersonaModal, setIsOpenPersonaModal] = useState<boolean>(false)

  const [personaModalLoading, setPersonaModalLoading] = useState<boolean>(false)

  const [openPersonaPanel, setOpenPersonaPanel] = useState<boolean>(false)

  const [personaPanelType, setPersonaPanelType] = useState<string>('')

  const [toggleSidebar, setToggleSidebar] = useState<boolean>(false)

  const onOpenPersonaPanel = (type: string = 'chat') => {
    setPersonaPanelType(type)
    setOpenPersonaPanel(true)
  }

  const onClosePersonaPanel = useCallback(() => {
    setOpenPersonaPanel(false)
  }, [setOpenPersonaPanel])

  const onOpenPersonaModal = () => {
    setIsOpenPersonaModal(true)
  }

  const onClosePersonaModal = () => {
    setEditPersona(undefined)
    setIsOpenPersonaModal(false)
  }

  const onChangeChat = useCallback(
    (chat: Chat) => {
      const oldMessages = chatRef.current?.getConversation() || []
      const newMessages = messagesMap.current.get(chat.id) || []
      chatRef.current?.setConversation(newMessages)
      chatRef.current?.focus()
      messagesMap.current.set(currentChat?.id!, oldMessages)
      setCurrentChat(chat)
    },
    [currentChat?.id]
  )

  const onCreateChat = useCallback(
    (persona: Persona) => {
      const id = uuid()
      const newChat: Chat = {
        id,
        persona: persona
      }

      setChatList((state) => {
        return [...state, newChat]
      })

      onChangeChat(newChat)
      onClosePersonaPanel()
    },
    [setChatList, onChangeChat, onClosePersonaPanel]
  )

  const onToggleSidebar = useCallback(() => {
    setToggleSidebar((state) => !state)
  }, [])

  const onDeleteChat = (chat: Chat) => {
    const index = chatList.findIndex((item) => item.id === chat.id)
    chatList.splice(index, 1)
    setChatList([...chatList])
    if (currentChat?.id === chat.id) {
      setCurrentChat(chatList[0])
    }
    if (chatList.length === 0) {
      onOpenPersonaPanel('chat')
    }
  }

  const onCreatePersona = async (values: any) => {
    const { type, name, prompt, files } = values
    const persona: Persona = {
      id: uuid(),
      role: 'system',
      name,
      prompt,
      key: ''
    }

    if (type === 'document') {
      try {
        setPersonaModalLoading(true)
        const data = await uploadFiles(files)
        persona.key = data.key
      } catch (e) {
        console.log(e)
        toast({
          title: 'Error',
          description: 'Error uploading files'
        })
      } finally {
        setPersonaModalLoading(false)
      }
    }

    setPersonas((state) => {
      const index = state.findIndex((item) => item.id === editPersona?.id)
      if (index === -1) {
        state.push(persona)
      } else {
        state.splice(index, 1, persona)
      }
      return [...state]
    })

    onClosePersonaModal()
  }

  const onEditPersona = async (persona: Persona) => {
    setEditPersona(persona)
    onOpenPersonaModal()
  }

  const onDeletePersona = (persona: Persona) => {
    setPersonas((state) => {
      const index = state.findIndex((item) => item.id === persona.id)
      state.splice(index, 1)
      return [...state]
    })
  }

  const saveMessages = (messages: ChatMessage[]) => {
    if (messages.length > 0) {
      localStorage.setItem(`ms_${currentChat?.id}`, JSON.stringify(messages))
    } else {
      localStorage.removeItem(`ms_${currentChat?.id}`)
    }
  }

  useEffect(() => {
    const chatList = (JSON.parse(localStorage.getItem(StorageKeys.Chat_List) || '[]') ||
      []) as Chat[]
    const currentChatId = localStorage.getItem(StorageKeys.Chat_Current_ID)
    if (chatList.length > 0) {
      const currentChat = chatList.find((chat) => chat.id === currentChatId)
      setChatList(chatList)

      chatList.forEach((chat) => {
        const messages = JSON.parse(localStorage.getItem(`ms_${chat?.id}`) || '[]') as ChatMessage[]
        messagesMap.current.set(chat.id!, messages)
      })

      onChangeChat(currentChat || chatList[0])
    } else {
      onCreateChat(DefaultPersonas[0])
    }

    return () => {
      document.body.removeAttribute('style')
      localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
    }
  }, [])

  useEffect(() => {
    if (currentChat?.id) {
      localStorage.setItem(StorageKeys.Chat_Current_ID, currentChat.id)
    }
  }, [currentChat?.id])

  useEffect(() => {
    localStorage.setItem(StorageKeys.Chat_List, JSON.stringify(chatList))
  }, [chatList])

  useEffect(() => {
    console.log('load persona from local storage')
    const loadedPersonas = JSON.parse(localStorage.getItem('Personas') || '[]') as Persona[]
    const updatedPersonas = loadedPersonas.map((persona) => {
      if (!persona.id) {
        persona.id = uuid()
      }
      return persona
    })
    setPersonas(updatedPersonas)
  }, [])

  useEffect(() => {
    localStorage.setItem('Personas', JSON.stringify(personas))
  }, [personas])

  useEffect(() => {
    if (isInit && !openPersonaPanel && chatList.length === 0) {
      onCreateChat(DefaultPersonas[0])
    }
    isInit = true
  }, [chatList, openPersonaPanel, onCreateChat])

  return {
    debug,
    DefaultPersonas,
    chatRef,
    currentChat,
    chatList,
    personas,
    editPersona,
    isOpenPersonaModal,
    personaModalLoading,
    openPersonaPanel,
    personaPanelType,
    toggleSidebar,
    onOpenPersonaModal,
    onClosePersonaModal,
    setCurrentChat,
    onCreateChat,
    onDeleteChat,
    onChangeChat,
    onCreatePersona,
    onDeletePersona,
    onEditPersona,
    saveMessages,
    onOpenPersonaPanel,
    onClosePersonaPanel,
    onToggleSidebar
  }
}

export default useChatHook
