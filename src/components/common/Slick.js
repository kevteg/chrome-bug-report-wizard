import styled from 'styled-components';

export const SlideButton = styled.button`
	width: 2rem;
	height: 2rem;
	border-radius: 50%;
	border: none;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
	transition: all .5s ease-in-out;
	z-index: 15;
	font-weight: bold;
	background-color: #23241f;
		color: white;
		cursor: pointer;
	&::before {
		color: #23241f;
	}
	&.slick-next {
		margin-right: .5rem;
	}
	&.slick-prev {
		margin-left: .5rem;
	}
	&:focus {
		color: #23241f;
	}
	&.delete-screenshot {
		position: absolute;
		top: 5%;
		right: 5%;
		background-color: #23241f;
		color: white;
        padding-top: .2rem;
		cursor: pointer;
		&:hover {
			border: 2px solid white !important;
		}
	}
	&.slick-prev:before,
    &.slick-next:before {
		color: #23241f !important;
	}
`;

export const NextArrow = (props) => (
	<SlideButton {...props} />
);

export const PrevArrow = (props) => (
	<SlideButton {...props} />
);