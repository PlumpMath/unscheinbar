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

var gameStateMainMenu = 0;
var gameStateInGame = 1;
var gameStateGameOver = 2;

function game() {
  this.state = gameStateMainMenu;
  this.enemies = [];

  this.update = function(timeFactor) {
    if (this.state == gameStateMainMenu) {
      mainMenu.update(timeFactor);
    }
    // TODO : Other states
    this.enemies.forEach(function (element, index) {
      element.update(timeFactor);
    });
    player.update(timeFactor);
  };

  this.spawnEnemy = function(x, y, texture) {
    this.enemies.push(new enemy(x, y, texture));
  };

  this.renderEnemies = function() {
    this.enemies.forEach(function (element, index) {
      element.render();
    });
  };

  this.render = function() {
    if (this.state == gameStateMainMenu) {
      mainMenu.render();
    }
    //this.renderEnemies();
  };

  this.keyHandler = function(event) {
    var keyPressed = String.fromCharCode(event.keyCode);
    if (event.keyCode == 76) { diffuseOnly = !diffuseOnly; }
    if (event.keyCode == 77) { showMap = !showMap; }
    // TODO : Debug stuff, remove for release
    if (keyPressed == 'G') { grain = !grain; }
    if (keyPressed == 'E') { this.spawnEnemy(player.x + 0.5, player.y + 0.5, textureManager.textures.defaultEnemy); }
  };

  this.setState = function(newState) {
    this.state = newState;
  };

}
