import RPi.GPIO as GPIO
import time


# setup GIO pins
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(16, GPIO.OUT) # LED with 470 ohm resistor > 0.007 Ampere

print("LED 470 ohm on")
GPIO.output(16,GPIO.HIGH)
time.sleep(1)

print("LED 470 ohm off")
GPIO.output(16,GPIO.LOW)
time.sleep(1)


# setup LED 2
GPIO.setup(20, GPIO.OUT) # LED with 220 ohm resistor > 0.015 Ampere

print("LED 220 ohm on")
GPIO.output(20,GPIO.HIGH)
time.sleep(1)

print("LED 220 ohm off")
GPIO.output(20,GPIO.LOW)


GPIO.cleanup()
