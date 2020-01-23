import { Component } from 'preact';
import Slider from "react-slick";
import { GlobalStyling } from './common/Global';
import { ButtonPrimary, ButtonSecondary } from './common/Buttons';
import { StyledTextArea, StyledForm } from './common/Form';
import ApploiSpinner from './common/ApploiSpinner';
import {
	MainContainer,
	Content,
	FlexContainerCenter,
	DoneContainer
} from './common/Misc';
import {
	base64EncodeUnicode,
	checkExistence,
	stepsFill
} from '../utils';
import { SlideButton } from './common/Slick';
import { slideSettings } from '../settings';
import { requiredFields, navigatorKeys, stateKeys } from '../constants';
import { Email } from '../../js/smtp';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const DeleteScreenshot = ({ index, deleteAction }) => {

	function callToAction() {
		deleteAction(index);
	}

	return (
		<SlideButton type="button" className="delete-screenshot" onClick={callToAction}>
			X
		</SlideButton>
	);

};

export default class App extends Component {

	state = {
		name: '',
		steps: '',
		results: '',
		expected_results: '',
		email: '',
		screenshot: [],
		sending: false
	}

	clearLocalStorage = () => {
		stateKeys.forEach(key => {
			delete(localStorage[key]);
		});
	}

	componentFromLocalStorage = () => {
		let updateObject = {};
		stateKeys.forEach(key => {
			if (localStorage[key]) {
				if (key !== 'screenshot') {
					updateObject[key] = localStorage[key];
				} else {
					try {
						updateObject[key] = JSON.parse(localStorage[key]);
					} catch (error) {
						updateObject[key] = null;
					}
				}
			}
		});
		this.setState({ ...updateObject });
	}

	componentToLocalStorage = (key) => {
		if (key !== 'screenshot') {
			localStorage[key] = this.state[key];
		} else {
			localStorage[key] = JSON.stringify(this.state[key]);
		}
	}

	handleChange = ({ target: { name, value } }) => {
		this.setState({ [name]: value }, () => {
			this.componentToLocalStorage(name);
		});
	}

	sendEmail = (tabLocalStorage) => {
		if (!this.state.sending) {
			this.setState({ sending: true }, () => {
				let navigatorObject = {};
				navigatorKeys.forEach(key => {
					navigatorObject[key] = navigator[key];
				});
				let attachments = [
					{
						name: 'browser.json',
						data: base64EncodeUnicode(JSON.stringify(navigatorObject))
					}
				];
				if (tabLocalStorage) {
					attachments.push({
						name: 'localstorage.json',
						data: base64EncodeUnicode(JSON.stringify(tabLocalStorage))
					});
				}
				this.state.screenshot.forEach((scs, index) => {
					attachments.push({
						name: `screenshot-${index + 1}.jpg`,
						data: scs
					});
				});
				Email.send({
					SecureToken: '4aca5811-f806-4733-9cbe-fbf7d49e25a7',
					To: ['bugs@apploi.com', this.state.email],
					From: 'dev@apploi.com',
					Subject: `Apploi Bug - ${this.state.email}`,
					Body: `
					<ul>
					<li>Name: ${this.state.name}</li>
					<li>Steps to reproduce:</li>
					${stepsFill(this.state.steps)}
					<li>Results: ${this.state.results}</li>
					<li>Expected Results: ${this.state.expected_results}</li>
					</ul>
					`,
					Attachments: attachments
				}).then(
					message => this.setState({ loading: false, sending: false, done: true }, () => this.clearLocalStorage())
				).catch(
					error => this.setState({ loading: false, sending: false }, () => alert('We had a problem sending your email, please try it again'))
				);
			});
		}
	}

