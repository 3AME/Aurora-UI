import React from 'react';
import styled from 'styled-components';

// --- Styled Components ---

const CallWrapper = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    
    /* 关键 1: 确保它位于所有其他 UI 之上（HomeScreenUI 是 90） */
    z-index: 500; 
    
    background: transparent; 
    color: white;
    font-size: 18px; 
    
    @media (max-width: 400px) {
        font-size: 4.5vw;
    }
    
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    padding-top: 5em;
    padding-bottom: 5em;
    
    position: relative;
    /* 关键 2: 确保所有内容位于视频和覆盖层之上 */
    z-index: 10;
    
    /* 关键 3: 黑色不透明伪元素，用于完全遮挡 HomeScreenUI */
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        
        /* 使用完全不透明的黑色来遮挡下层（如 AuroraEffect 和 HomeScreenUI）*/
        background: black; 
        opacity: 1; /* 完全不透明 */
        
        z-index: 1; /* 位于视频之下，内容之上 */
    }
    
    & > * {
        z-index: 12;
    }
`;

const VideoBackground = styled.video`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; /* 确保视频铺满整个屏幕 */
    
    /* 关键 4: 视频 Z-Index 位于内容之下，但位于黑色衬底之上 */
    z-index: 2; 
    
    /* 关键 5: 添加一个半透明黑色叠层，提高文字可读性 */
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.3); 
        z-index: 3;
    }
`;

const ContactPhoto = styled.div`
    width: 5em;
    height: 5em;
    border-radius: 50%;
    background: linear-gradient(45deg, #7a00ff, #da00ff, #00ccff, #ff66b2);;
    background-size: 200% 200%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2em;
    margin-bottom: 0.5em;
    border: 3px solid rgba(255, 255, 255, 0.7);
    z-index: 11;
    box-shadow: 0 0 20px rgba(122, 0, 255, 0.8), 
                0 0 30px rgba(218, 0, 255, 0.6), 
                0 0 40px rgba(0, 204, 255, 0.4);
    color: rgba(255, 255, 255, 0.9);
`;

const ContactName = styled.h1`
    font-size: 2em;
    font-weight: 600;
    margin: 0;
    z-index: 11;
    text-shadow: 0 2px 5px rgba(0, 0, 0, 1);
`;

const PhoneNumberText = styled.p`
    font-size: 1.2em; 
    color: rgba(255, 255, 255, 1);
    margin: 0.5em 0 0.2em;
    z-index: 11;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
    font-weight: 500;
`;

const StatusText = styled.p`
    font-size: 3em;
    color: rgba(255, 255, 255, 0.8);
    margin: 0.2em 0 0.5em;
    z-index: 11;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
`;

const ActionsContainer = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    padding: 0 1em;
    z-index: 11;
`;

const CallButton = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    
    .icon {
        width: 3.5em;
        height: 3.5em;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        margin-bottom: 0.5em;
        transition: transform 0.2s;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        color: white;
        
        &:active {
            transform: scale(0.95);
        }
    }
    
    .accept {
        background: linear-gradient(45deg, #00ffaa, #00ccff);
        box-shadow: 0 0 15px #00ffaa;
    }
    
    .decline {
        background: linear-gradient(45deg, #ff66b2, #da00ff); 
        box-shadow: 0 0 15px #ff66b2;
    }
    
    .label {
        font-size: 0.7em;
        font-weight: 500;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 1);
        z-index:12;
    }
`;

// --- Component Logic ---

const IncomingCallUI = ({ onAccept, onDecline, contactName, phoneNumber }) => {
    
    // 假设您的视频位于 public/aurora_video.mp4
    // const videoSrc = '/aurora_video.mp4'; 
    
    return (
        <CallWrapper>
            {/* 1. 视频背景元素 */}
            <VideoBackground 
                // src="/Aurora-UI/aurora_video.mp4"   //for deployment version
                src="/aurora_video.mp4"  // for development version
                autoPlay 
                loop 
                muted // 视频作为背景时通常需要静音
                playsInline 
            />
            
            {/* 2. 来电显示内容 */}
            <div>
                <StatusText>Incoming Call</StatusText>
                <ContactPhoto>👤</ContactPhoto>
                <ContactName>{contactName || "Unknown Caller"}</ContactName>
                {phoneNumber && <PhoneNumberText>{phoneNumber}</PhoneNumberText>}
            </div>
            
            {/* 3. 操作按钮 */}
            <ActionsContainer>
                <CallButton onClick={onDecline}>
                    <div className="icon decline">
                        <img 
                            src="https://img.icons8.com/?size=100&id=CNS2xX2b_Fe1&format=png&color=FFFFFF" 
                            alt="Decline Call" 
                            style={{ width: '1.5em', height: '1.5em' }} 
                        />
                        {/* 📞 */}
                        </div>
                    {/* <div className="label">Decline</div> */}
                </CallButton>
                
                <CallButton onClick={onAccept}>
                    <div className="icon accept">
                        <img 
                            src="https://img.icons8.com/?size=100&id=9659&format=png&color=FFFFFF" 
                            alt="Accept Call" 
                            style={{ width: '1.5em', height: '1.5em', transform: 'scaleX(-1)' }} // 水平翻转图标，使其看起来更像接听
                        />
                        {/* 📞 */}
                        </div>
                    {/* <div className="label">Accept</div> */}
                </CallButton>
            </ActionsContainer>
            
        </CallWrapper>
    );
};

export default IncomingCallUI;