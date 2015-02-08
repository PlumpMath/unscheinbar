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

function line(x0, y0, x1, y1) {
  this.x0 = x0;
  this.y0 = y0;
  this.x1 = x1;
  this.y1 = y1;

  // Draw on a HTML5 canvas
  this.draw = function() {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineWidth = 2;
    context.stroke();
  };

  // Calculate collision point between this line and the line described by origin and dest points
  // On collision : returns the collision point as a 2D vector, returns null if no collision is detected
  this.getCollisionPoint = function(origin, dest) {
    var segmentPos = vec2.fromValues(dest[0] - origin[0], dest[1] - origin[1]);
    var segmentWall = vec2.fromValues(this.x1 - this.x0, this.y1 - this.y0);

    var s = (-segmentPos[1]*(origin[0]-this.x0) + segmentPos[0]*(origin[1]-this.y0)) / (-segmentWall[0]*segmentPos[1] + segmentPos[0]*segmentWall[1]);
    var t = ( segmentWall[0]*(origin[1]-this.y0) - segmentWall[1]*(origin[0]-this.x0)) / (-segmentWall[0]*segmentPos[1] + segmentPos[0]*segmentWall[1]);

    if ( (s >= 0) && (s <= 1) && (t >= 0) && (t <= 1) ) {
      var collisionPoint = vec2.fromValues(origin[0] + t*segmentPos[0], origin[1] + t*segmentPos[1]);
      return collisionPoint;
    } else {
      return null;
    }
  };

}
