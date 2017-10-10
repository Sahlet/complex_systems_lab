;
'use strict' //strict mode
//-------------------------------------------------------

function ObservableSubject () {
	this.observers = [];
	this.actions_queue = [];
	this.observersBufferToDel = new Set();
	this.executing = false;
};

ObservableSubject.prototype.addObserver = function (o) {
	if (!o) {
		console.warn("observer '" + o + "' is empty");
		return;
	}

	if ("function" !== typeof o) {
		console.warn("observer '" + o + "' must be a function");
		return;
	}

	var that = this;
	var action = function() {
		if (that.observers.indexOf(o) != -1) {
			console.warn("observer '" + o + "' already was added");
			return;
		}
		that.observers.push(o);
	};

	if (this.executing) {
		this.actions_queue.push(action);
	} else {
		action();
	}
};

ObservableSubject.prototype.removeObserver = function (o) {
	var that = this;
	var action = function() {
		var index = that.observers.indexOf(o);
		if (index != -1) {
			delete that.observers[index];
		} else {
			console.warn("no observer '" + o + "' to remove");
		}
	};
	if (this.executing) {
		this.observersBufferToDel.add(o);
		this.actions_queue.push(action);
	} else {
		action();
	}
};

ObservableSubject.prototype.notify = function (data) {
	var that = this;
	this.executing = true;
	this.observers.forEach(function(o) {
		if (!that.observersBufferToDel.has(o)) {
			o(data);
		}
	});
	this.executing = false;
	this.actions_queue.forEach(function(action) {
		action();
	});
	this.actions_queue = [];
};

//-------------------------------------------------------
;