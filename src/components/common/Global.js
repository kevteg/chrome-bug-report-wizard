import { createGlobalStyle } from 'styled-components';

export const GlobalStyling = createGlobalStyle`
	@font-face {
		font-family: "Neutraface";
		src: url("/assets/fonts/NeutraDisplay-Bold.otf") format("opentype");
		font-weight: bold;
		font-stretch: normal;
	}
`;