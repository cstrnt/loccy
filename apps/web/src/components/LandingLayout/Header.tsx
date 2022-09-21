import {
  useColorModeValue,
  Container,
  HStack,
  Heading,
  ButtonGroup,
  Button,
  IconButton,
  Box,
  useBreakpointValue,
} from "@chakra-ui/react";
import Link from "next/link";

import { FiMenu } from "react-icons/fi";
import { ResourcesPopover } from "./RessourcesPopover";

export function Header() {
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  return (
    <Box as="section">
      <Box
        as="nav"
        bg="bg-surface"
        boxShadow={useColorModeValue("sm", "sm-dark")}
      >
        <Container py={{ base: "4", lg: "5" }}>
          <HStack spacing="10" justify="space-between">
            <Heading size="md">loccy</Heading>
            {isDesktop ? (
              <>
                <ButtonGroup variant="link" spacing="8">
                  <Button>Product</Button>
                  <Button>Pricing</Button>
                  <ResourcesPopover />
                  <Button>Support</Button>
                </ButtonGroup>
                <HStack spacing="3">
                  <Link href="/login" passHref>
                    <Button as="a" variant="ghost">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/login" passHref>
                    <Button as="a" variant="primary">
                      Sign Up
                    </Button>
                  </Link>
                </HStack>
              </>
            ) : (
              <IconButton
                variant="ghost"
                icon={<FiMenu fontSize="1.25rem" />}
                aria-label="Open Menu"
              />
            )}
          </HStack>
        </Container>
      </Box>
    </Box>
  );
}
