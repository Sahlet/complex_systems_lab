;
//-------------------------------------------------------

function nodeFields() {
	var node = {
		paret : null,
		children : [], //list of nodes

		height : 2.0,
		length : 100.0,
		width : 3.0,

		enginePower : 1.0,

		waterLevel : 0.0, //coefficient of height
		waterLevelLimits : {
			lower : 4.0,
			higher : 9.0
		},

		content : null //some data for model user
	};

	return node;
};

var nodeFunctions = {

	think : function(node, deltaTime /*in ms*/) {
		//...
		for (var i = Things.length - 1; i >= 0; i--) {
			children[i].think(deltaTime);
		}
	},

	parse : function (str) {
		return JSON.parse(str);
	},

	stringify : function (node) {
		return JSON.stringify(node);
	}
};

function modelFields() {
	var model = {
		mainNode : null,
		think : function(deltaTime) {
			nodeFunctions.think(mainNode, deltaTime);
		}
	};

	return model;
}

//-------------------------------------------------------
;