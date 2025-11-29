import React from 'react';
import styled, { css } from 'styled-components';

// 定义设备尺寸和样式配置
const DeviceConfigs = {
    // 手机 (iPhone 13/14 Pro base)
    phone: {
        width: 375, height: 812, 
        // 关键修改: 增加 baseWidthVw, 减少 maxWidthPx
        baseWidthVw: 95, // <-- 增加到 95vw，尽可能宽
        maxWidthPx: 450, // <-- 允许手机 Mockup 稍微宽一点点，以适应桌面端大屏幕
        bezelVmin: 2, cornerVmin: 6, screenCornerVmin: 5,
        notchHeight: '3vmin',
        notchWidth: '30%'
    },
    // 平板 (iPad Mini base - 更宽)
    tablet: {
        width: 768, height: 1024, 
        baseWidthVw: 70, maxWidthPx: 800, 
        bezelVmin: 2, cornerVmin: 4, screenCornerVmin: 3,
        notchHeight: '0', 
        notchWidth: '0'
    },
    // 手表 (Apple Watch base - 正方形)
    smartwatch: {
        width: 448, height: 448, 
        baseWidthVw: 40, // <-- 适当增加手表尺寸
        maxWidthPx: 350, // <-- 适当增加手表尺寸
        bezelVmin: 5, cornerVmin: 50, screenCornerVmin: 40,
        notchHeight: '0', 
        notchWidth: '0'
    }
};

// --- Styled Components for the Mockup ---

const DeviceFrame = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 50;
    transition: width 0.5s ease, height 0.5s ease, border-radius 0.5s ease, transform 0.5s ease; 

    ${({ $config }) => {
        const ASPECT_RATIO = $config.height / $config.width;
        
        return css`
            /* 1. 基础尺寸：使用 VW 优先，并限制最大 PX */
            width: ${$config.baseWidthVw}vw;
            max-width: ${$config.maxWidthPx}px;
            
            /* 高度根据宽度和宽高比计算 */
            height: calc(${($config.baseWidthVw / 100).toFixed(2)} * 100vw * ${ASPECT_RATIO}); 
            max-height: calc(${$config.maxWidthPx}px * ${ASPECT_RATIO});

            /* 2. 垂直空间不足时的缩放调整 */
            @media (max-height: 850px) {
                /* 如果高度过高，导致 Mockup 无法完全显示，则进行整体缩放 */
                /* 计算一个缩放因子，使 Mockup 的高度不超过 90vh */
                /* 关键调整：确保缩放是基于整个 Mockup 的，而不是只改变 max-height */
                ${'' /* let scaleFactor = Math.min(1, (90vh - 40px) / (config.height * ($config.baseWidthVw / 100))); */}
                
                transform: translate(-50%, -50%) scale(
                    clamp(0.5, (90vh - 40px) / (${($config.height / $config.width).toFixed(2)} * ${$config.maxWidthPx || $config.width}px), 1)
                );
            }
             /* 关键修复：当视口宽度小于 Mockup 的 max-widthPx 时，确保高度也按比例缩放 */
             @media (max-width: ${$config.maxWidthPx + 50}px) { // 稍微比 maxWidthPx 大一点，给边框留白
                height: calc(100vw * ${ASPECT_RATIO} - 2em); // 100vw 减去左右 padding
            }
        `;
    }}

    /* The outer shell of the phone */
    .phone-shell {
        position: relative;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, #7a00ff, #da00ff); 
        
        /* 使用配置的 Vmin 单位 */
        border: ${props => props.$config.bezelVmin}vmin solid #5a00bf;
        border-radius: ${props => props.$config.cornerVmin}vmin; 
        box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.5), 
            inset 0 0 10px rgba(255, 255, 255, 0.1); 
        transition: border-radius 0.5s ease, border 0.5s ease;
    }

    /* The actual screen area where content goes */
    .screen {
        width: 100%;
        height: 100%;
        border-radius: ${props => props.$config.screenCornerVmin}vmin; 
        overflow: hidden; 
        position: absolute;
        top: 0;
        left: 0;
        transition: border-radius 0.5s ease;
    }
    background: transparent !important;

    /* Speaker/Camera Notch */
    .notch {
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%);
        width: ${props => props.$config.notchWidth};
        height: ${props => props.$config.notchHeight};
        background: #3a007f;
        border-radius: 0 0 3vmin 3vmin;
        z-index: 100;
        transition: width 0.5s ease, height 0.5s ease;
    }
    z-index: 10;
`;

const MobileMockup = ({ children, deviceType }) => {
    // 根据 deviceType 获取配置，如果找不到则默认为 phone
    const config = DeviceConfigs[deviceType] || DeviceConfigs.phone;

    return (
        <DeviceFrame $config={config}>
            <div className="phone-shell">
                <div className="notch"></div> 
                <div className="screen">
                    {children}
                </div>
            </div>
        </DeviceFrame>
    );
};

export default MobileMockup;