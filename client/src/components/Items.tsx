import { Card } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import { IoIosTimer } from "react-icons/io";
import Countdown from "react-countdown";

export const Items = () => {
  const items = ["Item1", "Item2", "Item3", "Item4"];

  return (
    <div>
      {/* DEVELOPEMENT USE CARD */}
      <Card.Root className="bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100">
        <Card.Body gap="2">
          <Card.Title className="text-center text-gray-900 tracking-widest font-bold">
            For development Use
          </Card.Title>
        </Card.Body>
        <Card.Footer justifyContent="center">
          <Button variant="surface" borderColor="teal.900" className="p-1">
            Load Image
          </Button>
          <Button variant="surface" className="p-1">
            Load Video
          </Button>
          <Button variant="surface" className="p-1">
            Detect
          </Button>
        </Card.Footer>
      </Card.Root>

      <br></br>

      <div>
        {/* TIMER CARD */}
        <Card.Root className="bg-gradient-to-r from-gray-900 via-teal-600 to-cyan-100">
          <Card.Body className="text-center text-gray-900 tracking-widest pb-2 font-bold">
            Game Timer
          </Card.Body>
          <Card.Description className="text-center pb-2 text-gray-900">
            <Countdown date={Date.now() + 10000} />
          </Card.Description>
        </Card.Root>

        <br></br>

        {/* ITEMS FOUND CARD */}
        <Card.Root>
          <Card.Body className="text-center text-teal-900 tracking-widest pb-2">
            Items Found
          </Card.Body>
          <Card.Description className="text-center pb-2">0/4</Card.Description>
        </Card.Root>

        <br></br>
        {/* ITEMS CARD */}
        <ul className="text-center text-teal-900 tracking-widest">
          Items To find:
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
