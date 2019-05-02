import styled from 'styled-components';

export const StyledInput = styled.input`
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid rgba(0,0,0,0.25);
    width: 100%;
    margin: 1rem 0;
    &:active, &:focus {
        outline: 2px solid #fcb040;
    }
`;

export const StyledTextArea = styled.textarea`
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid rgba(0,0,0,0.25);
    width: 100%;
    &:active, &:focus {
        outline: 2px solid #fcb040;
    }
`;

export const StyledForm = styled.form`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    section.options {
        margin-top: 1rem;
        margin-bottom: 1rem;
        width: 100%;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }
    button {
        margin-left: 1rem;
    }
    label {
        margin: 1rem 0;
        font-weight: bold;
    }
`;