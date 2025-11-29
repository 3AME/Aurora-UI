import React from 'react';
import styled, { keyframes, css } from 'styled-components';

// --- Keyframes for Background Flow ---
const backgroundFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

// --- Styled Component for the Global Background ---
const BackgroundWrapper = styled.div`
    position: fixed; /* Fixed to cover the entire viewport and allow scrolling */
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1; /* Keep it below the mockup (z-index: 50) */
    background-color: #05051a; /* Very dark base */
    
    /* Linear Gradient for a smooth, wide aurora sweep */
    background: linear-gradient(
        -45deg, 
        #0a0a2a, /* Dark start */
        #102040, /* Dark blue */
        #00ff0050, /* Semi-transparent Green Aurora */
        #ff00ff50, /* Semi-transparent Purple Aurora */
        #102040  /* Dark blue end */
    );
    background-size: 400% 400%; /* Make the gradient large for smooth transition */

    /* Apply the slow, continuous flow animation */
    animation: ${backgroundFlow} 60s ease infinite; 

    /* Blur the entire background layer for a non-intrusive effect */
    filter: blur(10px); 
`;

const GlobalBackground = () => {
    return <BackgroundWrapper />;
};

export default GlobalBackground;