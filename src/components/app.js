import { Component } from 'preact';
import styled, { injectGlobal } from 'styled-components';

import ApploiSpinner from './common/ApploiSpinner';
import { ButtonPrimary, ButtonSecondary } from './common/Buttons';
import { StyledInput, StyledTextArea, StyledForm } from './common/Form';
import { Email } from '../../js/smtp';

injectGlobal`
@font-face {
	font-family: "Neutraface";
	src: url("/assets/fonts/NeutraDisplay-Bold.otf") format("opentype");
	font-weight: bold;
	font-stretch: normal;
	}
`;

const MainContainer = styled.section`
	width: 50em;
	height: 40em;
	padding: 1em;
	font-family: "Neutraface";
	h1 {
		font-size: 1.8rem;
	}
`;

const Content = styled.div`
	border-radius: 10px;
	padding: 1em;
	height: 100%;
	h1 {
		width: 100%;
		text-align: center;
	}
	section.screenshot {
		margin-top: 1rem;
		margin: 1rem;
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		img {
			width: 100%;
			height: 100%;
			object-fit: fill;
		}
	}
`;

const DoneContainer = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	h2 {
		margin-bottom: 1rem;
	}
`;

const requiredFields = [
	'name',
	'steps',
	'results',
	'expected_results',
	'screenshot',
	'email'
];

const navigatorKeys = [
	'appCodeName',
	'appName',
	'appVersion',
	'budget',
	'connection',
	'cookieEnabled',
	'credentials',
	'deviceMemory',
	'doNotTrack',
	'geolocation',
	'hardwareConcurrency',
	'language',
	'languages',
	'maxTouchPoints',
	'mediaDevices',
	'mimeTypes',
	'onLine',
	'permissions',
	'platform',
	'plugins',
	'presentation',
	'product',
	'productSub',
	'serviceWorker',
	'storage',
	'usb',
	'userAgent',
	'vendor',
	'vendorSub',
	'webkitPersistentStorage',
	'webkitTemporaryStorage'
];

const stateKeys = [
	'name',
	'steps',
	'results',
	'expected_results',
	'screenshot',
	'email'
];

function checkExistence(value) {
	switch (typeof value) {
		case 'string':
			return value.length > 0;
		case 'object':
			return value && value.name;
		default:
			return false;
	}
}

function stepsFill(steps) {
	const splitSteps = steps.split('\n');
	let string = '<ul>'
	splitSteps.forEach(step => {
		string += `<li>${step}</li>`
	});
	string += '</ul>';
	return string;
}

export default class App extends Component {

	state = {
		name: '',
		steps: '',
		results: '',
		expected_results: '',
		email: '',
		screenshot: null
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
					updateObject[key] = JSON.parse(localStorage[key]);
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
		let navigatorObject = {};
		navigatorKeys.forEach(key => {
			navigatorObject[key] = navigator[key];
		});
		let attachments = [
			{
				name: 'screenshot.jpg',
				data: this.state.screenshot
			},
			{
				name: 'browser.json',
				data: window.btoa(JSON.stringify(navigatorObject))
			}
		];
		if (tabLocalStorage) {
			attachments.push({
				name: 'localstorage.json',
				data: window.btoa(JSON.stringify(tabLocalStorage))
			});
		}
		Email.send({
			SecureToken: '4aca5811-f806-4733-9cbe-fbf7d49e25a7',
			To: ['frank@apploi.com', this.state.email],
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
			message => this.setState({ loading: false, done: true }, () => this.clearLocalStorage())
		);
	}

	onError = (result) => {
		if (result) {
			console.log('ALGUNA SALIO ---->')
			console.log(result)
			if (result) {
				this.setState({ loading: false }, () => {
					alert('We had a problem, try reloading the page and send the bug again');
				});
			}
		}
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ loading: true }, () => {
			chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
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
									chrome.tabs.sendMessage(tabs[0].id, { ask: true }, (response) => {
										console.log('Sent ---->');
									});
								});
							}, 1000);
						}),
						new Promise((resolve) => {
							setTimeout(() => {
								resolve(true);
							}, 8000);
						})
					])
					.then(this.onError)
					.catch(e => this.onError(true));
				} else {
					this.sendEmail(null);
				}
			});
		});
	}

	takeScreenshot = () => {
		chrome.tabs.captureVisibleTab(null,{}, screenshot => this.setState({ screenshot }, () => this.componentToLocalStorage('screenshot')));
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

	componentDidMount() {
		this.componentFromLocalStorage();
	}

	renderScreenshot = () => {
		const { screenshot } = this.state;
		return (
			<div>
				{ screenshot && <img src={screenshot} alt="screenshot" /> }
				<ButtonPrimary type="button" onClick={this.takeScreenshot}>Take Screenshot</ButtonPrimary>
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
					<h2>Your request was sucessfully sent. Our team will reach you when appropriate.</h2>
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
						<label>Screenshot</label>
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
				<Content>
					{ this.renderContent() }
				</Content>
			</MainContainer>
		);
	}
}
