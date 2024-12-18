import { Card } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import React from "react";
import ReactDOM from "react-dom";
import Countdown from "react-countdown";

export const Items = () => {
  const items = ["Item1", "Item2", "Item3", "Item4"];

  return (
    <div>
      <Card.Root>
        <Card.Body gap="2">
          <Card.Title className="text-center text-teal-900 tracking-widest">
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
      <ul className="text-center text-teal-900 tracking-widest">
        Items To find:
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <br></br>
      <div>
        <Card.Root>
          <Card.Body className="text-center text-teal-900 tracking-widest pb-2">
            Game Timer
          </Card.Body>
          <Card.Description className="text-center pb-2">
            <Countdown date={Date.now() + 10000} />
          </Card.Description>
        </Card.Root>
        <br></br>
        <Card.Root>
          <Card.Body className="text-center text-teal-900 tracking-widest pb-2">
            Items Found
          </Card.Body>
          <Card.Description className="text-center pb-2">0/4</Card.Description>
        </Card.Root>
      </div>
    </div>
  );
};
