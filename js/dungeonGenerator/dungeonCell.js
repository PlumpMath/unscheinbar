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

 var CellTypeEmpty = 0;
 var CellTypeFloor = 1;
 var CellTypeRoom  = 2;
 var CellTypeDebug   = 0xFE;
 var CellTypeRemoved = 0xFF;

function dungeonCell(x, y, owner) {
  this.wall = [false, false, false, false];
  this.door = [false, false, false, false];
  this.type = CellTypeEmpty;
  this.x = x;
  this.y = y;
  this.isCrossing = false;
  this.isCorridor = false;
  this.isVisible = false;
  this.owner = owner;

  this.walls = [];

  this.vboWallPosition = null;
  this.vboWallTexCoord = null;
  this.vboWallNormal = null;

  this.drawGL = function() {
      var locMat = mat4.create();
      gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.default);
      // Floor
      if (this.type == CellTypeEmpty) {
        //gl.bindTexture(gl.TEXTURE_2D, textureEmpty);
      } else {
        //gl.bindTexture(gl.TEXTURE_2D, textureFloor);
        mat4.identity(locMat);
        mat4.translate(locMat, locMat, [0.5+this.x, (this.type == CellTypeEmpty ? 1 : 0), 0.5+this.y]);
        mat4.multiply(locMat, mvMatrix, locMat);
        gl.uniformMatrix4fv(this.owner.shader.mvMatrixUniform, false, locMat);
        this.owner.vboFloor.render(gl.TRIANGLE_STRIP);
        this.owner.vboCeiling.render(gl.TRIANGLE_STRIP); // TODO : Disable for a nice effect
      }

      // Walls
      for (i=0; i<4; i++) {
        if (this.wall[i]) {
          this.owner.vboWall[i].render(gl.TRIANGLE_STRIP);
        }
      }

      // Doors
      //gl.uniform4f(gl.getUniformLocation(this.owner.shader, "color"), 0.5, 0.0, 0.0, 1.0);
      mat4.identity(locMat);
      gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.door);

      if (this.door[NORTH]) {
        mat4.translate(locMat, locMat, [0.5+this.x, 0, 0.2+this.y]);
      }

      if (this.door[SOUTH]) {
        mat4.translate(locMat, locMat, [0.5+this.x, 0, 0.8+this.y]);
      }

      if (this.door[EAST]) {
        mat4.translate(locMat, locMat, [0.9+this.x, 0, 1.5+this.y]);
      }

      if (this.door[WEST]) {
        mat4.translate(locMat, locMat, [1.1+x, 0, 0.5+y]);
        mat4.rotate(locMat, locMat, 90, [0, 1, 0]);
      }

      if ((this.door[NORTH]) || (this.door[SOUTH]) || (this.door[EAST]) || (this.door[WEST])) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        mat4.multiply(locMat, mvMatrix, locMat);
        gl.uniformMatrix4fv(this.owner.shader.mvMatrixUniform, false, locMat);
        //generator.dungeon.vboDoor.render(gl.TRIANGLES);
        gl.disable(gl.BLEND);
      }

      gl.uniform4f(gl.getUniformLocation(this.owner.shader, "color"), 1.0, 1.0, 1.0, 1.0);

      gl.uniformMatrix4fv(this.owner.shader.mvMatrixUniform, false, mvMatrix);

  };

  this.draw = function() {
    // TODO : Currently only most basic drawing
    context.beginPath();
    if (this.type == CellTypeEmpty) {
      context.fillStyle = '#FFFFFF';
      context.strokeStyle = '#000000';
    } else {
      context.fillStyle = '#ADADAD';
      context.strokeStyle = '#000000';
      if (this.isCorridor) {
        context.fillStyle = '#6F4C3D';
      }
      context.rect(x*10+1, y*10+1, 10-2, 10-2);
      context.fill();
    }
    context.lineWidth = 1;
    context.stroke();
  };

  this.drawWalls = function()  {
    context.beginPath();
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    if (this.wall[NORTH]) {
      context.moveTo(x*10, y*10);
      context.lineTo(x*10+10, y*10);
    }
    if (this.wall[SOUTH]) {
      context.moveTo(x*10, y*10+10);
      context.lineTo(x*10+10, y*10+10);
    }
    if (this.wall[EAST]) {
      context.moveTo(x*10+10, y*10);
      context.lineTo(x*10+10, y*10+10);
    }
    if (this.wall[WEST]) {
      context.moveTo(x*10, y*10);
      context.lineTo(x*10, y*10+10);
    }
    context.stroke();
  };

  this.drawDoors = function() {
    context.beginPath();
    context.lineWidth = 4;
    context.strokeStyle = '#00FF00';
    if (this.door[NORTH]) {
      context.moveTo(x*10, y*10);
      context.lineTo(x*10+10, y*10);
    }
    if (this.door[SOUTH]) {
      context.moveTo(x*10, y*10+10);
      context.lineTo(x*10+10, y*10+10);
    }
    if (this.door[EAST]) {
      context.moveTo(x*10+10, y*10);
      context.lineTo(x*10+10, y*10+10);
    }
    if (this.door[WEST]) {
      context.moveTo(x*10, y*10);
      context.lineTo(x*10, y*10+10);
    }
    context.stroke();
  };

}
