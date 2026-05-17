'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, MessageCircle, Sparkles, X } from 'lucide-react'

import { cn } from '@/src/lib/utils'

type Message = {
  role: 'user' | 'bot'
  text: string
}

const QUICK_QA = [
  {
    question: 'How do I buy a book?',
    answer:
      'Open any book details page, tap Buy Now or Add to Cart, and complete the static checkout flow to place it in your library.',
  },
  {
    question: 'How does My Library work?',
    answer:
      'Purchased demo books appear in My Library automatically. From there, users can open the protected reader view.',
  },
  {
    question: 'Can users read on mobile?',
    answer:
      'Yes. The UI is mobile-first, with responsive cards, simplified catalog browsing, and a clean reader layout designed for smaller screens.',
  },
  {
    question: 'Is downloading allowed?',
    answer:
      'No. The reader intentionally shows a secured-book message and disables download and sharing controls in the interface.',
  },
]

export function ChatbotWidget() {
  const THINKING_DELAY_MS = 2400
  const THINKING_STEPS = ['Understanding your question', 'Checking the demo flow', 'Preparing the answer']

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Hi, I am BookVault AI Assistant. Ask one of the quick questions below for a guided demo answer.',
    },
  ])
  const [isThinking, setIsThinking] = useState(false)
  const [typingText, setTypingText] = useState('')
  const [thinkingStep, setThinkingStep] = useState(0)

  const thinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const thinkingStepRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const box = scrollRef.current
    if (!box) return
    box.scrollTop = box.scrollHeight
  }, [messages, isThinking, typingText, isOpen])

  useEffect(() => {
    return () => {
      if (thinkTimerRef.current) clearTimeout(thinkTimerRef.current)
      if (thinkingStepRef.current) clearInterval(thinkingStepRef.current)
      if (typeTimerRef.current) clearInterval(typeTimerRef.current)
    }
  }, [])

  const askQuestion = (question: string, answer: string) => {
    const currentRequestId = ++requestIdRef.current

    if (thinkTimerRef.current) clearTimeout(thinkTimerRef.current)
    if (thinkingStepRef.current) clearInterval(thinkingStepRef.current)
    if (typeTimerRef.current) clearInterval(typeTimerRef.current)

    setMessages((prev) => [...prev, { role: 'user', text: question }])
    setIsThinking(true)
    setTypingText('')
    setThinkingStep(0)

    thinkingStepRef.current = setInterval(() => {
      setThinkingStep((prev) => (prev + 1) % THINKING_STEPS.length)
    }, 900)

    thinkTimerRef.current = setTimeout(() => {
      if (requestIdRef.current !== currentRequestId) return

      setIsThinking(false)
      if (thinkingStepRef.current) clearInterval(thinkingStepRef.current)

      let i = 0
      typeTimerRef.current = setInterval(() => {
        if (requestIdRef.current !== currentRequestId) {
          if (typeTimerRef.current) clearInterval(typeTimerRef.current)
          return
        }

        i += 1
        setTypingText(answer.slice(0, i))

        if (i >= answer.length) {
          if (typeTimerRef.current) clearInterval(typeTimerRef.current)
          setMessages((prev) => [...prev, { role: 'bot', text: answer }])
          setTypingText('')
        }
      }, 14)
    }, THINKING_DELAY_MS)
  }

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-28 right-4 z-[60] w-[min(92vw,380px)] overflow-hidden rounded-[28px] border border-cyan-200 bg-cyan-50 shadow-2xl dark:border-cyan-500/30 dark:bg-[#08111f] sm:bottom-24">
          <div className="flex items-center justify-between border-b border-cyan-100 bg-gradient-to-r from-cyan-50 to-blue-50 px-4 py-3 dark:border-white/10 dark:from-cyan-500/15 dark:to-blue-500/15">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-cyan-600 text-white shadow-sm">
                <Bot className="h-4 w-4" />
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-blue-500 p-0.5">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              </div>
              <div>
                <span className="block text-[13px] font-semibold text-gray-900 dark:text-white">BookVault AI</span>
                <span className="block text-[10.5px] text-gray-500 dark:text-gray-400">Static smart demo assistant</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 text-gray-500 hover:bg-white/80 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[48vh] space-y-2 overflow-y-auto bg-white/85 px-3 py-3 dark:bg-[#0b1220]/80">
            {messages.map((message, idx) => (
              <div key={`${message.role}-${idx}`} className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('flex max-w-[88%] items-start gap-2', message.role === 'user' && 'flex-row-reverse')}>
                  {message.role === 'bot' ? (
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      'rounded-2xl px-3 py-2 text-[12.5px] leading-relaxed',
                      message.role === 'user'
                        ? 'bg-cyan-600 text-white dark:bg-cyan-500'
                        : 'bg-gray-100 text-gray-700 dark:bg-slate-700/60 dark:text-gray-100',
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              </div>
            ))}

            {isThinking ? (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-[190px] rounded-2xl bg-gray-100 px-3 py-2.5 text-[12px] text-gray-600 dark:bg-slate-700/60 dark:text-gray-200">
                    <div className="font-medium">{THINKING_STEPS[thinkingStep]}...</div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:0ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:120ms]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:240ms]" />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {typingText ? (
              <div className="flex justify-start">
                <div className="flex max-w-[88%] items-start gap-2">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl bg-gray-100 px-3 py-2 text-[12.5px] text-gray-700 dark:bg-slate-700/60 dark:text-gray-100">
                    {typingText}
                    <span className="ml-0.5 inline-block h-3 w-[1.5px] animate-pulse bg-cyan-500 align-middle" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-cyan-100 px-3 py-3 dark:border-white/10">
            <p className="mb-2 text-[11px] font-medium text-gray-500 dark:text-gray-400">Quick Questions</p>
            <div className="grid grid-cols-1 gap-1.5">
              {QUICK_QA.map((qa) => (
                <button
                  key={qa.question}
                  onClick={() => askQuestion(qa.question, qa.answer)}
                  disabled={isThinking || Boolean(typingText)}
                  className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-left text-[12px] text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-200 dark:hover:bg-white/[0.06]"
                >
                  {qa.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-24 right-4 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-500 text-white shadow-[0_16px_40px_rgba(6,182,212,0.35)] transition-all hover:scale-105 hover:from-cyan-500 hover:to-blue-400 sm:bottom-6"
        title="Open AI Chatbot"
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          <Sparkles className="absolute -right-1.5 -top-1.5 h-3.5 w-3.5" />
        </div>
      </button>
    </>
  )
}
