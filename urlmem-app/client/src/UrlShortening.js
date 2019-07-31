import React, { Component } from 'react';
import inputStyles from './input-box.module.css';
import outputStyles from './output-box.module.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


class UrlShortening extends Component {
	constructor(props) {
		super(props);
		this.state = {shortenedUrls: [
		{
			shortUrl: "calgitsta",
			longUrl: "https://www.amazon.com/dp/B078MXSJ57/ref=sspa_dk_detail_5"
		}]};
		this.bindCallbacks();
	}

	bindCallbacks() {
		this.setLongUrl = this.setLongUrl.bind(this);
		this.processNewLink = this.processNewLink.bind(this);
		this.setCustomUrl = this.setCustomUrl.bind(this);
	
	}

	processNewLink() {
		this.addNewOutput();
		this.clearInputForm();
	}

	clearInputForm() {
		this.longUrl.value = "";
		this.customUrl.value = "";
	}

	addNewOutput() {
		var newShortenedUrls =
			[this.getInput(), ...this.state.shortenedUrls];
		this.setState({shortenedUrls: newShortenedUrls});
	}

	getInput() {
		return {
			shortUrl: this.customUrl.value,
			longUrl: this.longUrl.value
		};
	}

	setLongUrl(input) {
		this.longUrl = input;
	}

	setCustomUrl(input) {
		this.customUrl = input;
	}

	render() {
		return (
		<>
			{this.renderInputForm()}
			{this.renderOutputs()}
		</>
		);
	}

	renderInputForm() {
		return (
		<>
			<div className={inputStyles.shortenOptions}>
				<input type="text"
					placeholder="url to shorten"
					ref={this.setLongUrl.bind(this)}
					className={inputStyles.urlInput}
					tabIndex="1" />
				<button 
					onClick={this.processNewLink.bind(this)}
					className={inputStyles.desktopShortenButton}
					tabIndex="3">
				
					shorten
				</button>
				<br />
				<span className={inputStyles.siteName}>urlmem.com/</span>
				<span className={inputStyles.customInputSpan}>
					<input type="text"
						placeholder="optional custom url"
						ref={this.setCustomUrl.bind(this)}
						className={inputStyles.customInput}
						tabIndex="2" />
				</span>
				<button 
					onClick={this.processNewLink.bind(this)}
					className={inputStyles.mobileShortenButton}
					tabIndex="3">
				
					shorten
				</button>
			</div>
			<br />
		</>
		);
	}

	renderOutputs() {
		return (
		<TransitionGroup>
			{this.state.shortenedUrls.map(UrlPair =>
				<CSSTransition 
					key={UrlPair.shortUrl}
					timeout={300}
					classNames='latestOut'
				>
					<UrlOutput longUrl={UrlPair.longUrl}
						    shortUrl={UrlPair.shortUrl} 
					/>
				</CSSTransition>
			)}
		</TransitionGroup>
		);
	}
}

function UrlOutput(props) {
	return (
	<>
		<div className={outputStyles.shortenOutput}>
			<div className={outputStyles.siteName}>
				urlmem.com/
			</div>
			<div className={outputStyles.shortWord}>
				{props.shortUrl}
			</div>
			<button className={outputStyles.copyButton}>
				copy
			</button>
			<div className={outputStyles.longUrl}>
				{props.longUrl}
				<div className={outputStyles.longUrlCover}></div>
			</div>
		</div>
		<br />
	</>
	);
}

export default UrlShortening;
