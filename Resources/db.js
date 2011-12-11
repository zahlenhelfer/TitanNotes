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
	
})();
