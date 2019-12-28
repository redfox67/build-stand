#!/usr/bin/env python3
# # Copyright 2019 Amazon.com, Inc. or its affiliates.  All Rights Reserved.
# 
# You may not use this file except in compliance with the terms and conditions 
# set forth in the accompanying LICENSE.TXT file.
#
# THESE MATERIALS ARE PROVIDED ON AN "AS IS" BASIS. AMAZON SPECIFICALLY DISCLAIMS, WITH 
# RESPECT TO THESE MATERIALS, ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING 
# THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

import os
import sys
import time
import logging
import json
import random
import threading
from enum import Enum

from agt import AlexaGadget

from ev3dev2.led import Leds
from ev3dev2.sound import Sound
from ev3dev2.motor import OUTPUT_A, OUTPUT_B, OUTPUT_C, LargeMotor, SpeedPercent, MediumMotor

# Set the logging level to INFO to see messages from AlexaGadget
logging.basicConfig(level=logging.INFO, stream=sys.stdout, format='%(message)s')
logging.getLogger().addHandler(logging.StreamHandler(sys.stderr))
logger = logging.getLogger(__name__)


class Direction(Enum):
    """
    The list of directional commands and their variations.
    These variations correspond to the skill slot values.
    """
    UP = ['up', 'tilt up']
    DOWN = ['down', 'tilt down']
    TILTLEFT = ['left', 'tilt left']
    TILTRIGHT = ['right', 'tilt right']
    TURNRIGHT = ['turn right', 'rotate right']
    TURNLEFT = ['turn left', 'rotate left']
    STOP = ['stop', 'brake', 'halt']
    RESET = ['reset', 'set level']
class Command(Enum):
    """
    The list of preset commands and their invocation variation.
    These variations correspond to the skill slot values.
    """
    CIRCLE = ['circle', 'rotate', 'turn around']
    TILT_TURN_RIGHT = ['tilt and turn right']
    TILT_TURN_LEFT = ['tilt and turn left']
    RESET = ['reset', 'set level']

class MindstormsGadget(AlexaGadget):

    def __init__(self):
        """
        Performs Alexa Gadget initialization routines and ev3dev resource allocation.
        """
        super().__init__()

        # Robot state
        self.stay_mode = False

        # Connect two large motors on output ports B and C
        self.tiltup = LargeMotor(OUTPUT_B)
        self.tiltright = LargeMotor(OUTPUT_C)
        self.spin = MediumMotor(OUTPUT_A)
        self.sound = Sound()
        self.leds = Leds()
        

       
    def on_connected(self, device_addr):
        """
        Gadget connected to the paired Echo device.
        :param device_addr: the address of the device we connected to
        """
        self.leds.set_color("LEFT", "GREEN")
        self.leds.set_color("RIGHT", "GREEN")
        logger.info("{} connected to Echo device".format(self.friendly_name))

    def on_disconnected(self, device_addr):
        """
        Gadget disconnected from the paired Echo device.
        :param device_addr: the address of the device we disconnected from
        """
        self.leds.set_color("LEFT", "BLACK")
        self.leds.set_color("RIGHT", "BLACK")
        logger.info("{} disconnected from Echo device".format(self.friendly_name))
    
    def on_custom_mindstorms_gadget_control(self, directive):
        """
        Handles the Custom.Mindstorms.Gadget control directive.
        :param directive: the custom directive with the matching namespace and name
        """
        try:
            payload = json.loads(directive.payload.decode("utf-8"))
            print("Control payload: {}".format(payload), file=sys.stderr)
            control_type = payload["type"]
            if control_type == "move":
                # Expected params: [direction, angle, speed]
                self._move(payload["direction"], int(payload["angle"]), int(payload["speed"]))

            if control_type == "command":
                # Expected params: [command]
                self._activate(payload["command"])

        except KeyError:
            print("Missing expected parameters: {}".format(directive), file=sys.stderr)

    def _move(self, direction, angle: int, speed: int, is_blocking=False):
        """
        Handles move commands from the directive.
        Right and left movement can under or over turn depending on the surface type.
        :param direction: the move direction
        :param angle: the angle in degrees
        :param speed: the speed percentage as an integer
        :param is_blocking: if set, motor run until angle expired before accepting another command
        """
        print("Move command: ({}, {}, {}, {})".format(direction, speed, angle, is_blocking), file=sys.stderr)
        if direction in Direction.UP.value:
            self.tiltup.on_for_degrees(SpeedPercent(-speed), angle, block=is_blocking)

        if direction in Direction.DOWN.value:
            self.tiltup.on_for_degrees(SpeedPercent(speed), angle, block=is_blocking)

        if direction in Direction.TILTRIGHT.value:
            self.tiltright.on_for_degrees(SpeedPercent(speed), angle, block=is_blocking)

        if direction in Direction.TILTLEFT.value:
            self.tiltright.on_for_degrees(SpeedPercent(-speed), angle, block=is_blocking)

        if direction in Direction.TURNLEFT.value:
            self.spin.on_for_degrees(SpeedPercent(speed), angle, block=is_blocking)  

        if direction in Direction.TURNRIGHT.value:
            self.spin.on_for_degrees(SpeedPercent(-speed), angle, block=is_blocking)      

        if direction in Direction.STOP.value:
            self.drive.off()
            self.stay_mode = False

    def _activate(self, command, speed=50):
        """
        Handles preset commands.
        :param command: the preset command
        :param speed: the speed if applicable
        """
        print("Activate command: ({}, {})".format(command, speed), file=sys.stderr)
        if command in Command.CIRCLE.value:
            self.spin.on_for_degrees(SpeedPercent(int(speed)), SpeedPercent(1), 12)

        if command in Command.TILT_TURN_LEFT.value:
            for i in range(4):
                self.tiltright("", 2, speed, is_blocking=True)
                self.spin.on_for_degrees(SpeedPercent(int(-speed)), SpeedPercent(1), 12)

        if command in Command.TILT_TURN_RIGHT.value:
            for i in range(4):
                self.tiltright("", 2, -speed, is_blocking=True)

        if command in Command.TILT_TURN_RIGHT.value:
            for i in range(4):
                self.tiltright("", 2, -speed, is_blocking=True)

#        if command in Command.RESET.value:

        

    
if __name__ == '__main__':

    gadget = MindstormsGadget()

    # Set LCD font and turn off blinking LEDs
    os.system('setfont Lat7-Terminus12x6')
    gadget.leds.set_color("LEFT", "BLACK")
    gadget.leds.set_color("RIGHT", "BLACK")

    # Startup sequence
    gadget.sound.play_song((('C4', 'e'), ('D4', 'e'), ('E5', 'q')))
    gadget.leds.set_color("LEFT", "GREEN")
    gadget.leds.set_color("RIGHT", "GREEN")

    # Gadget main entry point
    gadget.main()

    # Shutdown sequence
    gadget.sound.play_song((('E5', 'e'), ('C4', 'e')))
    gadget.leds.set_color("LEFT", "BLACK")
    gadget.leds.set_color("RIGHT", "BLACK")
