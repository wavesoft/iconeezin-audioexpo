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

/**
 * Export welcome panel
 */
module.exports = React.createClass({

	/**
	 * Render the welcome panel
	 */
	render: function() {
		return (
			<div className={"icnz-welcome-host" + (this.props.visible ? " visible" : "")}>
				<div className="icnz-welcome-panel">
					<div className="icnz-welcome-body">
						<h1>Virtual Audio Exhibition</h1>
						<p>Please select one of the following modes to start your experience. It will open in full screen.</p>
					</div>
					<div className="icnz-welcome-buttons">
					
						<button className={this.props.hasvr ? "" : "visible"} type="button" onClick={this.props.onStartDesktop}>
							<img src="img/desktop.png" alt="VR" />&nbsp; Start Desktop Experience
						</button>
						<button className={this.props.hasvr ? "visible" : ""} type="button" onClick={this.props.onStartHMD}>
							<img src="img/vr.png" alt="VR" />&nbsp; Start VR Experience
						</button>

					</div>
				</div>
			</div>
		);

	}

});
