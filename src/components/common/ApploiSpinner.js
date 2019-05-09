import React from 'react';
import styled from 'styled-components';

const GifContainer = styled.div`
    background: url(https://s3.amazonaws.com/apploi-web-icons/apploi-spinner-wheel.gif) center center/140px 140px no-repeat;
    width: 100px;
    height: 100px;
    position: absolute;
`;

const FillContainer = styled.div`
    background-image: url(https://s3.amazonaws.com/apploi-web-icons/apploi-gradient.png);
    background-size: cover;
    border-radius: 100px;
    width: 100px;
    height: 100px;
    box-shadow: 0 0 80px rgba(0, 0, 0, 0.25);
`;

const Container = styled.div`
    top: 0;
    width: 100%;
    z-index: 100;
`;

const Gif = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const MessageContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    h2 {
        margin-top: 2rem;
    }
`;

const ApploiSpinner = () => (
    <MessageContainer>
        <Container>
            <Gif>
                <GifContainer />
                <FillContainer />
            </Gif>
        </Container>
        <h2>Sending, please do not close this until it's done...</h2>
    </MessageContainer>
);

export default ApploiSpinner;

