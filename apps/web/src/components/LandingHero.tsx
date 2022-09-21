import {
  Box,
  Button,
  Flex,
  Heading,
  Img,
  Text,
  useColorModeValue as mode,
} from "@chakra-ui/react";

export function LandingHero() {
  return (
    <Box
      as="section"
      bg={mode("gray.50", "gray.800")}
      pt="24"
      pb="12"
      overflow="hidden"
      width="full"
    >
      <Box
        maxW={{ base: "xl", md: "7xl" }}
        mx="auto"
        px={{ base: "6", md: "8" }}
      >
        <Flex
          align="flex-start"
          direction={{ base: "column", lg: "row" }}
          justify="space-between"
          mb="20"
        >
          <Box flex="1" maxW={{ lg: "xl" }} pt="6">
            <Heading as="h1" size="3xl" mt="8" fontWeight="extrabold">
              The world&apos;s first Language Management System
            </Heading>
            <Text color={mode("gray.600", "gray.400")} mt="5" fontSize="xl">
              Manage your translations in a way that your developers, product
              owners and translators will love.
            </Text>
            <Button
              mt="8"
              minW="14rem"
              colorScheme="blue"
              size="lg"
              height="14"
              px="8"
              fontSize="md"
              fontWeight="bold"
            >
              Get Started for free
            </Button>
          </Box>
          <Box boxSize={{ base: "20", lg: "8" }} />
          <Img
            pos="relative"
            marginEnd="-16rem"
            w="50rem"
            src="https://res.cloudinary.com/chakra-ui-pro/image/upload/v1621082943/pro-website/screenshot-dark_w6jpks.png"
            alt="Screenshot for Form builder"
          />
        </Flex>
        {/* <Box>
          <Text color={mode("gray.600", "gray.400")} fontWeight="medium">
            Proudly trusted by 5,000+ companies and individuals
          </Text>
          <SimpleGrid
            mt="8"
            columns={{ base: 2, md: 3, lg: 6 }}
            color="gray.500"
            alignItems="center"
            spacing={{ base: "12", lg: "24" }}
            fontSize="2xl"
          >
            <Logos.ChatMonkey />
            <Logos.Wakanda />
            <Logos.Lighthouse />
            <Logos.Plumtic />
            <Logos.WorkScout />
            <Logos.Finnik />
          </SimpleGrid>
        </Box> */}
      </Box>
    </Box>
  );
}
