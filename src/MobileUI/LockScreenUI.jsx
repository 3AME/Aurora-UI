import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';

// --- Keyframes for Swipe Indicator Animation ---
const breathing = keyframes`
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.4; }
`;

const swipeUpGuide = keyframes`
    0% { transform: translateY(0); opacity: 0; }
    30% { opacity: 1; }
    70% { transform: translateY(-1em); opacity: 0; }
    100% { transform: translateY(0); opacity: 0; }
`;


// --- Styled Components ---

const LockScreenWrapper = styled.div`
    // ... (所有 LockScreenWrapper 样式保持不变) ...
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 100; 
    color: white;
    font-family: 'Helvetica Neue', sans-serif;
    background: rgba(0, 0, 0, 0.2); 
    backdrop-filter: blur(5px);
    
    color: white;
    text-shadow: 0 1px 2px rgba(0,0,0,0.6);
    user-select: none;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: 2em 0;

    font-size: 18px; 
    @media (max-width: 400px) {
        font-size: 4.5vw;
    }
    
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
    opacity: ${props => props.$isUnlocking ? 0 : 1};
    transform: ${props => props.$isUnlocking ? 'translateY(-100%)' : 'translateY(0)'}; 
    pointer-events: ${props => props.$isUnlocking ? 'none' : 'auto'}; 
    
    cursor: ${props => props.$isUnlocking ? 'default' : 'grab'};
`;

const TimeDisplay = styled.div`
    // ... (TimeDisplay 样式保持不变) ...
    position: absolute;
    top: 15%; 
    width: 100%;
    text-align: center;
    
    .time {
        font-size: 4.5em; 
        font-weight: 200; 
        letter-spacing: -0.02em; 
        text-shadow: 0 0.1em 0.2em rgba(0, 0, 0, 0.5); 
    }
    
    .date {
        font-size: 1em; 
        font-weight: 300;
        margin-top: -0.5em;
    }
`;

const SwipeUpContainer = styled.div`
    position: absolute;
    bottom: 3em; 
    width: 100%;
    text-align: center;
    user-select: none;
    
    /* 调整 padding 和 flex 布局，以确保圆圈和文本居中且垂直堆叠 */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5em;
`;

// 新增圆圈样式
const UnlockHandle = styled.div`
    width: 3em; /* 尺寸使用 em */
    height: 3em;
    background: rgba(255, 255, 255, 0.2); 
    border-radius: 50%;
    backdrop-filter: blur(0.5em);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    color: white;
    cursor: grab;
    user-select: none; 
    transition: background 0.2s;
    
    /* 添加引导动画 */
    ${({ $isAnimating }) => $isAnimating && css`
        animation: 
            ${breathing} 3s ease-in-out infinite,
            ${swipeUpGuide} 2s ease-out infinite 0.5s; 
    `}

    &:hover {
        background: rgba(255, 255, 255, 0.3);
    }
`;

const SwipeText = styled.div`
    font-size: 0.7em;
    font-weight: 300;
    letter-spacing: 0.1em;
    opacity: 0.8; /* 始终保持可见 */
    
    /* 移除 SwipeText 上的引导动画，只保留圆圈上的动画 */
    animation: ${breathing} 3s ease-in-out infinite;
`;

const SwipeIndicatorBar = styled.div`
    /* 移除指示条，因为我们用圆圈代替了它的视觉功能 */
    display: none; 
`;

// --- Component Logic (交互逻辑保持不变，因为整个屏幕都是滑动区域) ---

const LockScreenUI = ({ onUnlock }) => {
    // ... (所有 State 和 useEffect for Time 的逻辑保持不变) ...
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isUnlocking, setIsUnlocking] = useState(false); 
    
    const startY = useRef(0); 
    const isInteracting = useRef(false); 
    const wrapperRef = useRef(null);
    // ... (Time Update Logic) ...

    const executeUnlock = () => {
        if (isUnlocking) return;
        setIsUnlocking(true); 
        setTimeout(() => { onUnlock(); }, 500);
    };

    const handleStart = (clientY) => {
        if (isUnlocking) return;
        startY.current = clientY;
        isInteracting.current = true;
    };

    const handleEnd = (clientY) => {
        if (!isInteracting.current || isUnlocking) return;

        const deltaY = startY.current - clientY; 
        const unlockThreshold = 80; 

        if (deltaY > unlockThreshold) {
            executeUnlock();
        }
        isInteracting.current = false;
    };

    const handleTouchStart = (e) => {
        handleStart(e.touches[0].clientY);
        e.preventDefault(); 
    };

    const handleTouchEnd = (e) => {
        handleEnd(e.changedTouches[0].clientY);
        e.preventDefault(); 
    };

    const handleMouseDown = (e) => { handleStart(e.clientY); };
    const handleMouseUp = (e) => { handleEnd(e.clientY); };
    const handleMouseMove = (e) => { 
        // 可以用于实现拖拽的视觉反馈 
    };

    useEffect(() => {
        const element = wrapperRef.current;
        if (element) {
            element.addEventListener('touchstart', handleTouchStart, { passive: false });
            element.addEventListener('touchend', handleTouchEnd, { passive: false });
            element.addEventListener('mousedown', handleMouseDown);
        }

        window.addEventListener('mouseup', handleMouseUp);
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            if (element) {
                element.removeEventListener('touchstart', handleTouchStart);
                element.removeEventListener('touchend', handleTouchEnd);
                element.removeEventListener('mousedown', handleMouseDown);
            }
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isUnlocking]);

    // --- Render Logic ---

    const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const dateString = currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <LockScreenWrapper ref={wrapperRef} $isUnlocking={isUnlocking}>
            <TimeDisplay>
                <div className="time">{timeString}</div>
                <div className="date">{dateString}</div>
            </TimeDisplay>
            
            <SwipeUpContainer>
                {/* 底部解锁圆圈，作为主要视觉指示器 */}
                <UnlockHandle $isAnimating={!isUnlocking}>
                    ↑
                </UnlockHandle>
                <SwipeText>
                    scroll up to unlock
                </SwipeText>
                
                <SwipeIndicatorBar /> {/* 隐藏，但保留样式定义以防万一 */}
            </SwipeUpContainer>
            
        </LockScreenWrapper>
    );
};

export default LockScreenUI;