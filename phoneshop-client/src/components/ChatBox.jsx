import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom'; 
import axiosClient from '../api/axiosClient';

// Danh sách các câu hỏi gợi ý nhanh
const SUGGESTED_QUESTIONS = [
  "Tư vấn iPhone 15 Pro Max",
  "Điện thoại nào có pin cao?",
  "Tầm giá 10 triệu mua máy gì?",
  "Shop có hỗ trợ trả góp không?",
  "Điện thoại Samsung mới nhất"
];

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Dạ, chào bạn! Mình là AI tư vấn của TechMobile. Bạn đang tìm mua điện thoại của hãng nào, hay trong tầm giá bao nhiêu ạ? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axiosClient.post('/chat/ask', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'Xin lỗi, hệ thống AI đang bảo trì. Vui lòng liên hệ hotline bạn nhé! 😥' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (text, isUser) => {
    if (isUser) return text; 

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <Link 
            key={match.index} 
            to={match[2]} 
            className="text-blue-600 font-black underline hover:text-blue-800 transition-colors bg-blue-50 px-1.5 py-0.5 rounded-md inline-block my-0.5 shadow-sm"
            onClick={() => setIsOpen(false)} 
        >
          {match[1]}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Nút bong bóng chat (Thêm hiệu ứng tỏa vòng - ping) */}
      <div className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'hidden' : 'flex'}`}>
        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        >
          <MessageCircle size={28} />
        </button>
      </div>

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1">
                  TechMobile AI <Sparkles size={14} className="text-yellow-300"/>
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] text-blue-100 font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  Đang hoạt động
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body (Tin nhắn) */}
          <div className="h-[380px] overflow-y-auto p-4 bg-[#f8f9fa] flex flex-col gap-4 scroll-smooth">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white'}`}>
                  {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                {/* Nội dung bong bóng */}
                <div className={`p-3 text-[13px] leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                }`}>
                  <div className="whitespace-pre-line">
                    {renderMessageContent(msg.text, msg.sender === 'user')}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-sm">
                  <Bot size={14} />
                </div>
                <div className="p-3 bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="text-blue-600 animate-spin" />
                  <span className="text-xs text-gray-400 font-medium">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khu vực Gợi ý câu hỏi (Scroll ngang, ẩn thanh cuộn) */}
          <div className="px-3 pt-2 pb-1 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SUGGESTED_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                onClick={() => setInput(question)}
                className="whitespace-nowrap text-[11px] font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full hover:bg-blue-100 hover:text-blue-800 border border-blue-100 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>

          {/* Footer (Khung nhập) */}
          <form onSubmit={handleSend} className="p-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi TechMobile AI..."
              className="flex-1 bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shrink-0 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none transition-all"
            >
              <Send size={18} className="ml-1" /> 
            </button>
          </form>

        </div>
      )}
    </>
  );
}