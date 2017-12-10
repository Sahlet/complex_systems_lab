;
'use strict' //strict mode
//-------------------------------------------------------

/*
я обозначу парамтры ниже, которые нужно учитывать при рисовании конкретного тоннеля.
все кроме уровня воды и работы двигателя при вызове функции think и increaseCommonWaterLevel не меняется
(то есть все кроме уровня воды и работы двигателя вообще не меняется после создания если ты сам не поменяешь).

все, чем тебе надо пользоватья в этом файле, это:
-поля объекта Model,
-после создания модели вызвать addObserver у полей с типом ObservableSubject (как в примере)
-вызывать фуркции think (чем чаще тем лучше) и increaseCommonWaterLevel (когда надо сделать дождь (дождб кстати можешь отрисовать))

*/

function createDefaultModel() {
	var default_model = {
		climb : 1, // in m								/*учитывать при рисовании (подъем тоннеля над предыдущим (родительским) тоннелем, можешь особо не париться над соединением тоннелей, если хочешь можешь нарисовать трубу между родительским тоннелем и тоннелем ребенком)*/
		height : 2, // in m								/*учитывать при рисовании*/
		length : 100, // in m							/*учитывать при рисовании*/
		width : 3, // in m								/*учитывать при рисовании*/
		enginePower : 1, // in W
		leak : 0.01, // in m/sec
		waterLevelLimits : {
			lower : 0.4,
			higher : 0.9
		},
		waterLevel : 0, //coefficient of height			/*учитывать при рисовании (это коефиициент, который изменяется от 0 (минимум) до 1 максимум, чтоб понять какой уровень воды в метрах - умнож waterLevel на height)*/

		children : [], //list of nodes
	};

	return default_model;
}

/*
это конструктор модели. сюда в первый аргумент надо передать JSON строку, в которой хранится модель.
*/
function Model(model, parent_ref, content_ref) {
	if ('object' !== typeof model) {
		try {
			model = JSON.parse(model);
		} catch (e) {
			console.error(e);
		}
	}

//------------------------------

	if (!model || ("object" !== typeof model)) {
		model = createDefaultModel();
	}

	for (prop_name in model) {
		this[prop_name] = model[prop_name];
	}

	this.children = [];

	if ("children" in model) {
		for (prop_name in model.children) {
			this.children[prop_name] = new Model(model.children[prop_name], this);
		}
	}

//------------------------------

	Object.defineProperty(this, "engineWorksOnChange", {
		value : new ObservableSubject(),
		writable : false,
		enumerable : false,
		configurable : false
	});
	Object.defineProperty(this, "_engineWorks_", {
		value : false,
		writable : true,
		enumerable : false,
		configurable : false
	});
	Object.defineProperty(this, "engineWorks", {
		get : function() { return this._engineWorks_; },
		set : function(value) {
			if (this._engineWorks_ === value) { return; }
			this._engineWorks_ = value;
			this.engineWorksOnChange.notify(this._engineWorks_, this);
		},
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
			if (this._parent_ === value) { return; }
			this._parent_ = value;
			this.updateEngineWorks();
		},
		enumerable : false,
		configurable : false
	});

	if (parent_ref) {
		this.parent = parent_ref;
	} else {
		this.parent = null;
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
			if (this._waterLevel_ === clamp_value) { return; }

			var clamp_value = Math.max(0, Math.min(1, value));
			this._waterLevel_ = clamp_value;
			this.waterLevelOnChange.notify(this._waterLevel_, this);
			this.updateEngineWorks();
		},
		enumerable : true,
		configurable : false
	});

//------------------------------

	Object.defineProperty(this, "content", { //some data for model user
		value : content_ref,
		writable : true,
		enumerable : false,
		configurable : false
	});
	
//------------------------------

	Object.defineProperty(this, "counting_waterLevel", { //to not call waterLevelOnChange during counting
		value : this.waterLevel,
		writable : true,
		enumerable : false,
		configurable : false
	});

//------------------------------

};

//------------------------------

Model.prototype.getVolume = function () {
	return this.height*this.length*this.width;
};

//------------------------------

Model.prototype.updateEngineWorks = function () {
	this.engineWorks = (this.waterLevel < this.waterLevelLimits.higher) && (!this.parent || this.parent.waterLevel > 0);
};

//------------------------------

Model.prototype.think = function (deltaTime /*in ms*/) {
	this.counting_waterLevel = this.waterLevel;
	var deltaTime_in_sec = deltaTime / 1000;

	if (this.engineWorks) {
		var g = 10; // acceleration
		var h = 
			(this.parent ? this.parent.height * (1 - this.parent.counting_waterLevel) : 0) +
			this.climb + this.counting_waterLevel * this.height;

		//enginePower = mass*g*h/deltaTime_in_sec

		var mass = (this.enginePower * deltaTime_in_sec) / (g * h);

		if (this.parent) {
			var parent_mass = this.parent.counting_waterLevel * this.parent.getVolume();
			mass = Math.min(mass, parent_mass);
			if (mass > 0) {
				this.parent.counting_waterLevel -= mass / this.parent.getVolume();
				if (this.parent.counting_waterLevel < 0) {
					this.parent.counting_waterLevel = 0;
				}
			}
		}

		if (mass > 0) {
			this.counting_waterLevel += mass / this.getVolume();
		}
	}

	this.children.forEach(function(value) {
		value.think(deltaTime);
	});

	this.counting_waterLevel -= this.leak * deltaTime_in_sec;

	if (this.counting_waterLevel < 0) {
		this.counting_waterLevel = 0;
	}

	this.waterLevel = this.counting_waterLevel;
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