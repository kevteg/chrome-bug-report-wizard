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
	'screenshot'
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

export default class App extends Component {

	state = {
		name: '',
		steps: '',
		results: '',
		expected_results: '',
		screenshot: null
	}

	handleChange = ({ target: { name, value } }) => {
		this.setState({ [name]: value });
	}

	sendEmail = (localStorage) => {
		let navigatorObject = {};
		navigatorKeys.forEach(key => {
			navigatorObject[key] = navigator[key];
		});
		let attachments = [
			{
				name : "screenshot.jpg",
				data: this.state.screenshot
			},
			{
				name : "browser.json",
				data: window.btoa(JSON.stringify(navigatorObject))
			}
		];
		if (localStorage) {
			attachments.push({
				name: "localstorage.json",
				data: window.btoa(JSON.stringify(localStorage))
			});
		}
		Email.send({
			SecureToken: "4aca5811-f806-4733-9cbe-fbf7d49e25a7",
			To : 'mbolivar100@gmail.com',
			From : "dev@apploi.com",
			Subject : 'Problem Apploi',
			Body : `
			<ul>
			<li>Name: ${this.state.name}</li>
			<li>Steps: ${this.state.steps}</li>
			<li>Results: ${this.state.results}</li>
			<li>Expected Results: ${this.state.expected_results}</li>
			</ul>
			`,
			Attachments : attachments
		}).then(
			message => this.setState({ loading: false, done: true })
		);
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.setState({ loading: true }, () => {
			chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
				const url = tabs[0].url;
				if (url.includes('apploi.com')) {
					chrome.runtime.onMessage.addListener(
						(request, sender, sendResponse) => {
							this.sendEmail(request.local || {});
						});
					chrome.tabs.query({active: true, currentWindow: true }, (tabs) => {
						chrome.tabs.sendMessage(tabs[0].id, { ask: true }, (response) => {
							console.log('Sent ---->');
						});
					});
				} else {
					this.sendEmail(null);
				}
			});
		});
	}

	takeScreenshot = () => {
		chrome.tabs.captureVisibleTab(null,{}, screenshot => this.setState({ screenshot }));
	}

	couldSend = () => {
		let could = true;
		requiredFields.forEach(key => {
			if (!checkExistence(this.state[key])) {
				could = false;
			}
		});
		return could;
	}

	renderScreenshot = () => {
		const { screenshot } = this.state;
		if (!screenshot) {
			return (
				<ButtonPrimary type="button" onClick={this.takeScreenshot}>Take Screenshot</ButtonPrimary>
			);
		}
		return (
			<img src={screenshot} alt="screenshot" />
		);
	}

	closeExtension = () => {
		if (typeof window !== 'undefined') window.close()
	}

	renderContent = () => {
		const {
			name,
			steps,
			results,
			expected_results,
			loading,
			done
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
				<h1>Apploi Bug Reporter</h1>
				<StyledForm onSubmit={this.handleSubmit}>
					<label>Your name</label>
					<StyledTextArea value={name} name="name" onInput={this.handleChange} />
					<label>Steps to reproduce</label>
					<StyledTextArea value={steps} name="steps" rows="6" placeholder="1. Ghost in as Faygee &#10;2. Click on &#10;3.&#10;" onInput={this.handleChange} />
					<label>Results</label>
					<StyledTextArea value={results} name="results" onInput={this.handleChange} />
					<label>Expected Results</label>
					<StyledTextArea value={expected_results} name="expected_results" onInput={this.handleChange} />
					<section className="screenshot">
						{ this.renderScreenshot() }
					</section>
					{
						this.couldSend() && (
							<section className="options">
								<ButtonSecondary type="button" onClick={this.closeExtension}>Cancel</ButtonSecondary>
								{ this.couldSend() && <ButtonPrimary>Send</ButtonPrimary> }
							</section>
						)
					}
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
