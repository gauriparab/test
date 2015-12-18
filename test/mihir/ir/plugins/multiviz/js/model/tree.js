/**
 * Simple data structure for a binary tree (dendrograms)
 */
function Node(nr, childa, childb) {
	this.nr = nr;
	this.childa = childa;
	this.childb = childb;
	this.parent = null;
	if (this.childa) this.childa.parent = this;
	if (this.childb) this.childb.parent = this;
	
	this.x = 0;
	this.y = 0;
};

Node.prototype.getParent = function() {
	return this.parent;
};
Node.prototype.getX = function() {
	return this.x;
};
Node.prototype.getY = function() {
	return this.y;
}
Node.prototype.setY = function(d) {
	this.y = d;
}
Node.prototype.setAllY = function(d) {
	this.y = d;
	if (!this.isLeaf()) {
		this.childa.setAllY(d);
		this.childb.setAllY(d);
	}
}
Node.prototype.setAllX = function(d) {
	this.x = d;
	if (!this.isLeaf()) {
		this.childa.setAllX(d);
		this.childb.setAllX(d);
	}
}
Node.prototype.setX = function(d) {
	this.x = d;
}
Node.prototype.getChildA = function() {
	return this.childa;
}
Node.prototype.getChildB = function() {
	return this.childb;
}
Node.prototype.isLeaf = function() {
	return !this.childa && !this.childb;
}
Node.prototype.toString = function() {
	if (this.isLeaf()) return this.nr;
	else return this.nr+ "(y="+this.y+") ["+this.childa.toString()+", "+this.childb.toString()+"]";
}
Node.prototype.getLeaves = function(list) {	
	if (!this.isLeaf()) {
		this.childa.getLeaves(list);
		this.childb.getLeaves(list);
	}
	else list.push(this.nr);
}
