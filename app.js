var http = require('http');
var Static = require('node-static');
var app = http.createServer(handler);
var io = require('socket.io').listen(app);
var port = 8080;
var active = false;
var update = false;
var users = [];


var files = new Static.Server('./public');

function handler (request, response) {
	request.on('end', function() {
		files.serve(request, response);
	}).resume();
}

var ucount = 0;
var numUsers = 0;

io.on('connection', (socket) => {
  var addedUser = false;
  socket.on('add user', (username) => {
    if (addedUser) return;
    socket.username = username;
    ++numUsers;
  // console.log(username+' has logged on, now there are '+numUsers+' online');
  var new_count = users.length;
    console.log(new_count);
   var new_user={  
    username : username,  
    active : active,
    lat : null,
    lng : null,
    update : false  
    }; 


   var z = users.push(new_user);
   console.log(users);
  });

  socket.on('new_coords', (data) => {
    var New_Details={  
        username : data.username,  
        active : data.active,
        lat : data.new_lat,
        lng : data.new_lng, 
        update : true
        }; 

var checkuser = data.username;
result = users.map(obj => obj.username).indexOf(checkuser) >= 0;
//console.log (result);

if (result === true) {

objIndex = users.findIndex((obj => obj.username == data.username));
users[objIndex].lat = data.new_lat;
//console.log("After update: ", users[objIndex]);

objIndex = users.findIndex((obj => obj.username == data.username));
users[objIndex].lng = data.new_lng;
//console.log("After update: ", users[objIndex]);

objIndex = users.findIndex((obj => obj.username == data.username));
users[objIndex].active = data.active;

objIndex = users.findIndex((obj => obj.username == data.username));
users[objIndex].update = true;

var to_send={  
    username : data.username,  
    active : true,
    lat : data.new_lat,
    lng : data.new_lng,
    update : true  
    }; 

        

    console.log(data.username + ' has just updated their location');
    var new_count = users.length;
    console.log(new_count);
    console.log(users);

    socket.broadcast.emit('updatecoords', to_send);  
    // then change back to no need to update

    objIndex = users.findIndex((obj => obj.username == data.username));
    users[objIndex].update = false;
  } 
    
  });
  
  
  socket.on('load_init', (data) => {
    socket.emit('load_init', users);
})


	
// when the user disconnects.. perform this

socket.on('disconnect', () => {
       --numUsers;
       
      //remove from array
      for (var i =0; i < users.length; i++)
   if (users[i].username === socket.username) {
    socket.broadcast.emit('remove_marker', {
        username: users[i].username
      });
      users.splice(i,1);
      break;
   }
      // 
       //console.log('needs marker removing')
       //console.log(socket.username+' has left, now there are '+numUsers+' online');
       var new_count = users.length;
    console.log(new_count);
    console.log('remove marker');
});

	
});





// start app on specified port
app.listen(port);
console.log('Your server goes on localhost:' + port);
