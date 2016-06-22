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

var React = require('react');
var ReactDOM = require('react-dom');

var Viewport = require('./components/Viewport');
var Welcome = require('./components/Welcome');

/**
 * Root component
 */
var IconeezinRoot = React.createClass({

	/**
	 * Default state
	 */
	getInitialState: function() {
		return {
			'hmd': false,
			'paused': true,
			'experiment': null
		};
	},

	/**
	 * On mount, listen for full screen events.
	 */
	componentDidMount: function() {

		// Register full screen handler
		document.addEventListener("fullscreenchange", this.handleFullScreenChange);
		document.addEventListener("webkitfullscreenchange", this.handleFullScreenChange);
		document.addEventListener("mozfullscreenchange", this.handleFullScreenChange);
		document.addEventListener("MSFullscreenChange", this.handleFullScreenChange);

		// Remove loading class from body
		document.body.className = "";

	},

	/**
	 * On unmount, remove full screen event listener.
	 */
	componentWillUnmount: function() {

		// Unregister full screen handler
		document.removeEventListener("fullscreenchange", this.handleFullScreenChange);
		document.removeEventListener("webkitfullscreenchange", this.handleFullScreenChange);
		document.removeEventListener("mozfullscreenchange", this.handleFullScreenChange);
		document.removeEventListener("MSFullscreenChange", this.handleFullScreenChange);

	},

	/**
	 * Handle state updates
	 */
	componentDidUpdate: function(prevProps, prevState) {

		// Handle paused state switching
		if (prevState.paused != this.state.paused) {
			if (!this.state.paused) {

				// Enable full-screen when switching state
				var vpDOM = this.refs.content;
				if (vpDOM.requestFullscreen) {
					vpDOM.requestFullscreen();
				} else if (vpDOM.webkitRequestFullscreen) {
					vpDOM.webkitRequestFullscreen();
				} else if (vpDOM.mozRequestFullScreen) {
					vpDOM.mozRequestFullScreen();
				} else if (vpDOM.msRequestFullscreen) {
					vpDOM.msRequestFullscreen();
				}

			}

		}

	},

	/**
	 * Start/Stop
	 */
	handleStartDesktop: function() {
		this.setState({ 'paused': false, 'hmd': false });
	},
	handleStartHMD: function() {
		this.setState({ 'paused': false, 'hmd': true });
	},
	handlePause: function() {
		this.setState({ 'paused': true, 'hmd': false });
	},
	handleFullScreenChange: function(e) {
		if (
			document.fullscreenElement ||
			document.webkitFullscreenElement ||
			document.mozFullScreenElement ||
			document.msFullscreenElement
		) {
			// We are full screen
		} else {
			// We are not full screen
			this.handlePause();
		}
	},

	/**
	 * Main render function
	 */
	render: function() {
		return (
			<div ref="content" className="icnz-content">
			  <Viewport experiment={this.state.experiment} paused={this.state.paused} hmd={this.state.hmd} />
			  <Welcome visible={this.state.paused} onStartDesktop={this.handleStartDesktop} onStartHMD={this.handleStartHMD} />
			</div>
		);
	}

});

/**
 * Render root component
 */
ReactDOM.render(
	<IconeezinRoot />,
	document.getElementById('app')
);
