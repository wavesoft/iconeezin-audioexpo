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

var $ = require('jquery');
var React = require('react');

/**
 * HADE Content is what is shown in HADE
 */
var HADEContent = React.createClass({

	/**
	 * Render the viewport
	 */
	render: function() {
		return (
			<div className="icnz-hade-content">
				<div className="icnz-hade-center-pane">
					<h1>{this.props.title}</h1>
					<p>{this.props.body}</p>
				</div>
			</div>
		);
	}


});

/**
 * Export HADE
 */
module.exports = React.createClass({

	/**
	 * The initial hade state 
	 */
	getInitialState: function() {
		return { width: window.innerWidth, height: window.innerHeight };
	},

	/**
	 * When component is mounted, listen for DOM events
	 */
	componentDidMount: function() {
		window.addEventListener('resize', this.handleResize);
		this.handleResize();
	},

	/**
	 * When component is unmounted, remove listener
	 */
	componentWillUnmount: function() {
		window.removeEventListener('resize', this.handleResize);
	},

	/**
	 * Handle resize
	 */
	handleResize: function(e) {
		this.setState({
			'width': window.innerWidth,
			'height': window.innerHeight
		});
	},

	/**
	 * Render the viewport
	 */
	render: function() {

		// Create CSS rules for edges
		var sizeStyle = {
			'width': this.state.width,
			'height': this.state.height
		}

		// Render HADE
		return (
			<div ref="host" style={sizeStyle} className={
					"icnz-hade" + (this.props.hmd ? " icnz-hade-hmd" : "") 
							    + (this.props.visible ? " visible" : "")
							    + " icnz-hade-type-"+this.props.type
				}>
				<div className="icnz-hade-left" style={sizeStyle}>
					<HADEContent title={this.props.title} body={this.props.body} />
				</div>
				<div className="icnz-hade-right" style={sizeStyle}>
					<HADEContent title={this.props.title} body={this.props.body} />
				</div>
			</div>
		);

	}

});
