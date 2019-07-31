import React, { Component } from 'react';
import styles from './output-box.module.css';

class UrlOutput extends Component {
	render() {
		return (
		<div className={styles.shortenOutput}>
			<div className={styles.widthContainer}>
				<div className={styles.siteName}>urlmem.com/</div><div className={styles.shortWord}>chaskyho</div>
				<button className={styles.copyButton}>copy</button>
			</div>
				<div className={styles.longUrl}>
	https://www.amazon.com/Gildan-Ultra-Cotton-T-Shirt-2-Pack/dp/B07612754Q/ref=sr_1_8?crid=1Y7G3Z5W0MGTF&keywords=t-shirts%2Bfor%2Bmen&qid=1555745243&s=gateway&sprefix=t%2Bshirt%2Caps%2C157&sr=8-8&th=1&psc=1
					<div className={styles.longUrlCover}></div>
				</div>
		</div>
		);
	}
}

export default UrlOutput;
