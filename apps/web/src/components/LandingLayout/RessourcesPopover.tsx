import {
  Button,
  Icon,
  Link,
  Popover,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { PopoverIcon } from "./PopoverIcon";

import {
  FiBarChart,
  FiFileText,
  FiGrid,
  FiMousePointer,
  FiRepeat,
  FiShield,
} from "react-icons/fi";

const items = [
  {
    title: "Analytics",
    description:
      "Danish lollipop marzipan dragée gingerbread tart wafer sweet.",
    href: "#",
    icon: FiBarChart,
  },
  {
    title: "Automations",
    description: "Macaroon tiramisu tart bonbon apple pie jujubes brownie.",
    href: "#",
    icon: FiRepeat,
  },
  {
    title: "Engagement",
    description: "hupa chups donut caramels chocolate cake toffee.",
    href: "#",
    icon: FiMousePointer,
  },
  {
    title: "Integrations",
    description:
      "Dragée jujubes brownie pastry biscuit croissant wafer halva apple.",
    href: "#",
    icon: FiGrid,
  },
  {
    title: "Reports",
    description: "Candy oat cake caramels shortbread gummies.",
    href: "#",
    icon: FiFileText,
  },
  {
    title: "Security",
    description:
      "Bear claw topping toffee tiramisu cake fruitcake marzipan icing.",
    href: "#",
    icon: FiShield,
  },
];

export const ResourcesPopover = () => (
  <Popover trigger="hover" openDelay={0} placement="bottom" gutter={12}>
    {({ isOpen }) => (
      <>
        <PopoverTrigger>
          <Button variant="link" rightIcon={<PopoverIcon isOpen={isOpen} />}>
            Resources
          </Button>
        </PopoverTrigger>
        <PopoverContent p="5" width={{ base: "sm", md: "2xl" }}>
          <SimpleGrid columns={{ base: 1, md: 2 }} columnGap="6" rowGap="2">
            {items.map((item, id) => (
              <Link variant="menu" href={item.href} key={id}>
                <Stack spacing="4" direction="row" p="3">
                  <Icon as={item.icon} boxSize="6" color="accent" />
                  <Stack spacing="1">
                    <Text fontWeight="medium">{item.title}</Text>
                    <Text fontSize="sm" color="muted">
                      {item.description}
                    </Text>
                  </Stack>
                </Stack>
              </Link>
            ))}
          </SimpleGrid>
        </PopoverContent>
      </>
    )}
  </Popover>
);
