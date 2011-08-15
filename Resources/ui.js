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
		  title: (_archiv) ? L('archiv_win') :L('todo_win')
		});
		win.add(tino.ui.createTodoTableView(_archiv));
		
		return win;
	};
	
	tino.ui.createTodoTableView = function(/*Boolean*/ _archiv) {
		var tv = Ti.UI.createTableView();
		
		tv.addEventListener('click', function(_e) {
			var tab = (_archiv) ? tino.ui.archivTab : tino.ui.todoTab;
			tab.open(tino.ui.createDetailWindow(_e.rowData));
		});
		
		function populateData() {
			// Hier nutzen wir erstmal einmal statische Daten
			var results = [
				{title:'Artikel schreiben', hasChild:true, archiv:false},
				{title:'Android 3.0 testen', hasChild:true, archiv:false},
				{title:'Müll rausbringen', hasChild:true, archiv:true},
				{title:'iOS 5 Beta installieren', hasChild:true, archiv:false},
				{title:'Auto waschen', hasChild:true, archiv:true}
			];
			
			function showEntry(element, index, array) {
				if (element.archiv == _archiv)
        			return true;
    			else
        			return false;
			};
			
			// Filtern der Einträge nach Status
			var show_results = results.filter(showEntry);
			
			tv.setData(show_results);
		}
		
		populateData();
		
		return tv;
	};
	
	// Funktion die das DetailWindow erstellt
	tino.ui.createDetailWindow = function(/*Object*/ _done) {
		var win = Ti.UI.createWindow({
			// Fenstertitel = ToDo Überschrift
			title:_done.title,
			layout:'vertical'
		});
		
		win.add(Ti.UI.createLabel({
			text:(_done.archiv) ? L('status_done') : L('status_open'),
			top:10,
			textAlign:'center',
			font: {
				fontWeight:'bold',
				fontSize:18
			},
			height:'auto'
		}));
		
		var ta1 = Titanium.UI.createTextArea({
    		value:L('todo_desc'),
    		height:50,
    		width:200,
    		top:10,
    		font:{fontSize:14,fontFamily:'Marker Felt', fontWeight:'bold'},
    		color:'#000',
    		textAlign:'left',
    		borderWidth:1
		});
		win.add(ta1);
		
		if (!_done.archiv) {
			var doneButton = Ti.UI.createButton({
				title:L('completed'),
				top:10,
				height:40,
				width:200
			});
			win.add(doneButton);
			
			doneButton.addEventListener('click', function(_e) {
				alert('implement status change!');
			});
			
		};
		
		var deleteButton = Ti.UI.createButton({
			title:L('delete'),
			top:10,
			height:40,
			width:200
		});
		win.add(deleteButton);
		
		deleteButton.addEventListener('click', function(_e) {
			alert('implement delete!');
		});
		
		return win;
	};
})();