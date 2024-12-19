import { Card } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";


export const ControlPanel = () => {
  return (
    <Card.Root className="bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100">
      <Card.Body gap="2">
        <Card.Title className="text-center text-gray-900 tracking-widest font-bold">
          Control Panel
        </Card.Title>
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
          id="pause_button"
          variant="surface"
          className="border-teal-900"
          w={{ base: "10px", md: "60px" }}
        >
          Pause
        </Button>
        <Button
          id="webcam_button"
          variant="surface"
          className="border-teal-900"
          w={{ base: "10px", md: "60px" }}
        >
          Cam
        </Button>
        <Button
          id="quit_button"
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
