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
	border: 2px solid black;
	border-radius: 10px;
	padding: 1em;
`;

export default class App extends Component {

	state = {
		what: '',
		why: '',
		screenshot: null,
	}

	handleChange = ({ target: { name, value } }) => {
		this.setState({ [name]: value });
	}

	handleSubmit = (e) => {
		e.preventDefault();
		chrome.tabs.captureVisibleTab(null,{}, screenshot => this.setState({screenshot}) );
		console.log('Aiuda ---->');
		console.log(this.state);
	}

	render({}, { what, why }) {
		return (
			<MainContainer>
				<Content>
					<span>Aiuda</span>
					<StyledForm onSubmit={this.handleSubmit}>
						<label>Your name</label>
						<StyledTextArea name="name" onInput={this.handleChange} />
						<label>Steps to reproduce</label>
						<StyledTextArea name="steps" rows="6" placeholder="1. Ghost in as Faygee &#10;2. Click on &#10;3.&#10;" onInput={this.handleChange} />
						<label>Results</label>
						<StyledTextArea name="results" onInput={this.handleChange} />
						<label>Expected Results</label>
						<StyledTextArea name="expected_results" onInput={this.handleChange} />
						<section className="options">
							<ButtonSecondary type="button">Cancel</ButtonSecondary>
							<ButtonPrimary className={``}>Send</ButtonPrimary>
						</section>
					</StyledForm>
					<img src={this.state.screenshot} />
				</Content>
			</MainContainer>
		);
	}
}
