import React, { Component } from 'react';
import inputStyles from './input-box.module.css';
import outputStyles from './output-box.module.css';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


class UrlShortening extends Component {
  constructor(props) {
    super(props);
    this.state = {numOutputs: 0, showError: false, shortenedUrls: []};
    this.bindCallbacks();
  }

  bindCallbacks() {
    this.requestShortening = this.requestShortening.bind(this);
    this.setLongUrl = this.setLongUrl.bind(this);
    this.processNewLink = this.processNewLink.bind(this);
    this.setCustomUrl = this.setCustomUrl.bind(this);
    this.buildCustomUrlQuery = this.buildCustomUrlQuery.bind(this);
    this.buildRandomUrlQuery = this.buildRandomUrlQuery.bind(this);
    this.buildUrlQuery = this.buildUrlQuery.bind(this);
    this.finishLoading = this.finishLoading.bind(this);
    this.getNextId = this.getNextId.bind(this);
    this.showError = this.showError.bind(this);
  }

  processNewLink() {
    this.addNewOutput();
    this.requestShortening();
  }

  requestShortening() {
    let longUrl = this.longUrl.value;
    let customUrl = this.customUrl.value;
    let query = this.buildUrlQuery(longUrl, customUrl);
    fetch(query)
      .then(res => res.json())
      .then(res => this.finishLoading(longUrl, res.shortened));
  }

  finishLoading(longUrl, shortUrl) {
    console.log(shortUrl);
    console.log(this.state.shortenedUrls);
    let updatedShortenedUrls = this.state.shortenedUrls.map(x => {
      if (x.longUrl !== longUrl || x.shortUrl !== "") {
        return x;
      } else {
        if (shortUrl === null) {
          return { ...x, 'remove': true };
        } else {
          return { ...x, 'shortUrl': shortUrl };
        }
      }
    });
    let isValid = (x) => !x.remove;
    let validShortenedUrls = updatedShortenedUrls.filter(isValid)
    if (validShortenedUrls.length === updatedShortenedUrls.length) {
      this.clearInputForm();
    } else {
      this.showError();
    }
    this.setState({shortenedUrls: updatedShortenedUrls});
  }

  showError() {
    if (!this.state.showError) {
      /*this.setState({showError: true});*/
      /*setTimeout(() => this.setState({showError: false}), 3000);*/
      setTimeout(() => {
          let isValid = (x) => !x.remove;
          let validShortenedUrls = this.state.shortenedUrls.filter(isValid)
          this.setState({showError: false, shortenedUrls: validShortenedUrls})
      }, 800);
    }
  }

  buildUrlQuery(longUrl, customUrl) {
    if (customUrl) {
      return this.buildCustomUrlQuery(longUrl, customUrl);
    } else {
      return this.buildRandomUrlQuery(longUrl, customUrl);
    }
  }

  buildRandomUrlQuery(longUrl, customUrl) {
    return "/random?longUrl=" + longUrl;
  }

  buildCustomUrlQuery(longUrl, customUrl) {
    return "/custom?longUrl=" + longUrl + "&customUrl=" + customUrl;
  }

  clearInputForm() {
    this.longUrl.value = "";
    this.customUrl.value = "";
  }

  addNewOutput() {
    let newShortenedUrls =
      [this.getInput(), ...this.state.shortenedUrls];
    let newNumOutputs = this.state.numOutputs + 1;
    console.log("new", newShortenedUrls)
    this.setState({numOutputs: newNumOutputs,
                   shortenedUrls: newShortenedUrls});
  }

  getNextId() {
    return this.state.numOutputs;
  }

  getInput() {
    return {
      id: this.getNextId(),
      shortUrl: "",
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
          key={UrlPair.id}
          timeout={300}
          classNames='latestOut'
        >
          <UrlOutput longUrl={UrlPair.longUrl}
                     shortUrl={UrlPair.shortUrl}
                     toRemove={UrlPair.remove === true}
          />
        </CSSTransition>
      )}
    </TransitionGroup>
    );
  }
}

function copyLink() {
  let link = "UrlMem.com/" + this.shortUrl;
  navigator.clipboard.writeText(link);
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

      <button className={outputStyles.copyButton}
              onClick={copyLink.bind(props)}>
        copy
      </button>

      <div className={outputStyles.longUrl}>
        {props.longUrl}
        <div className={outputStyles.longUrlCover}></div>
      </div>
      <LoadingCover show={!props.shortUrl} />
      <FailedCover show={props.toRemove} />
    </div>
    <br />
  </>
  );
}

function LoadingCover(props) {
  return (<>{props.show &&
    <div className={outputStyles.loadingCover}>
      ...
    </div>}
  </>);
}

function FailedCover(props) {
  return (<>{props.show &&
    <div className={outputStyles.failedCover}>
      that shortening is taken :/
    </div>}
  </>);
}

export default UrlShortening;
