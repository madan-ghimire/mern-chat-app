import { Box, Flex, useToast, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User } from '../types';
import ContactsList from '../components/chat/ContactsList';
import ChatInterface from '../components/chat/ChatInterface';
import useAuthStore from '../stores/useAuthStore';
import useSocketStore from '../stores/useSocketStore';

const ChatPage = () => {
  const { user } = useAuthStore();
  const [selectedContact, setSelectedContact] = useState<User | null>(null);
  const toast = useToast();

  // Fetch user's contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await axios.get('/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("check contacts", response.data);
        return response.data;

      } catch (error: any) {
        console.error('Failed to fetch contacts:', error);
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to load contacts',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right' as const
        });
        return [];
      }
    },
    enabled: !!user,
  });

  // Set first contact as selected by default
  useEffect(() => {
    if (contacts.length > 0 && !selectedContact) {
      setSelectedContact(contacts[0]);
    }
  }, [contacts, selectedContact]);

  const { token } = useAuthStore();

  // Connect to socket when component mounts
  useEffect(() => {
    if (user && token) {
      useSocketStore.getState().connect(user._id, token);
    }
    
    // Cleanup on unmount
    return () => {
      useSocketStore.getState().disconnect();
    };
  }, [user]);

  // Navbar height for proper layout calculation
  const navbarHeight = '60px';

  if (isLoading) {
    return (
      <Flex 
        h="100vh" 
        align="center" 
        justify="center"
        bg="gray.50"
        position="relative"
      >
        <Box 
          p={6} 
          bg="white" 
          borderRadius="lg"
          boxShadow="md"
          textAlign="center"
        >
          <Text>Loading your conversations...</Text>
        </Box>
      </Flex>
    );
  }

  return (
    <Box 
      h="100vh" 
      w="100vw" 
      overflow="hidden" 
      bg="white"
      position="relative"
    >
      {/* Main content container */}
      <Flex 
        h={`calc(100vh - ${navbarHeight})`} 
        mt={navbarHeight}
        position="relative"
      >
        {/* Sidebar with contacts */}
        <Box 
          w={{ base: '100%', md: '350px' }} 
          h="100%" 
          borderRight="1px" 
          borderColor="gray.200"
          bg="white"
          display={{ base: selectedContact ? 'none' : 'flex', md: 'flex' }}
          flexDirection="column"
          position="relative"
          boxShadow={{ base: 'none', md: 'sm' }}
          zIndex={1}
        >
          <ContactsList
            contacts={contacts}
            currentUser={user}
            onSelectContact={setSelectedContact}
            activeContactId={selectedContact?._id}
          />
        </Box>

        {/* Main chat area */}
        <Box 
          flex={1} 
          h="100%"
          bg="white"
          display={{ base: selectedContact ? 'flex' : 'none', md: 'flex' }}
          flexDirection="column"
          position="relative"
          borderLeft={{ base: 'none', md: '1px solid' }}
          borderLeftColor={{ base: 'transparent', md: 'gray.200' }}
        >
          {selectedContact ? (
            <ChatInterface recipient={selectedContact} />
          ) : (
            <Flex 
              h="100%" 
              align="center" 
              justify="center" 
              bg="gray.50"
              p={4}
            >
              <Box 
                textAlign="center" 
                p={8}
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                maxW="md"
                w="100%"
              >
                <Text fontSize="xl" fontWeight="medium" mb={2}>
                  Select a chat to start messaging
                </Text>
                <Text color="gray.500" mb={4}>
                  Choose a contact from the list to begin your conversation
                </Text>
                <Text 
                  fontSize="sm" 
                  color="gray.400" 
                  fontStyle="italic"
                >
                  {contacts.length === 0 ? 'No contacts available' : `${contacts.length} contacts`}
                </Text>
              </Box>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
};

export default ChatPage;
