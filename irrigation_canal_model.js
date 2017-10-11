;
'use strict' //strict mode
//-------------------------------------------------------

function Model(model, parent_ref, content_ref) {
	if ('object' !== typeof model) {
		try {
			model = JSON.parse(model);
		} catch (e) {
			console.error(e);
		}
	}

//------------------------------

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
		this.waterLevelLimits = {
			lower : 0.4,
			higher : 0.9
		};
		this.waterLevel = 0.0; //coefficient of height

		this.children = []; //list of nodes
	}

//------------------------------

	Object.defineProperty(this, "engineWorks", {
		value : false,
		writable : true,
		enumerable : false,
		configurable : false
	});

//------------------------------

	Object.defineProperty(this, "_parent_", {
		value : null,
		writable : true,
		enumerable : false,
		configurable : false
	});
	Object.defineProperty(this, "parent", {
		get : function() { return this._parent_; },
		set : function(value) {
			if (this.parent === value) { return; }
			if (value !== null && classof(value) != "Model") {
				console.warn("classof(value) != \"Model\"");
			}
			this.parent = value;
			this.updateEngineWorks();
		},
		enumerable : false,
		configurable : false
	});

	if (parent_ref) {
		this.paret = parent_ref;
	} else {
		this.paret = null;
	}

//------------------------------

	Object.defineProperty(this, "waterLevelOnChange", {
		value : new ObservableSubject(),
		writable : false,
		enumerable : false,
		configurable : false
	});
	Object.defineProperty(this, "_waterLevel_", {
		value : this.waterLevel,
		writable : true,
		enumerable : false,
		configurable : false
	});
	Object.defineProperty(this, "waterLevel", {
		get : function() { return this._waterLevel_; },
		set : function(value) {
			var clamp_value = Math.max(0, Math.min(1, value));
			console.log("in set 1");
			if (this._waterLevel_ !== clamp_value) {
				console.log("in set 2");
				this._waterLevel_ = clamp_value;
				this.waterLevelOnChange.notify(this._waterLevel_, this);
			}
		},
		enumerable : true,
		configurable : false
	});

//------------------------------

	this.content = content_ref; //some data for model user
	Object.defineProperty(this, "content", { enumerable : false });
	
//------------------------------

};

//------------------------------

Model.prototype.updateEngineWorks = function () {
	this.engineWorks = (this.parent.waterLevel < this.waterLevelLimits.higher) && (!this.parent || this.parent.waterLevel > 0);
};

//------------------------------

Model.prototype.think = function (deltaTime /*in ms*/) {
	//...
	children.forEach(function(value) {
		value.think(deltaTime);
	});
	updateEngineWorks();
};

//------------------------------

Model.prototype.increaseCommonWaterLevel = function (deltaHeight) {
	if (!deltaHeight || "number" !== typeof deltaHeight) {
		console.error("bad arg deltaHeight = " + deltaHeight);
		return;
	}
	this.waterLevel += this.height / deltaHeight;
	children.forEach(function(value) {
		value.increaseCommonWaterLevel(deltaHeight);
	});
};

//------------------------------

//-------------------------------------------------------
;