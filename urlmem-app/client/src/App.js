import React, { Component } from 'react';
import UrlShortening from './UrlShortening.js';
import './App.css';

class App extends Component {
	render() {
		return (
		<div className="App">
			<div className="Header">
				<a className="blogButton" href="https://antiprojects.com/urlmem.html">Blog</a>
			</div>
			<p className="bigIntro">
				<strong>
					UrlMem
				</strong>
			</p>
			<p className="smallIntro">
				Shortened URLS made memorable
			</p>

			<UrlShortening />

			<div className="Footer">
				&copy; 2020 Antioch Sanders
				<br />
				antiochsanders@gmail.com
			</div>
		</div>
		);
	}
}

export default App;
