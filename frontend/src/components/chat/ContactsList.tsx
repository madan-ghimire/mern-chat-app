import { Box, Flex, Input, InputGroup, InputLeftElement, Text } from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/avatar';
import type { InputProps } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { useState } from 'react';
import useSocketStore from '../../stores/useSocketStore';
import { User } from '../../types';

interface ContactsListProps {
  contacts: User[];
  currentUser: User | null;
  onSelectContact: (contact: User) => void;
  activeContactId?: string | null;
}

const ContactsList = ({
  contacts,
  currentUser,
  onSelectContact,
  activeContactId,
}: ContactsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  // Get presence information from the socket store
  const { isConnected, getUserPresence, onlineUsers } = useSocketStore();
  
  // Debug log online users
  console.log('Online users:', onlineUsers);


  const filteredContacts = contacts
    .filter((contact) => contact._id !== currentUser?._id)
    .filter((contact) => {
      const query = searchQuery.toLowerCase();
      return (
        (contact.username && contact.username.toLowerCase().includes(query)) ||
        (contact.email && contact.email.toLowerCase().includes(query))
      );
    });

  return (
    <Box 
      w="100%" 
      h="100%" 
      display="flex"
      flexDirection="column"
      overflow="hidden"
      bg="white"
    >
      <Box 
        p={4} 
        borderBottom="1px" 
        borderColor="gray.200" 
        bg="white" 
        boxShadow="sm"
        flexShrink={0}
      >
        <InputGroup mt={4}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.500" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            bg="gray.50"
            border="1px"
            borderColor="gray.200"
            _hover={{ 
              borderColor: 'gray.300',
              bg: 'white'
            }}
            _focus={{
              bg: 'white',
              borderColor: 'blue.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
            }}
            borderRadius="md"
            pl={10}
            _placeholder={{ color: 'gray.400' } as InputProps['_placeholder']}
            transition="all 0.2s"
          />
        </InputGroup>
      </Box>

      {/* Connection status indicator */}
      <Flex px={4} py={2} bg="white" borderBottomWidth="1px" borderColor="gray.100">
        <Flex align="center" gap={2}>
          <Box
            w={2}
            h={2}
            borderRadius="full"
            bg={isConnected ? 'green.500' : 'red.500'}
          />
          <Text fontSize="sm" color="gray.500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Text>
        </Flex>
      </Flex>
      
      {/* Contacts list container */}
      <Box
        flex="1"
        overflowY="auto"
        bg="white"
        position="relative"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px', // Make it thinner
            height: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
            margin: '4px 0',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0, 0, 0, 0.2)', // More subtle color
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.3)', // Slightly darker on hover
            },
          },
          // For Firefox
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
        }}
      >
        {searchQuery && filteredContacts.length === 0 ? (
          <Flex 
            h="100%" 
            align="center" 
            justify="center"
            p={4}
            textAlign="center"
            color="gray.500"
          >
            No contacts found matching "{searchQuery}"
          </Flex>
        ) : filteredContacts.length > 0 ? (
          filteredContacts.map((contact) => {
            const presence = getUserPresence(contact._id);
            const isOnline = presence?.isOnline || false;
            const isTyping = presence?.isTyping || false;
            const unreadCount = 0; // You can implement unread count logic here
            
            return (
              <Flex
                key={contact._id}
                p={4}
                w="100%"
                align="center"
                cursor="pointer"
                bg={activeContactId === contact._id ? 'blue.50' : 'white'}
                _hover={{ bg: 'gray.50' }}
                onClick={() => onSelectContact(contact)}
                borderBottom="1px"
                borderColor="gray.100"
                transition="background-color 0.2s"
              >
                <Box position="relative" mr={3}>
                  {isOnline && (
                    <Box
                      position="absolute"
                      bottom="0"
                      right="0"
                      w="10px"
                      h="10px"
                      bg="green.500"
                      borderRadius="full"
                      border="2px solid white"
                    />
                  )}
                </Box>
                <Box ml={3} flex={1} minW={0}>
                  <Flex direction="column" w="full">
                    <Flex justify="space-between" align="center" w="full" gap={2}>
                      <Text
                        fontWeight="500"
                        fontSize="sm"
                        noOfLines={1}
                        maxW="calc(100% - 50px)"
                      >
                        {contact.name || contact.username || 'Unknown User'}
                      </Text>
                      <Text 
                        fontSize="xs" 
                        color="gray.500"
                        whiteSpace="nowrap"
                      >
                        {contact.lastSeen ? (
                          new Date(contact.lastSeen).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        ) : null}
                      </Text>
                    </Flex>
                    <Flex align="center" gap={1} mt={0.5}>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        noOfLines={1}
                        maxW="calc(100% - 24px)"
                        title={contact.status || 'Offline'}
                      >
                        <Flex align="center" gap={2}>
                          <Box position="relative" display="inline-flex" alignItems="center">
                            {/* Online status dot */}
                            {isOnline && (
                              <Box
                                position="absolute"
                                bottom="0"
                                right="0"
                                w="10px"
                                h="10px"
                                borderRadius="full"
                                bg="green.500"
                                border="2px solid"
                                borderColor="white"
                                zIndex={1}
                              />
                            )}
                            <Avatar
                              name={contact.name}
                              src={contact.pic}
                              size="sm"
                              mr={2}
                            />
                          </Box>
                          <Text 
                            color={isOnline ? 'green.500' : 'gray.500'} 
                            fontSize="sm"
                            fontWeight={isOnline ? 'medium' : 'normal'}
                          >
                            {isTyping ? 'typing...' : (isOnline ? 'Online' : 'Offline')}
                          </Text>
                        </Flex>
                      </Text>
                      {unreadCount > 0 ? (
                        <Flex
                          bg="blue.500"
                          color="white"
                          borderRadius="full"
                          minW="20px"
                          h="20px"
                          align="center"
                          justify="center"
                          fontSize="xs"
                          fontWeight="bold"
                          px={1}
                        >
                          {unreadCount}
                        </Flex>
                      ) : (
                        <Text 
                          fontSize="xs" 
                          color="gray.400"
                          ml={1}
                          fontStyle="italic"
                          whiteSpace="nowrap"
                        >
                          @{contact.username || 'user'}
                        </Text>
                      )}
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            );
          })
        ) : (
          <Flex h="100%" align="center" justify="center">
            <span style={{ color: '#718096' }}>No contacts found</span>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default ContactsList;
