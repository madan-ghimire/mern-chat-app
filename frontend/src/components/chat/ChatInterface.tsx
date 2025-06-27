import { Box, Flex, Input, Button, Text } from '@chakra-ui/react';
import useSocketStore from '../../stores/useSocketStore';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import useChatStore from '../../stores/useChatStore';
import useAuthStore from '../../stores/useAuthStore';

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

import { User as MainUser } from '../../types';

type User = Pick<MainUser, '_id' | 'name' | 'username' | 'avatar' | 'status'>;

interface Message {
  _id: string;
  content: string;
  sender: string;
  createdAt: string;
  status: MessageStatus;
}

interface MessageBubbleProps {
  message: string;
  isOwn: boolean;
  timestamp: string;
  status: MessageStatus;
}

const MessageBubble = ({ message, isOwn, timestamp, status }: MessageBubbleProps) => {
  return (
    <Flex justify={isOwn ? 'flex-end' : 'flex-start'} mb={4}>
      <Box
        bg={isOwn ? 'blue.500' : 'gray.100'}
        color={isOwn ? 'white' : 'gray.800'}
        px={4}
        py={2}
        borderRadius="lg"
        maxW="70%"
      >
        <Text>{message}</Text>
        <Flex justify="flex-end" mt={1}>
          <Text fontSize="xs" color={isOwn ? 'gray.200' : 'gray.500'}>
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            {isOwn && (
              <Box as="span" ml={2}>
                {status === 'sending' && <Text fontSize="xs">⏳️</Text>}
                {status === 'sent' && <Text fontSize="xs">✓</Text>}
                {status === 'delivered' && <Text fontSize="xs">✓✓</Text>}
                {status === 'read' && <Text fontSize="xs">✓✓✓</Text>}
                {status === 'failed' && <Text fontSize="xs">!</Text>}
              </Box>
            )}
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

interface ChatInterfaceProps {
  recipient: User | null;
}

const ChatInterface = ({ recipient }: ChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const {
    messages,
    currentChat,
    sendMessage: sendChatMessage,
    startTyping,
    stopTyping,
    typingUsers,
  } = useChatStore();

  const chatMessages = currentChat ? messages[currentChat] || [] : [];
  const isTyping = recipient ? typingUsers.has(recipient._id) : false;

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    try {
      sendChatMessage(newMessage);
      setNewMessage('');
      // Reset typing indicator when message is sent
      stopTyping();
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    // Notify recipient that user is typing
    if (!typingUsers.has(user?._id || '')) {
      startTyping();
    }
  };

  // Reset typing indicator when input is empty
  useEffect(() => {
    if (!newMessage) {
      stopTyping();
    }
  }, [newMessage, stopTyping]);

  if (!recipient) {
    return (
      <Flex flex={1} align="center" justify="center">
        <Text color="gray.500">Select a chat to start messaging</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100%" bg="white" borderRadius="lg" overflow="hidden">
      {/* Chat header */}
      <Box p={4} borderBottom="1px" mt={4} borderColor="gray.200">
        {recipient && (
          <Flex align="center" gap="4">
            <Box boxSize="32px" borderRadius="full" bg="blue.500" display="flex" alignItems="center" justifyContent="center" color="white">
              {recipient.name?.charAt(0).toUpperCase() || '?'}
            </Box>
            <Box>
              <Text fontWeight="bold">{recipient.name || recipient.username || 'Unknown User'}</Text>
              <Text fontSize="sm" color="gray.500">
                {isTyping ? 'typing...' : recipient.status || 'offline'}
              </Text>
            </Box>
          </Flex>
        )}
      </Box>

      {/* Messages container */}
      <Box 
        flex={1} 
        overflowY="auto" 
        bg="gray.50"
        position="relative"
        css={{
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'gray.400',
          },
        }}
      >
        <Box p={4}>
          <Flex direction="column" gap={4}>
            {chatMessages.map((msg: Message) => (
              <MessageBubble
                key={msg._id}
                message={msg.content}
                isOwn={msg.sender === user?._id}
                timestamp={msg.createdAt}
                status={msg.status}
              />
            ))}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </Flex>
        </Box>
      </Box>

      {/* Connection status */}
      <Flex 
        justify="flex-end" 
        px={4} 
        py={1} 
        bg="white" 
        borderTop="1px" 
        borderColor="gray.200"
      >
        <Box
          px={3}
          py={1}
          bg={useSocketStore((state: { isConnected: boolean }) => state.isConnected) ? 'green.500' : 'red.500'}
          color="white"
          borderRadius="md"
          fontSize="xs"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Box
            w="6px"
            h="6px"
            borderRadius="full"
            bg="white"
            opacity="0.9"
          />
          <Text fontSize="xs">
            {useSocketStore((state: { isConnected: boolean }) => state.isConnected) ? 'Connected' : 'Disconnected'}
          </Text>
        </Box>
      </Flex>

      <Box 
        p={4} 
        borderTop="1px" 
        borderTopColor="gray.100"
        bg="white"
        position="sticky"
        bottom={0}
        zIndex={1}
      >
        <Flex gap={2} align="center">
          <Button
            variant="ghost"
            borderRadius="full"
            aria-label="Add attachment"
            p={0}
            minW="40px"
            h="40px"
            flexShrink={0}
          >
            <FiPaperclip />
          </Button>
          <Input
            ref={inputRef}
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={startTyping}
            onBlur={stopTyping}
            flex={1}
            borderRadius="full"
            bg="white"
            border="1px"
            borderColor="gray.200"
            _hover={{
              borderColor: 'gray.300',
            }}
            _focus={{
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            py={2}
            px={4}
          />
          <Button
            colorScheme="blue"
            borderRadius="full"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            p={0}
            minW="40px"
            h="40px"
            flexShrink={0}
            _disabled={{
              opacity: 0.5,
              cursor: 'not-allowed',
            }}
          >
            <FiSend />
          </Button>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ChatInterface;
