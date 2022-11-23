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
import { trpc } from "~/utils/trpc";

export function Header() {
  const { data } = trpc.user.me.useQuery(undefined, {
    retry: false,
  });
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
            <Heading
              size="md"
              bgGradient="linear(to-r, brand.500, orange.400)"
              bgClip="text"
            >
              loccy
            </Heading>
            {isDesktop ? (
              <>
                <ButtonGroup variant="link" spacing="8">
                  <Link href="#">
                    <Button>Product</Button>
                  </Link>
                  <Link href="#pricing" scroll={false}>
                    <Button>Pricing</Button>
                  </Link>
                  {/* <ResourcesPopover /> */}
                  <Link href="https://docs.loccy.app">
                    <Button>Docs</Button>
                  </Link>
                </ButtonGroup>
                <HStack spacing="3">
                  {data ? (
                    <Link href="/app" passHref>
                      <Button as="a" variant="primary">
                        Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <>
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
                    </>
                  )}
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
