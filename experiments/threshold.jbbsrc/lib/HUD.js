"use strict";
/**
 * Iconeez.in - A Web VR Platform for social experiments
 * Copyright (C) 2015 Ioannis Charalampidis <ioannis.charalampidis@cern.ch>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @author Ioannis Charalampidis / https://github.com/wavesoft
 */

var THREE = require("three");
var IconeezinAPI = require("iconeezin/api");

/**
 * HUD Status component
 */
var HUDStatus = function(icon) {
  IconeezinAPI.HUDLayer.call(this, 256, 256, 'br');

  icon.addEventListener('load', (function() {
    this.redraw();
  }).bind(this));

  this.text = "Χωρίς θόρυβο";
  this.opacity = 0;
  this.icon = icon;

};

// Subclass from sprite
HUDStatus.prototype = Object.assign( Object.create( IconeezinAPI.HUDLayer.prototype ), {

  constructor: HUDStatus,

  reset: function() {
    this.text = "Χωρίς θόρυβο";
    this.opacity = 0;
    this.redraw();
  },

  paintRect: function(ctx,x,y,w,h,r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r, x+r, y);
    ctx.quadraticCurveTo(x, y, x+r, y);
  },

  setNoise: function(level) {
    var noisePercent = level * 100;
    this.text = "Θόρυβος στο "+noisePercent.toFixed(1)+" %";
    this.opacity = Math.min( level / 0.1, 1.0 );
    this.redraw();
  },

  onPaint: function( ctx, width, height ) {

    var centerY = height/2;
    var padding = 5;
    var indent = 10;
    var radius = 24;
    var rectHeight = 48;
    var imgSize = 64;

    ctx.globalAlpha = 0.8 * this.opacity;
    this.paintRect(ctx, padding, centerY - rectHeight/2, width - padding, rectHeight, radius);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 1.0 * this.opacity;

    ctx.textAlign = "start";
    ctx.font = "16px Tahoma";
    ctx.fillStyle = "#ffffff";
    ctx.fillText( this.text, padding+indent+imgSize+padding, centerY + 4);

    ctx.drawImage(this.icon, padding+indent, centerY - imgSize/2 );

  },

});

// Export label
module.exports = HUDStatus;