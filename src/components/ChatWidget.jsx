import { useState, useEffect, useRef } from 'react';

// SVG Icons
const ChatIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasBadge, setHasBadge] = useState(true);
  const idRef = useRef(2);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to G Mark Software Solutions. How can we help you today?",
      sender: 'bot',
      time: '17:29'
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    idRef.current += 1;
    const userMsg = {
      id: idRef.current,
      text: text,
      sender: 'user',
      time: getCurrentTime()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "Thank you for reaching out! A representative from G Mark will contact you shortly.";
      const query = text.toLowerCase();

      if (query.includes('support') || query.includes('technical') || query.includes('issue')) {
        replyText = "For technical assistance, please email gmarksoftware@gmail.com, or submit details on our Support view. You can also call us directly at +91-9657363967.";
      } else if (query.includes('quote') || query.includes('pricing') || query.includes('demo') || query.includes('cost')) {
        replyText = "We build tailored software, cloud setups, and web designs. Email us at gmarksoftware@gmail.com with your specs and our sales team will reach out with a quote!";
      } else if (query.includes('phone') || query.includes('call') || query.includes('contact')) {
        replyText = "You can speak with our support and sales team directly at +91-9657363967 (available Mon-Fri, 9am-6pm IST).";
      }

      idRef.current += 1;
      const botMsg = {
        id: idRef.current,
        text: replyText,
        sender: 'bot',
        time: getCurrentTime()
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleQuickReply = (text) => {
    handleSendMessage(text);
  };

  const quickReplies = [
    "Technical Support",
    "Request a Quote",
    "Contact Phone No."
  ];

  return (
    <div className="fixed bottom-8 right-8 z-[999]">
      
      {/* Trigger Button */}
      <button 
        className={`w-14 h-14 rounded-full bg-accent-red text-text-primary flex items-center justify-center border-none cursor-pointer shadow-lg shadow-accent-red/40 transition-all duration-300 hover:scale-110 hover:rotate-6 hover:shadow-xl hover:shadow-accent-red/60 relative z-50`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setHasBadge(false);
          }
        }}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}>
          {isOpen ? <CloseIcon /> : <ChatIcon />}
        </span>
        {hasBadge && !isOpen && (
          <span className="absolute -top-0.5 -right-0.5 bg-accent-blue text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-bg-primary" aria-label="1 message unread">
            1
          </span>
        )}
      </button>

      {/* Floating Chat Drawer */}
      <div 
        className={`absolute bottom-[72px] right-0 w-[calc(100vw-2rem)] sm:w-[360px] h-[500px] bg-bg-secondary/90 backdrop-blur-xl border border-border-color rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      >
        
        {/* Header */}
        <div className="bg-bg-tertiary px-5 py-4 border-b border-border-color flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bg-primary border border-accent-red flex items-center justify-center text-accent-red font-bold text-sm relative">
              GM
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-bg-tertiary rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary">G Mark Live Support</span>
              <span className="text-[10px] text-text-muted">Online • Replies in minutes</span>
            </div>
          </div>
          <button 
            className="text-text-muted hover:text-text-primary p-1 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat window"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-accent-red text-text-primary rounded-br-none align-self-end self-end'
                  : 'bg-bg-tertiary text-text-primary rounded-bl-none align-self-start self-start'
              }`}
            >
              <div>{msg.text}</div>
              <span className="text-[9px] text-text-muted mt-1.5 block text-right">
                {msg.time}
              </span>
            </div>
          ))}
          
          {isTyping && (
            <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-none text-sm bg-bg-tertiary align-self-start self-start flex items-center">
              <div className="flex gap-1.5 py-1" aria-label="Support typing indicator">
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 px-5 py-3 border-t border-border-color bg-bg-secondary/40">
          {quickReplies.map((reply, idx) => (
            <button 
              key={idx}
              className="bg-bg-tertiary border border-border-color text-text-secondary hover:bg-accent-red/10 hover:border-accent-red/30 hover:text-accent-red px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form 
          className="px-5 py-4 bg-bg-tertiary border-t border-border-color flex gap-3 items-center"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
        >
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-bg-primary/50 border border-border-color focus:border-accent-red text-text-primary rounded-full px-4 py-2.5 text-xs sm:text-sm outline-none transition-colors duration-200"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button 
            type="submit" 
            className="text-accent-red hover:text-accent-red-hover disabled:text-text-muted p-1 transition-colors cursor-pointer"
            disabled={!inputText.trim()}
            aria-label="Send support message"
          >
            <SendIcon />
          </button>
        </form>

      </div>

    </div>
  );
}
