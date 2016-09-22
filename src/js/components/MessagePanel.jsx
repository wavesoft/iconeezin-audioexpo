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
			<div className={"icnz-message-panel" + (this.props.visible ? " visible" : "")}>
				<div className="icnz-message-panel-frame">
					<div className="icnz-part-logo"></div>
					<div className="icnz-part-header">
						{this.props.title}
					</div>
					<div className="icnz-part-body">
						{this.props.children}
					</div>
					<div className="icnz-part-version">
						{this.props.version}
					</div>
				</div>
			</div>
		);

	}

});
