(function(){
	tino.db = {};
	
	//Initialisieren der Datenbank
	var db = Ti.Database.open('TitanNotes');
	db.execute('CREATE TABLE IF NOT EXISTS todo(id INTEGER PRIMARY KEY, todoHead TEXT, todoDesc TEXT, createDate DATETIME DEFAULT CURRENT_TIMESTAMP, done INTEGER, url TEXT, capturedLat REAL, capturedLong REAL);');
	db.close();

	tino.db.create = function(_titel,_besch) {
		var db = Ti.Database.open('TitanNotes');
		db.execute("INSERT INTO todo(todoHead,todoDesc,done) VALUES(?,?,?)",_titel,_besch,0);
		db.close();

		// Nun ein Event senden, dass die Datenbank geändert wurde.
		Ti.App.fireEvent("databaseUpdated");
	};
	
	tino.db.list = function(_archiv) {
		// Erstellen eines Arrays todoList zum Sammeln der Daten
		var todoList = [];
		// Öffnen der Datenbank
		var db = Ti.Database.open('TitanNotes');
		// SQL Abfrage der aktuellen ToDo´s
		var result = db.execute('SELECT * FROM todo WHERE done = ? ORDER BY todoHead ASC', (_archiv) ? 1 : 0);
		while (result.isValidRow()) {
			todoList.push({
				//die benötigten Felder für die Tableview im Array erstellen
				title: result.fieldByName('todoHead'),
				id: result.fieldByName('id'), //custom data attribute to pass to detail page
				hasChild:true,
				//zusätzliche Daten in das Array geben
				desc: result.fieldByName("todoDesc"),
				createDate:result.fieldByName("createDate"),
				name: result.fieldByName("todoHead"),
				done: (Number(result.fieldByName("done")) === 1),
				url: result.fieldByName('url'),
				capturedLat: Number(result.fieldByName('capturedLat')),
				capturedLong: Number(result.fieldByName('capturedLong'))
			});
			result.next();
		}
		// Immer das Resultset schliessen
		result.close();
		// Danach die Datenbank schliessen
		db.close();

		// Rückgabe der gefüllten ToDoList
		return todoList;
	};
	
	// Nun noch die Updateprozedur, um den Status zu ändern.
	tino.db.upd2done = function(_id,_lat,_lng) {
		var db = Ti.Database.open('TitanNotes');
		db.execute("UPDATE todo SET done = 1, capturedLat = ?, capturedLong = ? WHERE id = ?",_lat,_lng,_id);
		db.close();

		// Nun ein Event senden, dass die Datenbank geändert wurde.
		Ti.App.fireEvent("databaseUpdated");
	};
	
	// Da "delete" ein reserviertes Wort in Javascript nutzen wir hier "del"
	tino.db.del = function(_id) {
		var db = Ti.Database.open('TitanNotes');
		db.execute("DELETE FROM todo WHERE id = ?",_id);
		db.close();

		// Nun ein Event senden, dass die Datenbank geändert wurde.
		Ti.App.fireEvent("databaseUpdated");
	};

	tino.db.addPhoto = function(_id,_url) {
		var db = Ti.Database.open('TitanNotes');
		db.execute("UPDATE todo SET url = ? WHERE id = ?",_url,_id);
		db.close();

		// Nun ein Event senden, dass die Datenbank geändert wurde.
		Ti.App.fireEvent("databaseUpdated");
	};
	
	tino.db.backup = function(_uname) {	
		var todoList = [];
		var db = Ti.Database.open('TitanNotes');
		var result = db.execute('SELECT * FROM todo ORDER BY todoHead ASC');
		while (result.isValidRow()) {
			todoList.push({
				todoHead: result.fieldByName('todoHead'),
				todoDesc: result.fieldByName("todoDesc"),
				createDate:result.fieldByName("createDate"),
				done: result.fieldByName("done"),
				url: result.fieldByName('url'),
				capturedLat: Number(result.fieldByName('capturedLat')),
				capturedLong: Number(result.fieldByName('capturedLong'))
			});
			result.next();
		}
		result.close();
		db.close();
		
		tino.net.backupTasks(_uname,todoList);
	};
	
	tino.db.createTask = function(_todoHead,_todoDesc,_done,_createDate,_url,_capturedLat,_capturedLong) {	
		var db = Ti.Database.open('TitanNotes');
		Ti.API.info('tino.db.createTask: '+_todoHead);
		db.execute("INSERT INTO todo(todoHead,todoDesc,done,url,capturedLat,capturedLong,createDate) VALUES(?,?,?,?,?,?,?)",
			_todoHead,
			_todoDesc,
			_done,
			_url,
			_capturedLat,
			_capturedLong,
			_createDate
		);
		db.close();

		Ti.App.fireEvent("databaseUpdated");
	};
	
	tino.db.restore = function(_uname) {	
		tino.net.restoreTasks(_uname,function(data) {
			for (var i = 0;i<data.length;i++) {
				tino.db.createTask(
					data[i].todoHead,
					data[i].todoDesc,
					data[i].done,
					data[i].createDate,
					data[i].url,
					data[i].capturedLat,
					data[i].capturedLong
				);
			}
		});
	};
	
})();
