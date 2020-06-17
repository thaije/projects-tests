import RPi.GPIO as GPIO
import time


# setup GIO pins
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)
GPIO.setup(21, GPIO.OUT) # Adafruit Sequin 220 ohm resistor + 100ohm internal resistor? > 0.01 Ampere

print("Sequin on")
GPIO.output(21,GPIO.HIGH)
time.sleep(1)

print("Sequin off")
GPIO.output(21,GPIO.LOW)
