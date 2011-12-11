(function() {
	tino.ui = {};

	tino.ui.createApplicationTabGroup = function() {
		var tabGroup = Titanium.UI.createTabGroup();
		
		var todo = tino.ui.createTodoListWindow(false);
		var archiv = tino.ui.createTodoListWindow(true);
		
		tino.ui.todoTab = Titanium.UI.createTab({
		  title: L('todo_tab'),
		  window: todo
		});
		
		tino.ui.archivTab = Titanium.UI.createTab({
		  title: L('archiv_tab'),
		  window: archiv
		});
		
		// Einzelne Zuweisung der Tabs
		tabGroup.addTab(tino.ui.todoTab);
		tabGroup.addTab(tino.ui.archivTab);
		
		return tabGroup;
	};

	tino.ui.createTodoListWindow = function(/*Boolean*/ _archiv) {
		var win = Titanium.UI.createWindow({
		  title: (_archiv) ? L('archiv_win') :L('todo_win'),
			activity : {
				onCreateOptionsMenu : function(e) {
					var menu = e.menu;
					var m1 = menu.add({ title : L('add') });
					m1.addEventListener('click', function(e) {
						var tab = (_archiv) ? tino.ui.archivTab : tino.ui.todoTab;
						tab.open(tino.ui.createAddWindow());
					});
				}
			}
		});
		
		win.add(tino.ui.createTodoTableView(_archiv));
		
		// Achtung auf iphone und ipad prüfen!
		if (Ti.Platform.osname === 'iphone'|| Ti.Platform.osname === 'ipad') {
			var b = Titanium.UI.createButton({
				title:L('add'),
				style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
			});
			b.addEventListener('click',function() {
				// hier wird das bekannte Window.open mit dem Modal Property geladen
				// das ganze allerdings unter iOS
				tino.ui.createAddWindow().open({modal:true});
			});
			win.setRightNavButton(b);
		}
		
		return win;
	};
	
	tino.ui.createTodoTableView = function(/*Boolean*/ _archiv) {
		var tv = Ti.UI.createTableView();
		
		tv.addEventListener('click', function(_e) {
			var tab = (_archiv) ? tino.ui.archivTab : tino.ui.todoTab;
			tab.open(tino.ui.createDetailWindow(_e.rowData));
		});
		
		function populateData() {
			var results = tino.db.list(_archiv);			
			tv.setData(results);
		}
		
		// Eventlistener zum Starten der Funktion
		Ti.App.addEventListener('databaseUpdated', populateData);
		
		populateData();
		
		return tv;
	};
	
	// Funktion die das DetailWindow erstellt
	Ti.Geolocation.purpose = 'Ortsdaten abspeichern';
	tino.ui.createDetailWindow = function(_done) {
		var win = Ti.UI.createWindow({
			// Fenstertitel = ToDo Überschrift
			title:_done.title,
			layout:'vertical'
		});
		
		win.add(Ti.UI.createLabel({
			text:(_done.done) ? L('status_done') : L('status_open'),
			top:10,
			textAlign:'center',
			font: {
				fontWeight:'bold',
				fontSize:18
			},
			height:'auto'
		}));

		win.add(Ti.UI.createLabel({
			text:L('created')+' '+_done.createDate,
			top:10,
			textAlign:'center',
			height:'auto'
		}));
				
		var ta1 = Titanium.UI.createTextArea({
    		value:_done.desc,
    		height:40,
    		width:200,
    		top:10,
    		font:{fontSize:14,fontFamily:'Marker Felt', fontWeight:'bold'},
    		color:'#000',
    		textAlign:'left',
    		borderWidth:1
		});
		win.add(ta1);

		Ti.API.info(_done.url);
		var imgView = Ti.UI.createImageView({
			image:(_done.url) ? _done.url : 'nophoto.png',
			height:150/2,
			width:120/2,
			top:10
		});
		win.add(imgView);

		var photoButton = Ti.UI.createButton({
			title:L('photo'),
			top:10,
			height:30,
			width:200
		});
		
		photoButton.addEventListener('click', function() {
			if(Ti.Media.isCameraSupported) {
				Ti.Media.showCamera({
					success:function(event) {
						var image = event.media;
						imgView.image = image;
						
						//save for future use
						var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'photo'+_done.id+'.png');
						f.write(image);
						tino.db.addPhoto(_done.id,f.nativePath);
					},
					cancel:function() {},
					error:function(error) {
						var a = Ti.UI.createAlertDialog({title:L('camera_error')});
						if (error.code == Ti.Media.NO_CAMERA) {
							a.setMessage(L('camera_error_details'));
						}
						else {
							a.setMessage('Unexpected error: ' + error.code);
						}
						a.show();
					},
					saveToPhotoGallery:true,
					allowEditing:true,
					mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
				});
			} else {
				Ti.Media.openPhotoGallery({
					success:function(event) {
						var image = event.media;
						imgView.image = image;
						
						//save for future use
						var f = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory,'photo'+_done.id+'.png');
						f.write(image);
						tino.db.addPhoto(_done.id,f.nativePath);
					},
					cancel:function() {},
					error:function(error) {
						var a = Ti.UI.createAlertDialog({title:L('camera_error')});
						if (error.code == Ti.Media.NO_CAMERA) {
							a.setMessage(L('camera_error_details'));
						}
						else {
							a.setMessage('Unexpected error: ' + error.code);
						}
						a.show();
					},
					saveToPhotoGallery:true,
					allowEditing:true,
					mediaTypes:[Ti.Media.MEDIA_TYPE_PHOTO]
				});
			}
		});
		win.add(photoButton);
				
		if (!_done.done) {
			var doneButton = Ti.UI.createButton({
				title:L('completed'),
				top:10,
				height:40,
				width:200
			});
			win.add(doneButton);
			
			doneButton.addEventListener('click', function(_e) {
				if (Ti.Geolocation.locationServicesEnabled) {
					Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
					Ti.Geolocation.getCurrentPosition(function(e) {
						var lng = e.coords.longitude;
						var lat = e.coords.latitude;
						tino.db.upd2done(_done.id, lat, lng);
							//on android, give a bit of a delay before closing the window...
							if (Ti.Platform.osname == 'android') {
								setTimeout(function() {
									win.close();
								},2000);
							}
							else {
								win.close();
							}
					});
				}
				else {
					Ti.UI.createAlertDialog({
						title:L('geo_error'), 
						message:L('geo_error_details')
					}).show();
					tino.db.upd2done(_done.id, 0, 0);
				}
			});			
		} else {
			var mapButton = Ti.UI.createButton({
				title:L('map_button'),
				top:10,
				height:30,
				width:200
			});
			mapButton.addEventListener('click', function() {
				var maptab = tino.ui.archivTab;
				maptab.open(tino.ui.createMapWindow(_done));
			});
			win.add(mapButton);
		};
		
		var deleteButton = Ti.UI.createButton({
			title:L('delete'),
			top:10,
			height:40,
			width:200
		});
		
		deleteButton.addEventListener('click', function(_e) {
			//alert('implement delete!');
			tino.db.del(_done.id);
			win.close();
		});
		
		win.add(deleteButton);
		
		return win;
	};
	
	tino.ui.createAddWindow = function() {
		var win = Ti.UI.createWindow({
			title:L('new_todo'),
			layout:'vertical',
			backgroundColor:'#fff'
		});
		
		//Ein Close-Button da auf iOS kein Hardware Backbutton
		if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
			var b = Titanium.UI.createButton({
				title:L('close'),
				style:Titanium.UI.iPhone.SystemButtonStyle.PLAIN
			});
			b.addEventListener('click',function() {
				win.close();
			});
			win.setRightNavButton(b);
		}
		
		//ToDo-Titel
		var todoTitle = Ti.UI.createTextField({
			height:40,
			top:10,
			width:'80%',
			keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
			returnKeyType:Titanium.UI.RETURNKEY_DONE,
			borderWidth:1,
			hintText:L('todo_name')
		});
		win.add(todoTitle);
		
		
		//ToDo-Beschreibung
		var todoDesc = Titanium.UI.createTextArea({
    		height:80,
    		width:'80%',
    		top:10,
    		textAlign:'left',
    		borderWidth:1,
    		hintText:L('todo_desc'),
    		keyboardType:Titanium.UI.KEYBOARD_DEFAULT,
			returnKeyType:Titanium.UI.RETURNKEY_DONE
		});
		
		win.add(todoDesc);

		var save = Ti.UI.createButton({
			title:L('save'),
			height:40,
			width:'80%',
			top:10
		});
		
		//  Eventlistener der auf den Speicherbutton reagiert.
		save.addEventListener('click', function() {
			// Aufruf der Datenbankfunktion für das erstellen eines neuen Datensatz
			tino.db.create(todoTitle.value,todoDesc.value);
			win.close();
		});
		win.add(save);
		
		return win;
	};
	
	tino.ui.createMapWindow = function(/*Object*/ _done) {
		Ti.API.info('Das sind die Koordinaten... '+_done.capturedLat+':'+_done.capturedLong);
		
		var win = Ti.UI.createWindow({
			title:L('done_at'),
			backgroundColor:'#fff'
		});
		
		var ann = Ti.Map.createAnnotation({
			latitude:_done.capturedLat,
			longitude:_done.capturedLong,
			title:_done.name,
			pincolor:Ti.Map.ANNOTATION_RED,
			animate:true
		});
		
		var mapview = Ti.Map.createView({
			mapType: Ti.Map.STANDARD_TYPE,
			region:{latitude:_done.capturedLat, longitude:_done.capturedLong, latitudeDelta:0.1, longitudeDelta:0.1},
			animate:true,
			regionFit:true,
			userLocation:false,
			annotations:[ann]
		});
		
		win.add(mapview);
		
		return win;
	};
	
})();