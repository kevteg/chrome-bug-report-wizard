import { Component } from 'preact';
import styled from 'styled-components';

import { ButtonPrimary, ButtonSecondary } from './common/Buttons';
import { StyledInput, StyledTextArea, StyledForm } from './common/Form';

const MainContainer = styled.section`
	width: 50em;
	height: 40em;
	padding: 1em;
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

	handleSubmit = (e) => {
		e.preventDefault();
		console.log('Aiuda ---->');
		console.log(this.state);
	}

	takeScreenshot = () => {
		chrome.tabs.captureVisibleTab(null,{}, screenshot => this.setState({screenshot}) );
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
