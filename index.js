$(document).ready(function() {

    var json_name ={"capitales":{"id": "capitales", "json":"capitales.json", "url": "/capitales"}, 
                    "monumentos":{"id": "monumentos","json":"monumentos.json", "url": "/monumentos"},
                    "edificios": {"id": "edificios","json": "edificios.json", "url" : "/edificios"}};

	puntuacion_total= 0;
	$("#puntos").html("PUNTUACIÓN: " + 	puntuacion_total);

	var greenIcon = L.icon({
    iconUrl: 'squat-marker-green.png',
    iconSize:     [20, 30]//, // size of the icon
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

    var juego; //0 capitales, 1 monumentos
    var interval;
    var photo_counter;
    var count_features = 0;
    var data_json;
    var puntuacion = 0;
    var used_items= [];
    var numJuegos = 0;
    var marker;
    var first= true;

    var map = L.map('map',{
	    center: [20, 5],
	    zoom: 2
    }).locate({setView: true, minZoom: 2, maxZoom: 2});

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

	game_type= '';//inicializamos el juego a vacío

	$("#city_button").click(function() {
		game_type= 'capitales.json';
		document.getElementById("cities_style").style.background = "#D8D8D8"
		document.getElementById("monuments_style").style.background = "#FFFFFF"
		document.getElementById("buildings_style").style.background = "#FFFFFF"
	});
	$("#monuments_button").click(function() {
		game_type= 'monumentos.json';
		document.getElementById("cities_style").style.background = "#FFFFFF"
		document.getElementById("monuments_style").style.background = "#D8D8D8"
		document.getElementById("buildings_style").style.background = "#FFFFFF"
	});
	$("#building_button").click(function() {
		game_type= 'edificios.json';
		document.getElementById("cities_style").style.background = "#FFFFFF"
		document.getElementById("monuments_style").style.background = "#FFFFFF"
		document.getElementById("buildings_style").style.background = "#D8D8D8"
	});

        
        if(first){//IniciLizamos el nivel de difilcultad a medio
		$('#difficulty3').prop('checked', false);
		$('#difficulty2').prop('checked',true);
		$('#difficulty1').prop('checked',false);
        difficulty_level= 2;  	
	}

	$('#difficulty3').change(function(){
		$('#difficulty3').prop('checked', true);
		$('#difficulty2').prop('checked',false);
		$('#difficulty1').prop('checked',false);
        difficulty_level= 3;  
	});
	$('#difficulty2').change(function(){
		$('#difficulty3').prop('checked', false);
		$('#difficulty2').prop('checked',true);
		$('#difficulty1').prop('checked',false);
        difficulty_level= 2;  
	});
	$('#difficulty1').change(function(){
		$('#difficulty3').prop('checked', false);
		$('#difficulty2').prop('checked',false);
		$('#difficulty1').prop('checked',true);
        difficulty_level= 1;  
	});

	function onMapClick(e) {
		console.log(marker);
        var lat = data_json.features[count_features].coordinates.lat;
        var lng= data_json.features[count_features].coordinates.long;
        var item_latlng = L.latLng(lat, lng);
        var click_popup= L.popup();           
        resultado= e.latlng.distanceTo(item_latlng);
		puntuacion_juego= resultado.toFixed(0)*(photo_counter + 1); 
		puntuacion_total= puntuacion_total + puntuacion_juego;
		if(click_popup!=undefined){
			map.removeLayer(click_popup);
		} 
    	click_popup
        	.setLatLng(e.latlng)
        	.setContent("Solución: "+ data_json.features[count_features].properties.name +"<br> Puntuación: " + puntuacion_juego + "<br> Distancia: " + resultado.toFixed(0))
        	.openOn(map);
        if(marker!=undefined){
        	map.removeLayer(marker);
        }

        marker = L.marker([lat, lng], {icon: greenIcon}).addTo(map);
        fin();
		$("#puntos").html("PUNTUACIÓN: " + puntuacion_total.toFixed(2));            
    }

    function nextFeature(cities) { //Aqui pondriamos la variable game  
        photo_counter= 0;
        count_features= Math.floor(Math.random()*9);
        console.log("COUNT FEATURES: " + count_features);
        console.log("IN ARRAY " + $.inArray(count_features, used_items));
        while($.inArray(count_features, used_items) > 0){
        	
        	count_features= Math.floor(Math.random()*9);
        	console.log("DENTRO DEL WHILE: " + count_features);
        } 
        used_items.push(count_features);
        //console.log("Pido capital: " + cities.features[count_features].properties.name);
        var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
        $.getJSON(flickerAPI, {
            tags: cities.features[count_features].properties.name,
            tagmode: "any",
            format: "json"
        })
        .done(function printer( data ){   
            console.log(data.items.length);                   
            interval = setInterval(function(){
                                        if(photo_counter == data.items.length){
                                            fin();
                                        }else{
                                            document.getElementById("images").innerHTML = "";
                                            $( "<img>" ).attr( "src", data.items[photo_counter].media.m).appendTo( "#images" ); 
                                            photo_counter+= 1; 
                                        }
                                        }, 4000/difficulty_level);
        });
    }

    function calculateDate() {
        var d = new Date();
        var hora = d.getHours();
        var minuto = d.getMinutes();
        var segundo = d.getSeconds();
        var month = d.getMonth()+1;
        var day = d.getDate();
        if (hora < 10) {hora = "0" + hora}
		if (minuto < 10) {minuto = "0" + minuto}
		if (segundo < 10) {segundo = "0" + segundo}
        console.log();
        var output = hora+ ":" +minuto+":"+segundo+"  "+ (day<10 ? '0' : '') + day +'/'+ (month<10 ? '0' : '') + month;
        return output;
	}

	function fin(){
        if(used_items.length <= 10){
            clearInterval(interval);
            document.getElementById("images").innerHTML = ""; 
            alert(used_items);
            nextFeature(data_json); 
        }else{
            alert("FUERA");
        }
    }

    $("#play_button").click(function() {
        map.on('click', onMapClick);
        if(game_type == ''){
        	alert("Por favor, eliga un tipo de juego antes de jugar");
        }else{
	        $.getJSON(game_type).done(function(data){
	                                            data_json = data;  
	                                            nextFeature(data_json);
	                                        })
			var name = game_type.split(".")[0];

			var historyObject = {puntuacion: puntuacion_total, juego: game_type};
			history.pushState(historyObject, "nombrePrueba", "?juego=" + name);
	    }    
    });

	$("#stop_button").click(function() {   
	            fin();
	}); 

	$("#new_button").click(function() {   
		alert("new button");
		var name = game_type.split(".")[0];
		alert(name);
		var historyObject = {puntuacion: puntuacion_total, juego: game_type, nivel: difficulty_level};
		history.replaceState(historyObject, "nombrePrueba", "?juego="+name);
		$("#division_line").remove();
		$("#history_list").append('<li value='+numJuegos+'><a><span class=\"tab\">'+ name + ", fecha: " + calculateDate()+'</span></a></li>');
		numJuegos++;
		clearInterval(interval);
		$("#puntos").html("PUNTUACIÓN: " + 	0);
		$("#images").empty();
	}); 

	window.onpopstate = function(event){
		$("#puntos").html("PUNTUACIÓN: " + 	0);		
		puntos = parseFloat(JSON.stringify(event.state.puntuacion));
		//$("#puntos").html("PUNTUACIÓN: " + parseFloat(JSON.stringify(event.state.puntuacion));
		game_type = (JSON.stringify(event.state.juego)).toString();
		var newStr = game_type.substring(0, game_type.length-1);
		newStr = newStr.substring(1, newStr.length);
		console.log(newStr);
		game_type = newStr;	
		difficulty_level = JSON.stringify(event.state.nivel);
		clearInterval(interval);
		console.log(JSON.stringify(event.state.juego));
		//readJSON(JSON.stringify(event.state.juego));
	};

	$("#history_list").on('click', 'li', function (){
	var actualValue = $(this).attr("value");
	//$(this).remove();
	var size = $("#history_list li").length;

	var go = actualValue - numJuegos;
	console.log("go: " + go + ", actualvalue: " + actualValue + ", numjuegos " + numJuegos);
	numJuegos = actualValue;
	if(go != 0)
		history.go(go);


	});
    
});
