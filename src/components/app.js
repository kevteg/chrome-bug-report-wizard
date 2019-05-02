import { Component } from 'preact';
import styled, { injectGlobal } from 'styled-components';

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
		let attachments = [
			{
				name : "screenshot.jpg",
				data: this.state.screenshot
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
			<li>- Name: ${this.state.name}</li>
			<li>- Steps: ${this.state.steps}</li>
			<li>- Results: ${this.state.results}</li>
			<li>- Expected Results: ${this.state.expected_results}</li>
			</ul>
			`,
			Attachments : attachments
		}).then(
			message => alert('Sent ----->')
		);
	}

	handleSubmit = (e) => {
		e.preventDefault();
		chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, (tabs) => {
			const url = tabs[0].url;
			console.log(url);
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
	}

	takeScreenshot = () => {
		chrome.tabs.captureVisibleTab(null,{}, screenshot => this.setState({ screenshot }));
	}

	couldSend = () => {
		// For now
		return true;
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

	render({}, { what, why }) {
		return (
			<MainContainer>
				<Content>
					<h1>Apploi Bug Reporter</h1>
					<StyledForm onSubmit={this.handleSubmit}>
						<label>Your name</label>
						<StyledTextArea name="name" onInput={this.handleChange} />
						<label>Steps to reproduce</label>
						<StyledTextArea name="steps" rows="6" placeholder="1. Ghost in as Faygee &#10;2. Click on &#10;3.&#10;" onInput={this.handleChange} />
						<label>Results</label>
						<StyledTextArea name="results" onInput={this.handleChange} />
						<label>Expected Results</label>
						<StyledTextArea name="expected_results" onInput={this.handleChange} />
						<section className="screenshot">
							{ this.renderScreenshot() }
						</section>
						{
							this.couldSend() && (
								<section className="options">
									<ButtonSecondary type="button">Cancel</ButtonSecondary>
									<ButtonPrimary className={``}>Send</ButtonPrimary>
								</section>
							)
						}
					</StyledForm>
				</Content>
			</MainContainer>
		);
	}
}
