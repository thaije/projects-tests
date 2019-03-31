from flask import Flask, request, render_template, jsonify
from flask_socketio import SocketIO, join_room, emit
from time import sleep
import numpy as np
from threading import Lock



# app = Flask(__name__)
app = Flask(__name__, template_folder='static/templates')
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
thread = None
thread_lock = Lock()


# send a periodic message to a specific room
def background_thread(room):
    while True:
        socketio.sleep(1)
        emit('test', "Hey room " + str(room) + "!", room=room)
        emit('test', "Hey room " + str(room) + "!", room=room)


# route for agent, get the ID from the URL
@app.route('/agent/<id>')
def index_a(id):
    return render_template('agent.html', id=id)


# route for agent, get the ID from the URL
@app.route('/human-agent/<id>')
def index_ha(id):
    return render_template('human_agent.html', id=id)



# add client to a room for their specific (human) agent ID
@socketio.on('join', namespace='/agent')
@socketio.on('join', namespace='/humanagent')
def join(message):
    join_room(message['room'])
    print("Added client to room:", message["room"])

    emit('test', "Hey room " + message['room'] + "!", room=message['room'])
    print("sending message to room", message['room'])


# receive pings and send pongs after 1s
@socketio.on('my_ping', namespace='/agent')
@socketio.on('my_ping', namespace='/humanagent')
def ping_pong():
    socketio.sleep(1)
    emit('my_pong')


@socketio.on('test', namespace="/agent")
def handle_test_a(message):
    print('received test from /agent: ' + message)


@socketio.on('test', namespace="/humanagent")
def handle_test_ha(message):
    print('received test from /humanagent: ' + message)

@socketio.on('my_ping', namespace='/agent')
@socketio.on('my_ping', namespace='/humanagent')
@socketio.on('connect')
def test_connect():
    print('got a connect')


if __name__ == "__main__":
    print("Starting server")
    socketio.run(app, port=3000)
