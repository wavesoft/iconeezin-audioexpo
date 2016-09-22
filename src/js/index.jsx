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

var Iconeezin = require("iconeezin");

var React = require('react');
var ReactDOM = require('react-dom');

var IconVR = require('../img/vr.svg');
var IconDesktop = require('../img/desktop.svg');
var IconExclamation = require('../img/exclamation.svg');

var Viewport = require('./components/Viewport');
var Welcome = require('./components/Welcome');
var ErrorMessage = require('./components/ErrorMessage');
var MessagePanel = require('./components/MessagePanel');

var metadata = require('json!../../package.json');

/**
 * Root component
 */
var IconeezinRoot = React.createClass({

	/**
	 * Default state
	 */
	getInitialState: function() {
		return {
			hasvr: false,
			mockvr: false,
			hmd: false,
			paused: true,
			experiment: null,
			error: null,
			loading: true,
			version: metadata.version
		};
	},

	/**
	 * If we are from a mobile client, enable mockvr support
	 */
	initializeWebVRPolyfill: function() {
		if (Iconeezin.Runtime.Browser.isMobile() && !Iconeezin.Runtime.Browser.hasVR()) {

			// Initialize polyfill
			window.InitializeWebVRPolyfill();

			// Enable mocked VR support
			this.setState({
				mockvr: true
			});

		}
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

		// Enable optional VR polyfill support
		this.initializeWebVRPolyfill();

		// Bind on iconeezin callbacks
		Iconeezin.Runtime.Browser.onVRSupportChange( this.handleVRChange );

		// Set particular cache dropping ID
		Iconeezin.Runtime.Experiments.setCacheHash( 'v'+metadata.version );

		// Run pre-flights and show possible errors
		Iconeezin.Runtime.preflight((function(isOk, error) {

			// If everything is ok, just hide the loading screen
			if (isOk) {
				this.setState({ loading: false });
				return;
			}

			// Otherwise show error
			this.setState({
				loading: false,
				error: error
			});

		}).bind(this));

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

		// Unregoster from VR availability events
		Iconeezin.Runtime.Browser.offVRSupportChange( this.handleVRChange );

	},

	/**
	 * Event handlers
	 */
	handleVRChange: function( isSupported, hmdDevice ) {
		this.setState({ 'hasvr': isSupported });
	},
	handleStartDesktop: function() {
		this.setState({ 'paused': false, 'hmd': false, 'error': null });
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
	 * Return the contents of an error panel
	 */
	getErrorMessage: function() {
		return (
				<div className="icnz-error-frame">
					<div className="icnz-part-icon">
						<IconExclamation />
					</div>
					<div className="icnz-part-content">
						<h4>Ανεπανόρθωτο σφάλμα</h4>
						<p>{this.state.error}</p>
					</div>
				</div>
			);
	},

	/**
	 * Return the contents of the start message
	 */
	getStartMessage: function() {
		let buttons = [];

		if (this.state.mockvr) {
			buttons.push(
				<button key="desktop"
					className="icnz-button"
					onClick={this.handleStartDesktop}>
					<IconDesktop /> Οθόνη υπολογιστή
				</button>
			);
			buttons.push(
				<button key="vr"
					className="icnz-button"
					onClick={this.handleStartHMD}>
					<IconVR /> Συσκευή VR
				</button>
			);

		} else if (this.state.hasvr) {
			buttons.push(
				<button key="vr"
					className="icnz-button"
					onClick={this.handleStartHMD}>
					<IconVR /> Εναρξη σε συσκευή VR
				</button>
			);

		} else {
			buttons.push(
				<button key="desktop"
					className="icnz-button"
					onClick={this.handleStartDesktop}>
					<IconDesktop /> Έναρξη σε οθόνη υπολογιστή
				</button>
			);

		}

		return (
			<div>
				<div>
					Καλωσήρθατε στην έκθεση ακουστικών πειραμάτων.
					Για τη βέλτιστη εμπειρία σας, προτείνεται να χρησιμοποιήσετε τον πλοηγό Google Chrome.
				</div>
				<div className={"icnz-buttongroup icnz-buttons-" + buttons.length}>
					{buttons}
				</div>
			</div>
			);
	},

	/**
	 * Main render function
	 */
	render: function() {
		return (
			<div ref="content" className="icnz-content">
			  <Viewport
			  	experiment={this.state.experiment}
			  	paused={this.state.paused}
			  	hmd={this.state.hmd} />
			  <MessagePanel
			  	title="Έκθεση Ακουστικών Πειραμάτων"
			  	version={`Έκδοση ${metadata.version}`}
			  	visible={this.state.paused && !this.state.loading}>
			  	{this.state.error ? this.getErrorMessage() : this.getStartMessage()}
			  </MessagePanel>
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
