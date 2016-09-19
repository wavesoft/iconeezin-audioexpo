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
var Iconeezin = require("iconeezin");

/**
 * HUD Status component
 */
var HUDStatus = function(icon) {
  Iconeezin.API.HUDLayer.call(this, 256, 256, 'br');

  this.text = "Χωρίς Καθυστέρηση";
  this.opacity = 0;
  this.icon = Iconeezin.Util.redrawWhenLoaded(this, icon);

};

// Subclass from sprite
HUDStatus.prototype = Object.assign( Object.create( Iconeezin.API.HUDLayer.prototype ), {

  constructor: HUDStatus,

  reset: function() {
    this.text = "Χωρίς Καθυστέρηση";
    this.opacity = 0;
    this.redraw();
  },

  setDelay: function(delay) {
    this.text = "Καθυστέρηση "+delay.toFixed(0)+" ms";
    this.opacity = 1;
    this.redraw();
  },

  onPaint: function( ctx, width, height ) {

    var centerY = height/2 + 64;
    var padding = 5;
    var indent = 10;
    var radius = 24;
    var rectHeight = 48;
    var imgSize = 64;

    ctx.globalAlpha = 0.8 * this.opacity;
    Iconeezin.Util.roundedRect(ctx, padding, centerY - rectHeight/2, width - padding, rectHeight, radius);
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
