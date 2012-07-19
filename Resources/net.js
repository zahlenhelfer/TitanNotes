(function() {
	tino.net = {};
	tino.net.restoreTasks = function(_uname,_cb) {
		Ti.API.info('Hole tasks für: '+_uname);
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {
			_cb(JSON.parse(this.responseText));
		};
		xhr.open("GET","http://tino.zhapps.de/restore.php");
		xhr.send({
			username:_uname
		});
	};
	
	tino.net.backupTasks = function(_uname,_todo) {
		Ti.API.info('Sende tasks für: '+_uname);
		Ti.API.info('tasks: '+JSON.stringify(_todo));
		var xhr = Titanium.Network.createHTTPClient();
		xhr.onload = function() {};
		xhr.open("POST","http://tino.zhapps.de/backup.php");
		xhr.send({
			username:_uname,
			todo:JSON.stringify(_todo)
		});
	};
})();