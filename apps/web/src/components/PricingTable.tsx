import {
  Box,
  BoxProps,
  Button,
  Center,
  Circle,
  Container,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stack,
  StackDivider,
  StackProps,
  Text,
  useColorModeValue as mode,
  useBreakpointValue,
  Code,
} from "@chakra-ui/react";

import { BsCode, BsSpeedometer, BsStars } from "react-icons/bs";
import { FaBrain } from "react-icons/fa";
import { FiCheck } from "react-icons/fi";

const features = [
  {
    name: "AI Powered",
    description:
      "Loccy uses AI to help you find the best translations for your app. This means you can focus on building your app, not translating it.",
    icon: FaBrain,
  },
  {
    name: "Created with DX in mind",
    description:
      "Loccy is built with developers in mind. We know how important it is to have a great developer experience, so we built Loccy to be the best translation management system for developers.",
    icon: BsCode,
  },
  {
    name: "Launch faster",
    description:
      "Launch a new language in minutes. Loccy's Auto Translate feature will get you started with translations in no time.",
    icon: BsSpeedometer,
  },
];

const product = {
  name: "Loccy Premium",
  price: "179",
  description: "The best way to manage your localisation",
  features: [
    "Unlimited locales",
    "Unlimited projects",
    "Unlimited translations",
    "AI powered translations",
    "Lifetime access",
    "Customer support",
  ],
};

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

type Feature = ElementType<typeof features>;

interface Props extends StackProps {
  feature: Feature;
}

const PricingFeature = (props: Props) => {
  const { feature, ...stackProps } = props;
  return (
    <Stack direction="row" spacing={{ base: 4, lg: 5 }} {...stackProps}>
      <Center
        color="inverted"
        flexShrink={0}
        boxSize={{ base: 10, lg: 12 }}
        bg="accent"
        borderRadius="lg"
        fontSize={{ base: "xl", lg: "2xl" }}
      >
        <Icon as={feature.icon} fontSize="1.25rem" />
      </Center>
      <Stack spacing={{ base: "1", lg: "2" }} pt={{ base: "1.5", md: "2.5" }}>
        <Text fontSize={{ base: "lg", lg: "xl" }} fontWeight="medium">
          {feature.name}
        </Text>
        <Text color="muted">{feature.description}</Text>
      </Stack>
    </Stack>
  );
};

const PricingCard = (props: BoxProps) => {
  return (
    <Box
      bg="bg-surface"
      borderRadius="2xl"
      boxShadow={mode("lg", "lg-dark")}
      maxW={{ lg: "576px" }}
      py={{ base: "6", lg: "8" }}
      {...props}
    >
      <Stack spacing="8" divider={<StackDivider />}>
        <Stack
          spacing={{ base: "4", lg: "8" }}
          direction={{ base: "column-reverse", lg: "row" }}
          justify="space-between"
          align={{ base: "start", lg: "center" }}
          px={{ base: "6", md: "8" }}
        >
          <Stack spacing="1">
            <Heading size="xs">{product.name}</Heading>
            <Text color="muted">{product.description}</Text>
          </Stack>
          <Stack direction="row" spacing="0.5">
            <Heading size={useBreakpointValue({ base: "lg", lg: "xl" })}>
              {product.price}
            </Heading>
            <Heading size="md" pt={{ base: "1.5", lg: "2" }}>
              €
            </Heading>
          </Stack>
        </Stack>

        <Stack spacing="6" px={{ base: "6", md: "8" }}>
          <Stack spacing="1">
            <Text fontWeight="semibold">What&apos;s included</Text>
            <Text color="muted">
              All you need to localize your websites & applications
            </Text>
          </Stack>
          <SimpleGrid
            as="ul"
            columns={{ base: 1, lg: 2 }}
            columnGap="8"
            rowGap="4"
            pb="2"
          >
            {product.features.map((feature) => (
              <HStack key={feature} as="li" spacing="3">
                <Circle size="6" bg={mode("blue.50", "whiteAlpha.50")}>
                  <Icon as={FiCheck} color="accent" />
                </Circle>
                <Text color="muted">{feature}</Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Stack>

        <Box px={{ base: "6", md: "8" }} pb="2">
          <Button variant="primary" size="lg" width="full">
            Buy now
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export const PricingTable = () => (
  <Box as="section">
    <Container py={{ base: "16", md: "24" }}>
      <Stack spacing={{ base: "12", md: "16" }}>
        <Stack spacing={{ base: "4", md: "6" }}>
          <Stack spacing="3">
            <Text color="accent" fontWeight="semibold" id="pricing">
              Pricing
            </Text>
            <Heading size={useBreakpointValue({ base: "md", md: "lg" })}>
              Get lifetime access
            </Heading>
          </Stack>
          <Text fontSize={{ base: "lg", md: "xl" }} color="muted" maxW="3xl">
            Quit the JSON files. Start localizing your websites & applications
            with Loccy. Make your Product Owners and Developers happy with the
            easiest solution for localization.
          </Text>
        </Stack>
        <Stack
          direction={{ base: "column", md: "row" }}
          spacing={{ base: "12", lg: "24" }}
        >
          <Stack spacing={{ base: "10", md: "12" }} flex="1" justify="center">
            {features.map((feature, id) => (
              <PricingFeature key={id} feature={feature} />
            ))}
          </Stack>
          <PricingCard flex="1" />
        </Stack>
      </Stack>
    </Container>
  </Box>
);
