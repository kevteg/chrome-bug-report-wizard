import { Component } from 'preact';
import styled from 'styled-components';

import { ButtonPrimary, ButtonSecondary } from './common/Buttons';
import { StyledInput, StyledTextArea, StyledForm } from './common/Form';
import { Email } from '../../js';

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
        Email.send({
            Host : "smtp.mandrillapp.com",
            Username : "Apploi",
            Password : "pass",
            To : 'kevteg05@gmail.com',
            From : "dev@apploi.com",
            Subject : this.state.what,
            Body : this.state.why
        }).then(
          message => alert(message)
        );
	}

	render({}, { what, why }) {
		return (
			<MainContainer>
				<Content>
					<span>Aiuda</span>
					<StyledForm onSubmit={this.handleSubmit}>
						<StyledInput name="what" value={what} onInput={this.handleChange} />
						<StyledTextArea name="why" value={why} onInput={this.handleChange} />
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
