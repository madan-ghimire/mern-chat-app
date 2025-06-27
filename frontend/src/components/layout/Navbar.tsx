import { Box, Flex, Button, Text, useColorModeValue, Avatar, Menu, MenuButton, MenuList, MenuItem, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from '@chakra-ui/react';
import { useRef, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import useAuthStore from '../../stores/useAuthStore';
import { getUserFromToken } from '../../utils/auth';

interface TokenUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
}

const Navbar = () => {
  const [user, setUser] = useState<TokenUser | null>(null);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const tokenUser = getUserFromToken();
    if (tokenUser) {
      setUser({
        id: tokenUser.id,
        username: tokenUser.username,
        email: tokenUser.email,
        name: tokenUser.username, // or use tokenUser.name if available
      });
    }
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/login');
  };

  if (!user) return null;

  return (
    <Box 
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex="sticky"
      borderBottom="1px" 
      borderColor={borderColor} 
      bg={bgColor} 
      px={4} 
      py={3}
      boxShadow="sm"
    >
      <Box maxW="container.xl" mx="auto" w="full" px={4}>
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          height="60px"
          w="full"
        >
          <Text 
            as={RouterLink} 
            to="/" 
            fontSize="xl" 
            fontWeight="bold" 
            color="blue.500"
            _hover={{ textDecoration: 'none' }}
          >
            MERN Chat
          </Text>


          <Flex alignItems="center" gap={4}>
            <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              px={2}
              py={2}
              _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
            >
              <Flex alignItems="center" gap={2}>
                <Text display={{ base: 'none', md: 'block' }} fontWeight="medium">
                  {user.name}
                </Text>
                <Avatar
                  size="sm"
                  name={user.name}
                  src={user.avatar}
                  cursor="pointer"
                />
              </Flex>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />} as={RouterLink} to="/profile">
                Profile
              </MenuItem>
              <MenuItem icon={<FiSettings />} as={RouterLink} to="/settings">
                Settings
              </MenuItem>
              <MenuItem 
                icon={<FiLogOut />} 
                onClick={onOpen}
                color="red.500"
                _hover={{ bg: 'red.50' }}
              >
                Logout
              </MenuItem>
            </MenuList>
            </Menu>
          </Flex>
        </Flex>
      </Box>

      {/* Logout Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Logout
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to logout?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button 
                ref={cancelRef} 
                onClick={onClose}
                variant="outline"
                mr={3}
              >
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleLogout}
                leftIcon={<FiLogOut />}
              >
                Logout
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Navbar;
