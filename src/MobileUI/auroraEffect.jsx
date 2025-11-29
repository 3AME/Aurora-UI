import React from 'react';
import styled, { keyframes } from 'styled-components';

// --- 动画定义 (与全局背景的流动动画保持一致) ---
const gradientFlow = keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

// --- Styled Components ---

const AuroraContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1; 

    /* 关键：使用全局极光渐变样式 */
    background: linear-gradient(-45deg, #7a00ff, #da00ff, #00ccff, #ff66b2); /* 设定极光四色渐变 */
    background-size: 400% 400%; /* 允许动画大幅度移动背景 */
    
    /* 关键：应用流动动画 */
    animation: ${gradientFlow} 15s ease infinite;
`;

// --- 组件逻辑 (移除 Blobs) ---

const AuroraEffect = ({ children }) => {
    return (
        <AuroraContainer>
            {/* 渲染所有子组件（HomeScreenUI, LockScreenUI 等） */}
            {children}
        </AuroraContainer>
    );
};

export default AuroraEffect;