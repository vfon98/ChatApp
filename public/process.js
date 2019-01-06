var socket = io("http://localhost:8080");

socket.on('existed-user', function () {
	alert('Tên bị trùng');
});
socket.on('register-ok', function(data) {
	$('#user').html(data);
	$('#chatbox').fadeIn('slow');
	$('#login').hide();
});
socket.on('sv-list-user', function (data) {
	$('#online-user').html("");
	data.forEach(function (elem) {
		$('#online-user').append('<li class="user">'+ elem +'</li>');
	})
});

socket.on('sv-list-group', function (data) {
	$('#group-list').html("");
	data.forEach(function (elem) {
		$('#group-list').append('<li>'+ elem +'</li>');
	})
});

socket.on('sv-send-message', function (data) {
	$('#chat-content').append('<p class="message"><span class="username">'+ data.user +":</span> "+ data.content+ '</p>');
});
socket.on('sv-typing', function (data) {
	console.log(data + " typing");
	$('#user-typing').html(data + " đang soạn tin nhắn");
});
socket.on('sv-stop-typing', function () {
	$('#user-typing').html("");
	console.log("User stop typing !");
});

$(document).ready(function() {
	$('#chatbox').hide();
	$('#login').show();

	$('#formUser').submit(function() {
		socket.emit('user-register', $('#txtUser').val());
	});
	$('#formChat').submit(function() {
		if ($('#txtMessage').val() != "")
			socket.emit('user-send-message', $('#txtMessage').val());
		$('#txtMessage').val("");
	});
	$('#txtMessage').focusin(function() {
		console.log("MessageBox focused !");
		socket.emit('user-typing');
	});
	$('#txtMessage').focusout(function() {
		console.log("MessageBox stop focused !");
		socket.emit('user-stop-typing');
	});

	//============================================

	$('#formGroup').submit(function() {
		socket.emit('user-create-group', $('#txtGroup').val());
	});
});
