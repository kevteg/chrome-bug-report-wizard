import styled from 'styled-components';

const StyledButton = styled.button`
	padding: 1rem;
	font-weight: bold;
    font-family: Neutraface;
    font-size: 13px;
    border-radius: 5px !important;
	text-transform: uppercase;
	display: inline-block;
    cursor: pointer;
	text-decoration: none;
	text-align: center;
	width: 8rem;
	border: none;
`;

export const ButtonSecondary = styled(StyledButton)`
    background-color: transparent;
    border: 1px solid #fcb040 !important;
	color: #fcb040;
`;

export const ButtonPrimary = styled(StyledButton)`
    background-color: #fcb040;
	color: white;
`;