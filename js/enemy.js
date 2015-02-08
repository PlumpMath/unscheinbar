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

function enemy(x, y, texture) {
  this.x = x;
  this.y = y;
  this.position = vec3.fromValues(x, 1.05, y);
  this.rotation = vec3.create(0,0);
  this.vbo = null;
  this.dim = 2.5;
  this.dirVec = vec3.create();
  this.newPos = vec3.create();
  this.health = 100;
  this.texture = texture;
  this.shader = shaderManager.shaders.dungeon;
  this.degTimer = Math.random() * 360.0;

  this.update = function(timeFactor) {
    this.degTimer += timeFactor;
    if (this.degTimer > 360.0) { this.degTimer -= 360.0; }
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

    if (collDist > this.dim * 2) {
      this.x = this.newPos[0];
      this.y = this.newPos[1];
    }
  };

  this.generateVBO = function() {
    var d = this.dim * 0.3;
    this.vbo = new vertexBufferObject();
    this.vbo.setVertices([-d/2,-d,0, d/2,-d,0, -d/2,d,0, d/2,d,0], this.shader.vertexPositionAttribute);
    this.vbo.setNormals([0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1], this.shader.normalAttribute);
    this.vbo.setTextureCoordinates([0,1,0, 1,1,0, 0,0,0, 1,0,0], this.shader.texCoordAttribute);
  };

  this.render = function() {
    locMat = mat4.create();

    gl.useProgram(this.shader);
    gl.enable(gl.BLEND);
    gl.uniform4f(gl.getUniformLocation(this.shader, "color"), 1.0, 1.0, 1.0, 1.0);

    // Drop shadow first (depth order)
    mat4.identity(locMat);
    mat4.translate(locMat, locMat, [this.x, 0.0001, this.y]);
    mat4.rotate(locMat, locMat, -90 * deg_to_rad, [1,0,0]);
    mat4.scale(locMat, locMat, [1 - (Math.sin(this.degTimer * deg_to_rad * 25) * 0.05), 0.5 - (Math.sin(this.degTimer * deg_to_rad * 25) * 0.05), 1]);
    mat4.multiply(locMat, mvMatrix, locMat);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, locMat);
    gl.bindTexture(gl.TEXTURE_2D, textureManager.textures.dropShadow);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.vbo.render(gl.TRIANGLE_STRIP);

    // Billboard
    gl.depthMask(false);
    //gl.uniform1f(this.shader.lightDistUniform, player.lightRadius * 2); // TODO : Only works for ingame, maybe as shader parameter? Separate enemy shader?
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    mat4.identity(locMat);
    mat4.translate(locMat, locMat, [this.x, this.position[1] + (Math.sin(this.degTimer * deg_to_rad * 25) * 0.02), this.y]);
    mat4.rotate(locMat, locMat, player.rotation[1], [0,-1,0]);
    mat4.multiply(locMat, mvMatrix, locMat);
    gl.uniformMatrix4fv(this.shader.mvMatrixUniform, false, locMat);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.vbo.render(gl.TRIANGLE_STRIP);
    //gl.uniform1f(this.shader.lightDistUniform, player.lightRadius);

    gl.depthMask(true);
    gl.disable(gl.BLEND);
  };

  this.generateVBO();

}
