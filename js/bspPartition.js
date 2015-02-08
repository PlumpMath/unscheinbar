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

function bspPartition(dungeon, parent, left, top, right, bottom, splitIn, depth) {

  this.depth = depth;
  this.dungeon = dungeon;
  this.parent = parent;
  this.children = [];
  this.left = Math.round(left);
  this.top = Math.round(top);
  this.bottom = Math.round(bottom);
  this.right = Math.round(right);
  this.centerX = Math.round(this.left + (this.right - this.left) / 2);
  this.centerY = Math.round(this.top + (this.bottom - this.top) / 2);
  this.splitIn = splitIn;
  this.hasRoom = false;
  this.roomDimLeft = 0;
  this.roomDimTop = 0;
  this.roomDimBottom = 0;
  this.roomDimRight = 0;
  this.name = 'bsp_partition_' + dungeon.partitions.length;
  this.parentname = '';
  if (parent !== null) {
    this.parentname = parent.name;
  }
  var txt = '';
  for (i=0;i<this.depth;i++) {
    txt = txt + ' ';
  }
  // console.log(txt + this.name + ' (depth = ' + this.depth + ', parent = ' + this.parentname + ', pos = ' + left + '/' + top + ' dim = ' + (right-left) + '/' + (bottom-top) + ')');

  this.placeRoom = function() {
    if ( (this.children.length === 0)  && (Math.random() * 100.0 < this.dungeon.roomFrequency) ) {
      this.hasRoom = true;
      for (x=this.left+2; x <= this.right-2; x++) {
        for (y=this.top+2; y <= this.bottom-2; y++) {
          if ( (x >= this.dungeon.width-1) || (y >= this.dungeon.height-1)) {
            break;
          }
          this.dungeon.cell[x][y].type = CellTypeFloor;
          this.roomDimLeft = this.left + 2;
          this.roomDimTop = this.top + 2;
          this.roomDimRight = this.right - 2;
          this.roomDimBottom = this.bottom - 2;
        }
      }
    } else {
      for (i=0; i<this.children.length;i++) {
        this.children[i].placeRoom();
      }
    }
  };

  this.split = function(origin, maxDivision, minDivision) {
    // Don't split if any of the dimensions is below certain threshold
    if ( ((this.right - this.left) <= maxDivision) || ((this.bottom - this.top) <= maxDivision) ) {
      return;
    }

    // Randomly stop splitting
    if (splitIn == Vertical) {
      if ( ((this.right - this.left) < minDivision) || ((this.bottom - this.top) < minDivision) ) {
        if ( (Math.random() * 100.0 < this.dungeon.splitStop) && (!origin)) {
          return;
        }
      }
    }

    // Split
    var splitRangeX = Math.round((this.right - this.left) / ((origin) ? 8 : 4));
    var splitRangeY = Math.round((this.bottom - this.top) / ((origin) ? 8 : 4));

    var splitX = Math.round(this.left + ((this.right - this.left) / 2) + Math.round(Math.random() * splitRangeX) - Math.round(Math.random() * splitRangeX));
    var splitY = Math.round(this.top + ((this.bottom - this.top) / 2) + Math.round(Math.random() * splitRangeY) - Math.round(Math.random() * splitRangeY));

    var depth = this.depth + 1;

    // Add four new child partitions
    this.children.push(new bspPartition(this.dungeon, this, this.left, this.top, splitX, splitY, Math.round(Math.random() * 2), depth));
    this.children.push(new bspPartition(this.dungeon, this, splitX, this.top, this.right, splitY, Math.round(Math.random() * 2), depth));
    this.children.push(new bspPartition(this.dungeon, this, this.left, splitY, splitX, this.bottom, Math.round(Math.random() * 2), depth));
    this.children.push(new bspPartition(this.dungeon, this, splitX, splitY, this.right, this.bottom, Math.round(Math.random() * 2), depth));

  };

  this.createCorridor = function(originX, originY, destX, destY) {
    var curPosX = originX;
    var curPosY = originY;
    do {

      if (curPosX < destX) {
        curPosX++;

      } else {

        if (curPosX > destX) {
          curPosX--;

        } else {

          if (curPosY < destY) {
            curPosY++;

          } else {

            if (curPosY > destY) {
              curPosY--;
            }
          }
        }
      }

      if (!this.dungeon.pointInRoom(curPosX, curPosY)) {
        this.dungeon.cell[curPosX][curPosY].isCorridor = true;
      }

      if (this.dungeon.cell[curPosX][curPosY].type != CellTypeDebug) {
        this.dungeon.cell[curPosX][curPosY].type = CellTypeFloor;
      }

    } while ( (curPosX != destX) || (curPosY != destY)  );

  };

	this.connect = function() {
		var connectionList = [];
    var randomList = [];

		// Gather all child nodes containing a room to connect
		if (this.children.length > 0) {
			for (i = 0; i < this.children.length; i ++) {
				if (this.children[i].hasRoom) {
					connectionList.push(this.children[i]);
				}
			}
		}
		// Add this node (and if set it's parent) to the connection list
		connectionList.push(this);
		if (this.parent !== null) {
			connectionList.push(this.parent);
		}

		if (connectionList.length === 0) {
			return;
		}

		// Randomize connection list
		var skip = false;
		index = 0;

		do {
			index = Math.round(Math.random() * (connectionList.length - 1));
			if (randomList.indexOf(index) == -1) {
				randomList.push(index);
			}
		} while (randomList.length != connectionList.length);
		if (randomList.length > 0) {
			for (var i = 0; i < randomList.length-1; i++) {
				srcX = connectionList[randomList[i]].centerX;
        srcY = connectionList[randomList[i]].centerY;
        dstX = connectionList[randomList[i+1]].centerX;
        dstY = connectionList[randomList[i+1]].centerY;
        this.createCorridor(srcX, srcY, dstX, dstY);
			}
		}

		if (this.parent !== null) {
			parent.connect(dungeon);
		}

	};

  // split and place rooms
  if (parent !== null) {
    this.split(false, 16, 32);
    this.placeRoom();
  }

  this.dungeon.partitions.push(this);

}
