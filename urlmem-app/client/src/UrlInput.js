import React, { Component } from 'react';
import styles from './input-box.module.css';

class UrlInput extends Component {
	render() {
		return(
		<div className={styles.shortenOptions}>
			<input type="text" placeholder="url to shorten" className={styles.urlInput} tabIndex="1" />
			<button className={styles.shortenButton} tabIndex="3">shorten</button>
			<br />
			<span className={styles.siteName}>urlmem.com/</span>
			<span className={styles.customInputSpan}>
				<input type="text" placeholder="optional custom url" className={styles.customInput} tabIndex="2" />
			</span>
		</div>
		);	
	}
}

export default UrlInput;
