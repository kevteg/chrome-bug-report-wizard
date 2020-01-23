import styled from 'styled-components';

export const FlexContainerCenter = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
`;

export const MainContainer = styled.section`
	width: 50em;
	height: 40em;
	padding: 1em;
	font-family: "Neutraface";
	h1 {
		font-size: 1.8rem;
	}
`;

export const Content = styled.div`
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
		display: block;
		img {
			width: 100%;
			height: 100%;
			object-fit: fill;
		}
		div.screenshot-item {
			width: 100%;
			height: 100%;
			position: relative;
		}
	}
`;

export const DoneContainer = styled.div`
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	h2 {
		margin-bottom: 1rem;
	}
`;