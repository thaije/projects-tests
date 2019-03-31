var namespace = "/agent";

// make connection with python server via socket
var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

// get ID of current agent
var id = document.getElementById('id').innerHTML;

// Connect to server
socket.on('connect', function() {
    var room = "/agent/" + id;

    // request to be added to room
    console.log("Requesting to be added to room:", room)
    socket.emit('join', {room: room});
});


// receive a test update from the python server
socket.on('test', function(data){
    console.log("got a message:", data);
});

// 
// // send message to Python server every 1 second
// setInterval(function() {
//     socket.emit("test", "yo from agent GUI");
//     console.log("Sending test");
// }, 1000);



document.onkeydown = checkArrowKey;
function checkArrowKey(e) {
    e = e || window.event;

    if (e.keyCode < 37 || e.keyCode > 40) {
        return;
    }

    socket.emit("test", "Hello from agent");
}
