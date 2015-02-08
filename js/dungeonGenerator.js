/**
 *
 * @licstart  The following is the entire license notice for the
 * JavaScript code in this page.
 *
 * Copyright (C) 2014~2015 by Sascha Willems (www.saschawillems.de)
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */

var NORTH = 0;
var SOUTH = 1;
var WEST = 2;
var EAST = 3;
var FORWARD = 0;
var BACKWARD = 1;
var LEFT = 2;
var RIGHT = 3;

var Horizontal = 0;
var Vertical = 1;

function dungeon(width, height, roomFrequency, splitStop) {
	this.partitions = [];
	this.rooms = [];
  this.cell = new Array([]);
	this.width = width;
	this.height = height;
	this.scale = 0.0;
  this.roomFrequency = roomFrequency;
  this.splitStop = splitStop;

  // gl objects
  this.vboDoor = null;
  this.vboFloor = null;
  this.vboCeiling = null;
  this.vboWall = [];

  this.shader = shaderManager.shaders.dungeon;

  this.generateName = function() {
    attribute = ["fiery", "dark", "hellish", "oozing", "melting", "endless", "infinite", "rotten", "haunted", "obscure", "diabolic", "demented"];
    prefix = ["chambers", "dungeon", "rooms", "maze", "labyrinth", "underground", "cellar", "keep", "heart", "eye", "chasm", "depths"];
    suffix = ["death", "torment", "terror", "horror", "doom", "hate", "madness", "insanity", "torture", "damnation", "delusion", "sorrow"];
    return (
      attribute[Math.floor(Math.random() * attribute.length)] + " " +
      prefix[Math.floor(Math.random() * prefix.length)] + " of " +
      suffix[Math.floor(Math.random() * suffix.length)]
    );
  };

  this.draw = function() {
    context.save();
    context.clearRect(0, 0, elem.width, elem.height);

    context.font = '14pt Calibri';
    context.textAlign = 'left';
    context.fillStyle = 'black';
    context.fillText(this.name, 10, 20);

    context.translate(10, 15);

    for (x=0; x<this.width; x++) {
      for (y=0; y<this.height; y++) {
          this.cell[x][y].draw();
      }
    }

    for (x=0; x<this.width; x++) {
      for (y=0; y<this.height; y++) {
          this.cell[x][y].drawWalls();
      }
    }

    for (x=0; x<this.width; x++) {
      for (y=0; y<this.height; y++) {
          this.cell[x][y].drawDoors();
      }
    }

    context.restore();
  };

  this.pointInRoom = function(x, y) {
    var result = false;

    for (i = 0; i < this.partitions.length; i++) {
      if (this.partitions[i].hasRoom) {
        if ((x >= this.partitions[i].roomDimLeft) & (x <= this.partitions[i].roomDimRight) &
            (y >= this.partitions[i].roomDimTop) & (y <= this.partitions[i].roomDimBottom)) {
          return true;
        }
      }
    }

    return result;
  };

  // Generates reusable vbos for cell parts
  this.generateVertexBufferObjects = function() {
    var vaPosition = [];
    var vaTexCoord = [];
    var vaNormal = [];

    var h = 1.85;

    // Floor
    vaPosition.push(0,0,1, 1,0,1, 0,0,0, 1,0,0);
    vaNormal.push(0,1,0, 0,1,0, 0,1,0, 0,1,0);
    vaTexCoord.push(0,1,0, 1,1,0, 0,0,0, 1,0,0);

    this.vboFloor = new vertexBufferObject();
    this.vboFloor.setVertices(vaPosition, this.shader.vertexPositionAttribute);
    this.vboFloor.setNormals(vaNormal, this.shader.normalAttribute);
    this.vboFloor.setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);

    vaNormal.splice(0, vaNormal.length);
    vaPosition.splice(0, vaPosition.length);
    vaTexCoord.splice(0, vaTexCoord.length);

    vaPosition.push(0,h,1, 0,h,0, 1,h,1, 1,h,0);
    vaNormal.push(0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0);
    vaTexCoord.push(0,1,0, 0,0,0, 1,1,0, 1,0,0);

    this.vboCeiling = new vertexBufferObject();
    this.vboCeiling.setVertices(vaPosition, this.shader.vertexPositionAttribute);
    this.vboCeiling.setNormals(vaNormal, this.shader.normalAttribute);
    this.vboCeiling.setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);


    // Wall
    var wallVertices = [
        [0,0,0, 1,0,0, 0,h,0, 1,h,0], // North
        [0,0,1, 0,h,1, 1,0,1, 1,h,1], // South
        [0,0,0, 0,h,0, 0,0,1, 0,h,1], // West
        [1,0,0, 1,0,1, 1,h,0, 1,h,1], // East
    ];

    var t = 1.5;
		var s = 1.0;
    var wallTexcoords = [
        [0,0,0, s,0,0, 0,t,0, s,t,0],
        [0,0,0, 0,t,0, s,0,0, s,t,0],
        [0,0,0, 0,t,0, s,0,0, s,t,0],
        [0,0,0, s,0,0, 0,t,0, s,t,0]
    ];

    var wallNormals = [
        [0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1],
        [0,0,1, 0,0,1, 0,0,1, 0,0,1],
        [1,0,0, 1,0,0, 1,0,0, 1,0,0],
        [-1,0,0, -1,0,0, -1,0,0, -1,0,0]
    ];

    for (i=0; i<wallVertices.length; i++) {
      //
      vaPosition.splice(0, vaPosition.length);
      vaTexCoord.splice(0, vaTexCoord.length);
      vaNormal.splice(0, vaNormal.length);
      //
      for (j=0; j<wallVertices[i].length; j++) {
        vaPosition.push(wallVertices[i][j]);
        vaTexCoord.push(wallTexcoords[i][j]);
        vaNormal.push(wallNormals[i][j]);
      }
      //
      this.vboWall.push(new vertexBufferObject());
      this.vboWall[i].setVertices(vaPosition, this.shader.vertexPositionAttribute);
      this.vboWall[i].setNormals(vaNormal, this.shader.normalAttribute);
      this.vboWall[i].setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);
    }

    // Door
    vaPosition.splice(0, vaPosition.length);
    vaTexCoord.splice(0, vaTexCoord.length);
    vaNormal.splice(0, vaNormal.length);
    this.vboDoor = new vertexBufferObject();

    var vertices = [
        [/*A*/ 0,0,0.5, 1,0,0.5, 0,h,0.5, /*B*/ 0,h,0.5, 1,h,0.5, 1,0,0.5],
//        [/*A*/ 0,0,0.6, 1,0,0.6, 0,h,0.6, /*B*/ 0,h,0.6, 1,h,0.6, 1,0,0.6],
//        [/*A*/ 0,h,0.6, 1,h,0.6, 0,h,0.4, /*B*/ 0,h,0.4, 1,h,0.4, 1,h,0.6],
    ];

    var texCoords = [
        [0,1,0, 1,1,0, 0,0,0, 0,0,0, 1,0,0, 1,1,0],
//        [0,0.75,0, 1,0.75,0, 0,0,0, 0,0,0, 1,0,0, 1,0.75,0],
//        [0,1,0, 1,1,0, 0,0.75,0, 0,0.75,0, 1,0.75,0, 1,1,0],
    ];

    var normals = [
        [0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1],
//        [0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1],
//        [0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0]
    ];

     for (i=0; i<vertices.length; i++) {
       for (j=0; j<vertices[i].length; j++) {
         vaPosition.push(vertices[i][j]);
         vaTexCoord.push(texCoords[i][j]);
         vaNormal.push(normals[i][j]);
       }
     }

    console.debug(vaPosition);

    this.vboDoor = new vertexBufferObject();

    this.vboDoor.setVertices(vaPosition, this.shader.vertexPositionAttribute);
    this.vboDoor.setNormals(vaNormal, this.shader.normalAttribute);
    this.vboDoor.setTextureCoordinates(vaTexCoord, this.shader.texCoordAttribute);

    console.debug(this.vboDoor);
  };

  this.name = this.generateName();

}

