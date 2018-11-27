$(function() {
	// generate unique user id
	var userId = Math.random().toString(16).substring(2,15);
	var socket = io.connect('/');
	socket.emit('add user', username);
	var map;


	var info = $('#infobox');
	var doc = $(document);

	// custom marker's icon styles
	var tinyIcon = L.Icon.extend({
		options: {
			shadowUrl: '../assets/marker-shadow.png',
			iconSize: [25, 39],
			iconAnchor:   [12, 36],
			shadowSize: [41, 41],
			shadowAnchor: [12, 38],
			popupAnchor: [0, -30]
		}
	});
	var redIcon = new tinyIcon({ iconUrl: '../assets/marker-red.png' });
	var yellowIcon = new tinyIcon({ iconUrl: '../assets/marker-yellow.png' });

	var sentData = {};
	var connects = {};
	var markers = {};
	var active = false;

	socket.on('remove_marker', function (data) {
		for (var ident in connects){
			if (connects[ident]) {
				delete connects[ident];
				map.removeLayer(markers[ident]);
				console.log("delete marker" + data.username);
			}
		}
		//var deleteuser = data.username;
		//map.removeLayer(newuser);
		//alert("delete marker" + data.username);
		
		});

	socket.on('load:coords', function(data) {
		if (!(data.id in connects)) {
			console.log(username+' connected');
			setMarker(data);
		}

		connects[data.id] = data;
		//connects[data.id].updated = $.now();
	});

	// check whether browser supports geolocation api
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(positionSuccess, positionError, { enableHighAccuracy: true });
	} else {
		$('.map').text('Your browser is out of fashion, there\'s no geolocation!');
	}

	map = L.map('map').fitWorld();

	function positionSuccess(position) {
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;
		var acr = position.coords.accuracy;
		
	var newLatLng = new L.LatLng(lat, lng);
 
		

		// mark user's position
		var userMarker = L.marker([lat, lng], {
			icon: redIcon
		});
		
		   
		// uncomment for static debug
		// userMarker = L.marker([51.45, 30.050], { icon: redIcon });

		// load leaflet map
	


	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
			'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		id: 'mapbox.streets'
	}).addTo(map);
		
		userMarker.addTo(map);
		userMarker.bindPopup('<p>You are here ' + username + '</p>').openPopup();

		var emit = $.now();
		// send coords on when user is active
			active = true;

			sentData = {
				id: username,
				active: active,
				coords: [{
					lat: lat,
					lng: lng,
					acr: acr,
					name: username
				}]
			}

				socket.emit('send:coords', sentData);
		}




	// showing markers for connections
	function setMarker(data) {
		for (var i = 0; i < data.coords.length; i++) {
			
			var num = +$("#count").text() + 1;
			$("#count").text(num);
			
						 
			var marker = L.marker([data.coords[i].lat, data.coords[i].lng], { icon: yellowIcon }).addTo(map);
			marker.bindPopup('<p>One more external user is here!</p>' + data.coords[i].name);
			markers[data.id] = marker;
			
		}
	}

	// handle geolocation api errors
	function positionError(error) {
		var errors = {
			1: 'Authorization fails', // permission denied
			2: 'Can\'t detect your location', //position unavailable
			3: 'Connection timeout' // timeout
		};
		showError('Error:' + errors[error.code]);
	}

	function showError(msg) {
		info.addClass('error').text(msg);

		doc.click(function() {
			info.removeClass('error');
		});
	}



});