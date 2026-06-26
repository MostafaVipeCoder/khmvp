
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Send, MoreVertical, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { supportTicketService, type SupportTicket, type TicketMessage } from '../../services/supportTickets';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTranslation } from '../../hooks/useTranslation';

interface SupportTicketChatProps {
  onBack: () => void;
  ticketId: string;
}

export default function SupportTicketChat({ onBack, ticketId }: SupportTicketChatProps) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { t, language } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (ticketId) {
      loadTicketAndMessages();
    }
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTicketAndMessages = async () => {
    try {
      const [ticketData, messagesData] = await Promise.all([
        supportTicketService.getTicket(ticketId),
        supportTicketService.getTicketMessages(ticketId),
      ]);
      setTicket(ticketData);
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load ticket:', err);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id) return;
    try {
      const msg = await supportTicketService.addTicketMessage({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_type: 'user',
        message: newMessage.trim(),
      });
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!ticket) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack}>
          {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Button>

        <Avatar className="h-10 w-10 border">
          <AvatarImage src="" />
          <AvatarFallback>
            <FileText className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h3 className="font-semibold text-sm">{ticket.subject}</h3>
          <span className="text-xs text-gray-500">{ticket.category.toUpperCase()}</span>
        </div>

        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-2xl ${msg.sender_type === 'user'
                ? 'bg-[#FB5E7A] text-white rounded-br-none'
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                }`}
            >
              <p className="text-sm">{msg.message}</p>
              <span className={`text-[10px] mt-1 block ${msg.sender_type === 'user' ? 'text-white/80' : 'text-gray-400'
                }`}>
                {formatTime(msg.created_at)}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-gray-800 border-t">
        <div className="flex items-center gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-lg resize-none max-h-32"
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-[#FB5E7A] hover:bg-[#e5536e] rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
