"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, User, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getAIResponse } from "@/actions/chat";
import useFetch from "@/hooks/use-fetch";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const prevAiResponseRef = useRef(null);
  const textareaRef = useRef(null);

  const {
    loading: isAIResponding,
    fn: getAIResponseFn,
    data: aiResponse,
    error: aiError,
  } = useFetch(getAIResponse);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [messages]);

  // Handle AI response
  useEffect(() => {
    if (aiResponse && !isAIResponding && aiResponse !== prevAiResponseRef.current) {
      prevAiResponseRef.current = aiResponse;
      
      // Use consistent timestamp to prevent hydration issues
      const timestamp = Date.now();
      
      const aiMessage = {
        id: timestamp,
        text: aiResponse,
        sender: "ai",
        timestamp: timestamp,
      };
      setMessages((prev) => [...prev, aiMessage]);
    }
    
    if (aiError && aiError !== prevAiResponseRef.current) {
      prevAiResponseRef.current = aiError;
      
      toast.error(aiError.message || "Failed to get response from AI");
      // Use consistent timestamp to prevent hydration issues
      const timestamp = Date.now();
      
      const errorMessage = {
        id: timestamp,
        text: "Sorry, I encountered an issue. Please try again.",
        sender: "ai",
        timestamp: timestamp,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [aiResponse, aiError, isAIResponding]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Use consistent timestamp to prevent hydration issues
    const timestamp = Date.now();

    const userMessage = {
      id: timestamp,
      text: inputValue,
      sender: "user",
      timestamp: timestamp,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue("");

    try {
      await getAIResponseFn({
        messages: [...messages, userMessage]
      });
    } catch (error) {
      toast.error("Failed to get response from AI");
      console.error("AI request failed:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestionClick = (question) => {
    setInputValue(question);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  // Welcome content for first-time users
  const welcomeContent = (
    <div className="flex flex-col items-center justify-center h-full w-full px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center w-full max-w-2xl"
      >
        <div className="relative mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-md">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-foreground mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          AI Career Assistant
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl">
          Get personalized career advice, resume tips, interview prep, and more. Ask me anything about your career journey!
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-2xl"
      >
        <h2 className="text-xl font-semibold text-foreground mb-6 text-left">Quick Start Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "How to negotiate a higher salary?",
            "What's the difference between CV and resume?",
            "How to prepare for a technical interview?",
            "Tips for remote work success?"
          ].map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index + 0.5 }}
              whileHover={{ scale: 1.03, translateY: -2 }}
              className="bg-muted/50 p-5 rounded-xl cursor-pointer hover:bg-accent transition-all duration-300 text-left border border-muted-foreground/10 shadow-sm"
              onClick={() => handleQuickQuestionClick(question)}
            >
              <p className="font-medium text-foreground">{question}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-12 text-sm text-muted-foreground"
      >
        <p>Or type your own question below to get started</p>
      </motion.div>
    </div>
  );

  // Format timestamp for display (this runs only on the client)
  const formatTimestamp = (timestamp) => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      // Client-side: format the timestamp
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Server-side or during hydration: return a consistent placeholder
    return "00:00";
  };

  return (
    <div className="flex flex-col h-full bg-background relative pt-20">
      {messages.length === 0 ? (
        // Welcome screen - no scrollbars
        <div className="flex-1 overflow-hidden pb-24">
          {welcomeContent}
        </div>
      ) : (
        // Chat interface with scrollable messages
        <div className="flex-1 flex flex-col pb-20">
          {/* Messages container with single scrollbar when needed */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6">
            <div className="max-w-3xl mx-auto">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex mb-6 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-full ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground ml-3"
                            : "bg-secondary text-secondary-foreground mr-3"
                        }`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                      <div className={`max-w-[85%] ${message.sender === "user" ? "mr-2" : "ml-2"}`}>
                        <Card className={`rounded-2xl px-4 py-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none border-0"
                            : "bg-secondary text-secondary-foreground rounded-tl-none border"
                        }`}>
                          <CardContent className="p-0">
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {formatTimestamp(message.timestamp)}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isAIResponding && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex mb-6 justify-start"
                  >
                    <div className="flex max-w-full">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-secondary text-secondary-foreground mr-3">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="ml-2">
                        <Card className="rounded-2xl px-4 py-3 bg-secondary text-secondary-foreground rounded-tl-none border">
                          <CardContent className="p-0 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Thinking...</span>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-muted rounded-2xl border p-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message AI Career Assistant..."
              className="flex-1 min-h-[40px] max-h-[150px] border-0 bg-transparent resize-none shadow-none focus-visible:ring-0 py-2 px-3"
              disabled={isAIResponding}
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isAIResponding}
              className="h-9 w-9 rounded-full p-0 mb-1 mr-1 bg-blue-600 hover:bg-blue-700"
              size="icon"
            >
              {isAIResponding ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI Career Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
