;
'use strict' //strict mode
//-------------------------------------------------------

function Model(model, parent_ref, content_ref) {
	if ('object' !== typeof model) {
		try {
			model = JSON.parse(model);
		} catch (e) {
			console.log(e);
		}
	}

	if (('object' === typeof model) && model) {
		for (prop_name in model) {
			this[prop_name] = model[prop_name];
		}

		this.children = [];

		if ("children" in model) {
			for (prop_name in model.children) {
				this.children[prop_name] = new Model(model.children[prop_name], this);
			}
		}
	} else {
		this.height = 2.0;
		this.length = 100.0;
		this.width = 3.0;

		this.enginePower = 1.0;

		this.waterLevel = 0.0; //coefficient of height
		this.waterLevelLimits = {
			lower : 0.4,
			higher : 0.9
		};

		this.children = [], //list of nodes
	}

	if (parent_ref) {
		this.paret = parent_ref;
	} else {
		this.paret = null;
	}

	this.content = content_ref; //some data for model user

	Object.defineProperty(this, "paret", { enumerable : false });
	Object.defineProperty(this, "content", { enumerable : false });
};

Model.prototype.think = function (deltaTime /*in ms*/) {
	//...
	for (var i = Things.length - 1; i >= 0; i--) {
		children[i].think(deltaTime);
	}
};

//-------------------------------------------------------
;