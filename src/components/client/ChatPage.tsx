import { View, Text, ScrollView } from '../../tw';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Send, MoreVertical, Image as ImageIcon, Mic } from 'lucide-react-native';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuthStore } from '../../stores/useAuthStore';
import { chatService, type ChatMessage } from '../../services/chat';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../hooks/useTranslation';

interface ChatPageProps {
  onBack: () => void;
  bookingId: string;
  recipientId: string;
  recipientName?: string;
  recipientImage?: string;
}

export default function ChatPage({
  onBack,
  bookingId,
  recipientId,
  recipientName = 'User',
  recipientImage
}: ChatPageProps) {
  const { user } = useAuthStore();
  const { t, language } = useTranslation();
  const chatT = t.client.chatPage;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  // Use ScrollView ref instead of DOM scrollIntoView
  const scrollViewRef = useRef<any>(null);

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    if (bookingId && user?.id) {
      loadMessages();

      const subscription = chatService.subscribeToMessages(bookingId, (newMsg) => {
        setMessages(prev => {
          if (prev.some(m => m.id.toLowerCase() === newMsg.id.toLowerCase())) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.receiver_id === user.id) {
          chatService.markAsRead(bookingId, user.id);
        }
      });

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [bookingId, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      if (!bookingId) return;
      const data = await chatService.getMessages(bookingId);
      setMessages(data);
      if (user?.id) {
        await chatService.markAsRead(bookingId, user.id);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id) return;

    const content = newMessage;
    setNewMessage('');

    try {
      const msg = await chatService.sendMessage(bookingId, user.id, recipientId, content);
      setMessages(prev => {
        if (prev.some(m => m.id.toLowerCase() === msg.id.toLowerCase())) return prev;
        return [...prev, msg];
      });
    } catch (error) {
      console.error(error);
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className="flex-1 flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 p-4 shadow-sm flex-row items-center gap-3">
        <Button variant="ghost" size="icon" onPress={onBack}>
          {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </Button>

        <Avatar className="h-10 w-10 border">
          <AvatarImage src={recipientImage} />
          <AvatarFallback>{recipientName[0]}</AvatarFallback>
        </Avatar>

        <View className="flex-1">
          <Text className="font-semibold text-sm">{recipientName}</Text>
          <View className="flex-row items-center gap-1">
            <View className="w-2 h-2 bg-green-500 rounded-full" />
            <Text className="text-xs text-green-500">{chatT.online}</Text>
          </View>
        </View>

        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </Button>
      </View>

      {/* Messages Area — uses ScrollView with ref for scrollToEnd */}
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        contentContainerClassName="gap-4"
        onContentSizeChange={scrollToBottom}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`flex-row ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <View
              className={`max-w-[75%] p-3 rounded-2xl ${msg.sender_id === user?.id
                ? 'bg-[#FB5E7A] rounded-br-none'
                : 'bg-white dark:bg-gray-800 rounded-bl-none shadow-sm'
                }`}
            >
              <Text className={`text-sm ${msg.sender_id === user?.id ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                {msg.content}
              </Text>
              <Text className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? 'text-white/80' : 'text-gray-400'}`}>
                {formatTime(msg.created_at)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View className="p-4 bg-white dark:bg-gray-800 border-t">
        <View className="flex-row items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-400">
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <Mic className="w-5 h-5" />
          </Button>

          <Input
            value={newMessage}
            onChangeText={setNewMessage}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            placeholder={chatT.typeMessage}
            className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-full"
          />

          <Button
            onPress={handleSend}
            className="bg-[#FB5E7A] rounded-full w-10 h-10 p-0 items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </Button>
        </View>
      </View>
    </View>
  );
}