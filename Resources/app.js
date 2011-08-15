// Hintergrundfarbe wird gesetzt
Titanium.UI.setBackgroundColor('#ffffff');

var tino = {}; //tino ist unser applications namespace
Ti.include( // hier folgt die Liste der Dateien die Eingebunden werden sollen.
	'ui.js'
);

// Die Funktion "createApplicationTabGroup" aus der ui.js wird für die 
// Erstellung der UI genutzt.
var tabs = tino.ui.createApplicationTabGroup();
tabs.open();

// Ausgabe der 
Ti.API.info('Willkommen bei Titan Notes für '+Ti.Platform.osname);