	onError = (result, tabId) => {
		if (result) {
			if (result) {
				this.setState({ loading: false }, () => {
					alert('We had a problem, try again, if not, reload the page and try to send the bug again');
					chrome.tabs.executeScript(tabId, { file: '/assets/js/storage.js' });
				});
			}
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ loading: true }, () => {
			chrome.tabs.query({ 'currentWindow': true, 'active': true }, (tabs) => {
				const url = tabs[0].url;
				if (url.includes('apploi.com')) {
					Promise.race([
						new Promise((resolve, reject) => {
							chrome.runtime.onMessage.addListener(
								(request, sender, sendResponse) => {
									resolve(false);
									this.sendEmail(request.local || {});
								});
							setTimeout(() => {
								chrome.tabs.query({active: true, currentWindow: true }, (tabs) => {
									chrome.tabs.sendMessage(tabs[0].id, { ask: true });
								});
							}, 1000);
						}),
						new Promise((resolve) => {
							setTimeout(() => {
								resolve(true);
							}, 5000);
						})
					])
					.then(result => this.onError(result, tabs[0].id))
					.catch(e => this.onError(true, tabs[0].id));
				} else {
					this.sendEmail(null);
				}
			});
		});
	}

	takeScreenshot = () => {
		const { screenshot } = this.state;
		chrome.tabs.captureVisibleTab(null,{}, scs => this.setState({ screenshot: [...screenshot, scs] }, () => {
			this.componentToLocalStorage('screenshot');
			if (this.slick) {
				this.slick.slickGoTo(screenshot.length);
			}
		})); 
	}

	checkValidEmail = () => {
		const { email } = this.state;
		const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return !emailRegexp.test(email.toLowerCase());
	}

	couldSend = () => {
		let could = true;
		requiredFields.forEach(key => {
			if (!checkExistence(this.state[key])) {
				could = false;
			}
		});
		if (this.checkValidEmail()) {
			could = false;
		}
		return could;
	}

	closeExtension = () => {
		if (typeof window !== 'undefined') window.close()
	}

	deleteScreenshot = (deleteIndex) => {
		const { screenshot } = this.state;
		const filteredScreenshots = screenshot.filter((_, index) => index !== deleteIndex);
		this.setState({ screenshot: filteredScreenshots }, () => {
			this.componentToLocalStorage('screenshot');
		});
	}

	componentDidMount() {
		this.componentFromLocalStorage();
	}

	renderCarousel = () => {
		const { screenshot } = this.state;
		return (
			<Slider ref={slick => this.slick = slick} {...slideSettings}>
				{ screenshot.map((scs, index) => (
					<div className="screenshot-item">
						<img src={scs} />
						<DeleteScreenshot deleteAction={this.deleteScreenshot} index={index} />
					</div>
				)) }
			</Slider>
		);
	}


	renderScreenshot = () => {
		const { screenshot } = this.state;
		return (
			<div>
				<div className="slick">
					{ screenshot.length > 0 && this.renderCarousel() }
				</div>
				{ screenshot.length < 4 && (
					<FlexContainerCenter>
						<ButtonPrimary type="button" onClick={this.takeScreenshot}>Take Screenshot</ButtonPrimary>
					</FlexContainerCenter>
				)}
			</div>
		);
	}
	
	renderContent = () => {
		const {
			name,
			steps,
			results,
			expected_results,
			loading,
			done,
			email
		} = this.state;
		if (loading) {
			return (<ApploiSpinner />);
		}
		if (done) {
			return (
				<DoneContainer>
					<h2>Your request was successfully sent. Our team will reach you when appropriate.</h2>
					<ButtonPrimary onClick={this.closeExtension}>Close</ButtonPrimary>
				</DoneContainer>
			);
		}
		return (
			<div>
				<h1>👾 Apploi Bug Reporter 👾</h1>
				<StyledForm onSubmit={this.handleSubmit}>
					<label>Your name</label>
					<StyledTextArea value={name} name="name" onInput={this.handleChange} />
					<div className="stacked">
						<label>Your Email</label>
						<label className="reminder">We'll send you a copy of this ticket ✍️</label>
					</div>
					<StyledTextArea value={email} name="email" onInput={this.handleChange} />
					{ (email && this.checkValidEmail()) && <span className="error">Please enter a valid email</span> }
					<label>Steps to reproduce</label>
					<StyledTextArea value={steps} name="steps" rows="6" placeholder="1. Ghost in as Faygee &#10;2. Click on &#10;3.&#10;" onInput={this.handleChange} />
					<label>Results</label>
					<StyledTextArea value={results} name="results" onInput={this.handleChange} />
					<label>Expected Results</label>
					<StyledTextArea value={expected_results} name="expected_results" onInput={this.handleChange} />
					<section className="screenshot">
						<FlexContainerCenter>
							<label>Screenshot</label>
						</FlexContainerCenter>
						{ this.renderScreenshot() }
					</section>
					<section className="options">
						<ButtonSecondary type="button" onClick={this.closeExtension}>Cancel</ButtonSecondary>
						{ this.couldSend() && <ButtonPrimary>Send</ButtonPrimary> }
					</section>
				</StyledForm>
			</div>
		);
	}

	render() {
		return (
			<MainContainer>
				<GlobalStyling />
				<Content>
					{ this.renderContent() }
				</Content>
			</MainContainer>
		);
	}
}
