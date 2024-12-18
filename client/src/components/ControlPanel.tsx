import { Card } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";


export const ControlPanel = () => {
  return (
    <Card.Root>
      <Card.Body gap="2">
        <Card.Title className="text-center text-teal-900 tracking-widest">Control   Panel</Card.Title>
      </Card.Body>
      <Card.Footer justifyContent="center">
        <Button
          variant="surface"
          borderColor="teal.900"
          w={{ base: "10px", md: "60px" }}
        >
          Play
        </Button>
        <Button
          variant="surface"
          className="border-teal-900"
          w={{ base: "10px", md: "60px" }}
        >
          Skip
        </Button>
        <Button
          variant="surface"
          className="border-teal-900"
          w={{ base: "10px", md: "60px" }}
        >
          Cam
        </Button>
        <Button
          variant="surface"
          className="border-teal-900"
          w={{ base: "10px", md: "60px" }}
        >
          Quit
        </Button>
      </Card.Footer>
    </Card.Root>
    
  );
};