function dungeonGenerator(width, height) {

  this.dungeon = null;

  this.generate = function(width, height, roomFrequency, splitStop) {
      console.log("RoomFrequency = ", roomFrequency);
      console.log("BSP split stop = ", splitStop);
      this.dungeon = new dungeon(width, height, roomFrequency, splitStop);

      for (x = 0; x < width; x++) {
        this.dungeon.cell[x] = new Array([]);
        for (y = 0; y < height; y++) {
          this.dungeon.cell[x][y] = new dungeonCell(x, y, this.dungeon);
        }
      }

      this.generateRooms(width, height);
      this.generateWalls();
      this.generateDoors();
  };

  this.generateRooms = function(width, height) {

    // Generate root node for BSP Tree
    console.log('root');
    var bspTree = new bspPartition(this.dungeon, null, 0, 0, width, height, Horizontal, 0);
		bspTree.split(true, 16, 32);

		// Connect all rooms
		//  First get branch end nodes (all nodes that don't have children anymore)
		//  Needed because the tree must be traversed from bottom to top
		var endPartitions = [];

		for (i = 0; i < this.dungeon.partitions.length; i++) {
			if ((this.dungeon.partitions[i].children.length === 0) && (this.dungeon.partitions[i].hasRoom) ) {
				endPartitions.push(this.dungeon.partitions[i]);
			}
		}
		if (endPartitions.length > 0) {
			for (var i = 0; i < endPartitions.length; i++) {
        //console.log(i + '/' + endPartitions.length);
			  endPartitions[i].connect();
			}
		}
  };

  this.generateWalls = function() {

		for (var x = 0; x < this.dungeon.width; x++) {
			for (var y = 0; y < this.dungeon.height; y++) {
				curCell = this.dungeon.cell[x][y];
				if (curCell.type > CellTypeEmpty) {

					// To the west
					if (x === 0) {
						curCell.wall[WEST] = true;
					} else {
						if (this.dungeon.cell[x-1][y].type == CellTypeEmpty) {
							curCell.wall[WEST] = true;
						}
					}

					// To the east
					if (x == dungeon.width - 1) {
						curCell.wall[EAST] = true;
					} else {
						if (this.dungeon.cell[x+1][y].type == CellTypeEmpty) {
							curCell.wall[EAST] = true;
						}
					}

					// To the north
					if (y === 0) {
						curCell.wall[NORTH] = true;
					} else {
						if (this.dungeon.cell[x][y-1].type == CellTypeEmpty) {
							curCell.wall[NORTH] = true;
						}
					}

					// To the south
					if (y == dungeon.height - 1) {
						curCell.wall[SOUTH] = true;
					} else {
						if (this.dungeon.cell[x][y+1].type == CellTypeEmpty) {
							curCell.wall[SOUTH] = true;
						}
					}

          // Generate lines for collision detection
          if (curCell.wall[NORTH]) { curCell.walls.push(new line(x, y, x+1, y)); }
          if (curCell.wall[SOUTH]) { curCell.walls.push(new line(x, y+1, x+1, y+1)); }
          if (curCell.wall[WEST]) { curCell.walls.push(new line(x, y, x, y+1)); }
          if (curCell.wall[EAST]) { curCell.walls.push(new line(x+1, y, x+1, y+1)); }
				}
			}
		}

  };

  this.generateDoors = function () {
		for (var x = 0; x < this.dungeon.width; x++) {
			for (var y = 0; y < this.dungeon.height; y++) {
				curCell = this.dungeon.cell[x][y];

				// Check if cell has at least two opposite walls to each other (east and west or south and north)
	      // Then check against neighbors. If neighbor cell has less than two walls, a corridor usually ends into a room and a door needs to be placed

				if ((curCell.wall[WEST]) && (curCell.wall[EAST])) {
					if (y > 0) {
						if ((this.dungeon.cell[x][y-1].type != CellTypeEmpty) && (!this.dungeon.cell[x][y-1].isCorridor))
							curCell.door[NORTH] = true;
					}
					if (y < this.dungeon.height-1) {
						if ((this.dungeon.cell[x][y+1].type != CellTypeEmpty) && (!this.dungeon.cell[x][y+1].isCorridor))
							curCell.door[SOUTH] = true;
					}
				}

				if ((curCell.wall[NORTH]) && (curCell.wall[SOUTH])) {
					if (x > 0) {
						if ((this.dungeon.cell[x-1][y].type != CellTypeEmpty) && (!this.dungeon.cell[x-1][y].isCorridor))
							curCell.door[WEST] = true;
					}
					if (x < this.dungeon.width-1) {
						if ((this.dungeon.cell[x+1][y].type != CellTypeEmpty) && (!this.dungeon.cell[x+1][y].isCorridor))
							curCell.door[EAST] = true;
					}
				}

			}
		}
  };

}
