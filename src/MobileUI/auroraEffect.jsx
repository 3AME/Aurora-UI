import React from 'react';
import styled, { keyframes } from 'styled-components';

// --- 动画定义 (与全局背景的流动动画保持一致) ---
const gradientFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const AURORA_COLORS = {
    LOW:    'linear-gradient(-45deg, #7a00ff, #da00ff, #00ccff, #ff66b2)', 
    MEDIUM: 'linear-gradient(-45deg, #FF6F00, #FF3D00, #F50057, #C51162)', 
    HIGH:   'linear-gradient(-45deg, #00C853, #1DE9B6, #2962FF, #00B0FF)',
};

// --- Styled Components ---

const getAuroraGradient = (kpIndex) => {
    // {console.log(kpIndex)}
    if (kpIndex >= 6) {
        //    {console.log("Rendering AuroraEffect", 'high')}
        return AURORA_COLORS.HIGH;
    } else if (kpIndex >= 3) {
        //    {console.log("Rendering AuroraEffect", 'medium')}
        return AURORA_COLORS.MEDIUM;
    } else {
        //    {console.log("Rendering AuroraEffect", 'low')}
        return AURORA_COLORS.LOW;
    }
}
const AuroraContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1; 
    /*  aurora background changed by kp index*/
    background: ${props => getAuroraGradient(props.$kpIndex)};
    background-size: 400% 400%; /* 允许动画大幅度移动背景 */
    

    animation: ${gradientFlow} 15s ease infinite;
`;

// --- 组件逻辑 (移除 Blobs) ---

const AuroraEffect = ({ children, kpIndex}) => {
    // console.log("AuroraEffect rendered with kpIndex:", kpIndex);
    return (
        <AuroraContainer kpIndex={kpIndex}>
            
            {/* render（HomeScreenUI, LockScreenUI 等） */}
            {children}
        </AuroraContainer>
    );
};

export default AuroraEffect;