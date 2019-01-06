var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('public'));

server.listen(8080, function() {
	console.log("listening port 8080");
});
app.get("/",  function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

var listUser = [];
var listGroup = [];
io.on('connection', function(socket) {
	console.log("User connected: " + socket.id);

	socket.on('user-register', function (data) {
		if (listUser.indexOf(data) >= 0) {
			socket.emit('existed-user');
		}
		else {
			socket.username = data;
			listUser.push(data);
			socket.emit('register-ok', data);
			io.sockets.emit('sv-list-user', listUser);
			io.emit("sv-list-group", listGroup);
		}
	});

	socket.on('user-create-group', function (data) {
		if (listGroup.indexOf(data) >= 0) {
			// socket.emit('existed-group');
		}
		else {
			socket.join(data);
			socket.group = data;
			listGroup.push(data);
			io.sockets.emit('sv-list-group', listGroup);
		}
	});
	
	socket.on('user-send-message', function (data) {
		io.sockets.emit('sv-send-message', {user: socket.username, content: data});
	});

	socket.on('user-typing', function () {
		socket.broadcast.emit('sv-typing', socket.username);
	});

	socket.on('user-stop-typing', function () {
		socket.broadcast.emit('sv-stop-typing');
	});

	//============= LIST ONLINE USER ====================

	socket.on('disconnect', function () {
		socket.leave(socket.group);
		listGroup.splice(listGroup.indexOf(socket.group), 1);
		io.sockets.emit("sv-list-group", listGroup);

		listUser.splice(listUser.indexOf(socket.username), 1);
		io.sockets.emit('sv-list-user', listUser);
		console.log("User disconnected: " + socket.id);
	});
});