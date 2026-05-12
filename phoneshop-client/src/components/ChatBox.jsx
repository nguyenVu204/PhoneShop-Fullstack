import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link
import axiosClient from '../api/axiosClient';

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

  // Hàm "phù phép" chuỗi Text thành React Link
  const renderMessageContent = (text, isUser) => {
    if (isUser) return text; // User thì in bình thường

    // Tìm chuỗi có dạng [Tên hiển thị](/link)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Đẩy phần text bình thường trước cái link vào mảng
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Đẩy cái Link vào mảng
      parts.push(
        <Link 
            key={match.index} 
            to={match[2]} 
            className="text-blue-600 font-black underline hover:text-blue-800 transition-colors bg-blue-50 px-1 rounded"
            onClick={() => setIsOpen(false)} // Tự động đóng chat khi khách click vào xem sản phẩm
        >
          {match[1]}
        </Link>
      );
      lastIndex = linkRegex.lastIndex;
    }

    // Đẩy phần text còn lại
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 animate-bounce ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle size={28} />
      </button>

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">TechMobile AI</h3>
                <div className="flex items-center gap-1 text-[10px] text-blue-100">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Luôn trực tuyến
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-md transition">
              <X size={20} />
            </button>
          </div>

          <div className="h-[400px] overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'}`}>
                  {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                  {/* Sử dụng hàm render vừa tạo để hiển thị nội dung */}
                  <div className="whitespace-pre-line leading-relaxed">
                    {renderMessageContent(msg.text, msg.sender === 'user')}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2 max-w-[85%] mr-auto">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <Bot size={16} />
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="text-blue-600 animate-spin" />
                  <span className="text-xs text-gray-400">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi của bạn..."
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2 text-sm outline-none transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 hover:bg-blue-700 disabled:opacity-50 transition shadow-md"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}