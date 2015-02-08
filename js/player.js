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

function player() {
  this.x = 8;
  this.y = 8;
  this.rotation = vec3.create(0,0);
  this.height = 1.15;
  this.lightRadius = 4.5; // was 3.5
  this.vbo = null;
  this.dim = 0.25;
  this.headBob = 0;
  this.sway = 0;
  this.leanAngle = 0;
  this.dirVec = vec3.create();
  this.newPos = vec3.create();

  this.mentalHealth = 100.0;
  this.stressLevel = 0.0;

  this.shader = shaderManager.shaders.dungeon;

  var Key = {
    _pressed: {},

    LEFT: 65, // A
    UP: 87, // W
    RIGHT: 68, // D
    DOWN: 83, // S
    Q: 81,
    E: 69,

    isDown: function(keyCode) {
      return this._pressed[keyCode];
    },

    onKeydown: function(event) {
      this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
      delete this._pressed[event.keyCode];
    }
  };

  window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
  window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);


  this.updateHud = function() {
    hudScope.playerx = Math.round(this.x);
    hudScope.playery = Math.round(this.y);
    hudScope.playerrot = Math.round(this.rotation[1] / Math.PI * 180) + ' / ' + Math.round(this.rotation[0] / Math.PI * 180);
    hudScope.$apply();
  };

  this.update = function(timeFactor) {
    if (Key.isDown(Key.UP)) this.move(0, 0, 1, timeFactor);
    if (Key.isDown(Key.LEFT)) this.move(-1, 0, 0, timeFactor);
    if (Key.isDown(Key.DOWN)) this.move(0, 0, -1, timeFactor);
    if (Key.isDown(Key.RIGHT)) this.move(1, 0, 0, timeFactor);
    if (Key.isDown(Key.Q)) { this.leanAngle -= 0.02 * timeFactor; if (this.leanAngle < -0.1) this.leanAngle = -0.1; }
    if (Key.isDown(Key.E)) { this.leanAngle += 0.02 * timeFactor; if (this.leanAngle >  0.1) this.leanAngle =  0.1; }

    // TODO : Sway and fov
    this.sway += timeFactor * 10;
    if (this.sway > 360) { this.sway -= 360; }

  };

  this.move = function(dirVecX, dirVecY, dirVecZ, timeFactor) {
    vec3.set(this.dirVec, dirVecX, dirVecY, dirVecZ);
    vec3.rotateY(this.dirVec, this.dirVec, vec3.fromValues(0,0,0), this.rotation[1]);
    vec3.normalize(this.dirVec, this.dirVec);
    this.newPos[0] = this.x + this.dirVec[0] * 0.15 * timeFactor;
    this.newPos[1] = this.y - this.dirVec[2] * 0.15 * timeFactor;

    // Collision detection
    var srcPos = vec2.fromValues(this.x, this.y);
    var dstPos = vec2.fromValues(this.x + this.dirVec[0] * 5, this.y - this.dirVec[2] * 5);
    var cX = Math.round(this.x);
    var cY = Math.round(this.y);
    var collPoint;

    var collDist = 1000;
    for (var x = cX - 4; x < cX + 4; x++) {
      for (var y = cY - 4; y < cY + 4; y++) {
        if ((x>=0) && (y>=0) && (x<generator.dungeon.width) && (y<generator.dungeon.height)) {
          for (var i = 0; i < generator.dungeon.cell[x][y].walls.length; i++) {
            collPoint = generator.dungeon.cell[x][y].walls[i].getCollisionPoint(srcPos, dstPos);
            if (collPoint !== null) {
              // Calculate distance to collision point
              var dist = vec2.distance(srcPos, collPoint);
              // Check if closest collision point
              if (dist < collDist) { collDist = dist; }
            }
          }
        }
      }
    }

    hudScope.additionalinfo = ' nearest collDist = ' + collDist.toFixed(2);
    hudScope.$apply();

    if (collDist > this.dim * 2) {
      this.x = this.newPos[0];
      this.y = this.newPos[1];
    }


    // Update head bob angle
    this.headBob += timeFactor * 15;
    if (this.headBob > 360) { this.headBob -= 360; }


    this.updateHud();
    // TODO : Collision detection
  };

  this.setCamera = function(mvMatrix, pMatrix) {
    mat4.identity(mvMatrix);
    // mat4.rotate(mvMatrix, mvMatrix, this.leanAngle, [0, 0, 1]); // TODO : Move and rotate
    mat4.rotate(mvMatrix, mvMatrix, this.rotation[0], [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, this.rotation[1], [0, 1, 0]);
    mat4.translate(mvMatrix, mvMatrix, [-this.x-0.5, -this.height + (0.05 * Math.sin(this.headBob * deg_to_rad)), -this.y-0.5]);
  };

  this.generateVBO = function() {
    var d = this.dim;
    var vertices = [
        0,0,0, d,0,0, 0,d,0, 0,d,0, d,d,0, d,0,0, // North
        0,0,d, d,0,d, 0,d,d, 0,d,d, d,d,d, d,0,d, // South
        0,d,0, 0,0,0, 0,d,d, 0,d,d, 0,0,d, 0,0,0, // West
        d,d,0, d,0,0, d,d,d, d,d,d, d,0,d, d,0,0, // East
        0,d,0, 0,d,d, d,d,0, 0,d,d, d,d,d, d,d,0  // Top
    ];

    var texCoords = [
        0,1,0, 1,1,0, 0,0,0, 0,0,0, 1,0,0, 1,1,0,
        0,1,0, 1,1,0, 0,0,0, 0,0,0, 1,0,0, 1,1,0,
        0,0,0, 0,1,0, 1,0,0, 1,0,0, 1,1,0, 0,1,0,
        0,0,0, 0,1,0, 1,0,0, 1,0,0, 1,1,0, 0,1,0,
        0,0,0, 0,1,0, 1,0,0, 0,1,0, 1,1,0, 1,0,0
    ];

    var normals = [
        0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
        0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
        1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
        -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0,
        0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0
    ];

    this.vbo = new vertexBufferObject();
    this.vbo.setVertices(vertices, this.shader.vertexPositionAttribute);
    this.vbo.setNormals(normals, this.shader.normalAttribute);
    this.vbo.setTextureCoordinates(texCoords, this.shader.texCoordAttribute);
  };

  this.render = function() {
    locMat = mat4.create();
    mat4.identity(locMat);
    mat4.rotate(locMat, locMat, this.rotation[1], [0,1,0]);
    mat4.translate(locMat, locMat, [-this.dim/2, -this.height, -this.dim/2]);
    gl.useProgram(this.shader);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, locMat);
//    gl.bindTexture(gl.TEXTURE_2D, textureFloor);
    gl.uniform1i(gl.getUniformLocation(this.shader, "diffuseOnly"), 1);
    gl.uniform4f(gl.getUniformLocation(this.shader, "color"), 0.4, 0.6, 0.4, 1.0);
    this.vbo.render(gl.TRIANGLES);

    // var dirVec = new vec3(0, 0, 1);
    // dirVec.rotateZ(this.rotation);
    // dirVec.normalize();
    // mat4.translate(locMat, locMat, [0.25*dirVec.x, 0, 0.25*dirVec.z]);

    //game.spawnProjectile(new vec3(0.25*dirVec.x, 0.5, 0.25*dirVec.z), new vec3(0, 0, 0), 1, this);

    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, locMat);
    gl.uniform4f(gl.getUniformLocation(this.shader, "color"), 0.6, 0.4, 0.4, 1.0);
    this.vbo.render(gl.TRIANGLES);

    gl.uniform1i(gl.getUniformLocation(this.shader, "diffuseOnly"), diffuseOnly);
  };

  this.mouseMoveHandler = function(event) {

    if (document.pointerLockElement) {
      // Relative movement
      this.rotation[0] += (event.movementY * 0.005); // TODO : Timefactor
      this.rotation[1] += (event.movementX * 0.005); // TODO : Timefactor
      if (Math.abs(this.rotation[0]) > 0.9)  {
        this.rotation[0] = (0.9) * (this.rotation[0]/Math.abs(this.rotation[0]));
      }
      this.updateHud();
    }
  };

}
