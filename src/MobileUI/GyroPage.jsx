// src/pages/GyroPage.jsx - 完整且未拆分的版本
import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';

// ------------------------------------
// --- 0. WebGL SHADER SOURCES (已修复且功能正常的 Simplex Noise 极光) ---
// ------------------------------------

const VS_SOURCE = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`; 

const FS_SOURCE = `
    // 强制声明使用 GLSL ES 1.00 (WebGL 1.0)
    #version 100
    precision highp float;
    
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_tilt; 
    
    // --- 经过验证的 3D Simplex Noise (snoise) 实现 ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289((x * 34.0 + 1.0) * x); }
    
    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; 
        vec3 x3 = x0 - D.yyy;

        i = mod289(i); 
        vec4 p = permute( permute( permute( 
                 i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
               + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
               
        float n_ = 0.142857142857;
        
        vec4 px = p * n_;
        vec4 py = px * n_;
        
        vec4 Gx = 2.0 * fract(px) - 1.0;
        vec4 Gy = 2.0 * fract(py) - 1.0;
        vec4 Gz = 1.0 - abs(Gx) - abs(Gy);

        vec4 norm = 1.0 / sqrt(Gx * Gx + Gy * Gy + Gz * Gz);
        Gx *= norm;
        Gy *= norm;
        Gz *= norm;
        
        vec4 m0 = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m0 = m0 * m0;
        m0 = m0 * m0;

        vec3 g0 = vec3(Gx.x, Gy.x, Gz.x);
        vec3 g1 = vec3(Gx.y, Gy.y, Gz.y);
        vec3 g2 = vec3(Gx.z, Gy.z, Gz.z);
        vec3 g3 = vec3(Gx.w, Gy.w, Gz.w);
        
        vec4 dot_val = vec4(dot(x0, g0), dot(x1, g1), dot(x2, g2), dot(x3, g3));

        return 32.0 * dot(m0 * dot_val, vec4(1.0));
    }
    
    // --- 极光主逻辑 ---
    float getAurora(vec3 pos, float time, vec2 tilt) {
        float noise = 0.0;
        float strength = 0.0;
        
        for (int i = 0; i < 4; i++) {
            float scale = pow(2.0, float(i));
            
            vec3 p = pos * scale * 0.0003 + vec3(0.0, 0.0, time * 0.05 * scale);
            
            p.x += tilt.x * 0.01;
            p.y += tilt.y * 0.01;
            
            float n = snoise(p) * 0.5 + 0.5;
            
            float band = smoothstep(0.35, 0.65, abs(n)); 
            
            noise += band * (1.0 / scale); 
            strength += band * 0.2;
        }
        
        return strength * noise * 0.5;
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 center = uv - 0.5;
        
        vec3 pos = vec3(center.x * 2.0, center.y * 2.0, 1.0);
        
        float aurora = getAurora(pos, u_time, u_tilt);
        
        vec3 colorA = vec3(0.1, 0.8, 0.4); 
        vec3 colorB = vec3(0.2, 0.4, 0.8); 
        
        vec3 finalColor = mix(colorB, colorA, smoothstep(0.0, 1.0, aurora * 1.5));
        
        finalColor *= aurora * 10.0;
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// ------------------------------------
// --- 1. 样式组件 (包含所有 UI 和 Canvas) ---
// ------------------------------------

const PageWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #020203; 
    overflow: hidden;
    touch-action: none;
`;

const CanvasWrapper = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    /* 明确 z-index，确保 Canvas 层级正确 */
    #bgCanvas { z-index: 1; }
    #glCanvas { 
        z-index: 2; 
        mix-blend-mode: screen; 
        opacity: 0.8;
    }
    #terrainCanvas { z-index: 3; }
`;

const UILayer = styled.div`
    position: absolute;
    z-index: 10; /* UI 层级最高 */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    padding: 20px;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: auto; /* 确保按钮可点击 */
    margin-right: 10em;
    margin-left: 10em;
`;

const IconBtn = styled.button`
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    ${({ $active }) => $active && css`
        background: rgba(100, 255, 218, 0.2);
        border-color: #64ffda;
        color: #64ffda;
        box-shadow: 0 0 15px rgba(100, 255, 218, 0.3);
    `}
`;

const ControlsPanel = styled.div`
    position: absolute;
    top: 70px;
    right: 20px;
    background: rgba(5, 10, 15, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 12px;
    pointer-events: auto;
    min-width: 200px;
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 20;
    margin-right:2em;
`;

const ControlLabel = styled.span`
    font-size: 0.7rem;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 8px;
    display: block;
    letter-spacing: 1px;
`;

const ModeBtn = styled.button`
    display: block;
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ccc;
    padding: 10px 15px;
    margin-bottom: 5px;
    border-radius: 6px;
    cursor: pointer;
    text-align: left;
    font-size: 0.85rem;
    transition: all 0.2s;
    &:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    ${({ $active }) => $active && `
        background: rgba(100, 255, 218, 0.15);
        border-color: rgba(100, 255, 218, 0.5);
        color: #64ffda;
    `}
`;


// ------------------------------------
// --- 2. GyroPage 组件 (渲染 + UI 逻辑) ---
// ------------------------------------

const GyroPage = () => {
    const navigate = useNavigate();
    
    // --- Refs and State ---
    const bgCanvasRef = useRef(null);
    const glCanvasRef = useRef(null);
    const terrainCanvasRef = useRef(null);
    
    const [inputMode, setInputMode] = useState('gyro');
    const [isPanelVisible, setIsPanelVisible] = useState(false);
    const [isInputLocked, setIsInputLocked] = useState(false);
    const [isGyroPermissionGranted, setIsGyroPermissionGranted] = useState(false);

    const state = useRef({
        width: window.innerWidth, 
        height: window.innerHeight,
        tilt: { x: 0, y: 0 }, 
        targetTilt: { x: 0, y: 0 },
        time: 0, 
    });
    
    const context = useRef({
        gl: null, 
        program: null, 
        ctxBg: null, 
        ctxTerrain: null,
        stars: [],
        u_time_loc: null, 
        u_resolution_loc: null,
        u_tilt_loc: null,
        animationFrameId: null,
    });

    // ------------------------------------
    // --- 3. 核心逻辑函数 (Canvas/WebGL) ---
    // ------------------------------------

    // A. WebGL 初始化 (Shader 编译和缓冲区设置)
    const initWebGL = useCallback(() => {
        const gl = glCanvasRef.current.getContext('webgl', { alpha: true });
        if (!gl) return;
        
        const createShader = (type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vertexShader = createShader(gl.VERTEX_SHADER, VS_SOURCE);
        const fragmentShader = createShader(gl.FRAGMENT_SHADER, FS_SOURCE);
        if (!vertexShader || !fragmentShader) return;

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking error:', gl.getProgramInfoLog(program));
            gl.deleteProgram(program);
            return;
        }

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
             1.0, -1.0,
             1.0,  1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const a_position_loc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(a_position_loc);
        gl.vertexAttribPointer(a_position_loc, 2, gl.FLOAT, false, 0, 0);

        context.current.gl = gl;
        context.current.program = program;
        context.current.u_time_loc = gl.getUniformLocation(program, 'u_time');
        context.current.u_resolution_loc = gl.getUniformLocation(program, 'u_resolution');
        context.current.u_tilt_loc = gl.getUniformLocation(program, 'u_tilt');
    }, []);

    // B. WebGL 渲染
    const renderWebGL = useCallback(() => {
        const st = state.current;
        const ctx = context.current;
        const gl = ctx.gl;

        if (!gl || !ctx.program) return;
        
        gl.clearColor(0.0, 0.0, 0.0, 0.0); 
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.viewport(0, 0, st.width, st.height);
        
        gl.useProgram(ctx.program);
        if (ctx.u_time_loc) gl.uniform1f(ctx.u_time_loc, st.time);
        if (ctx.u_resolution_loc) gl.uniform2f(ctx.u_resolution_loc, st.width, st.height);
        if (ctx.u_tilt_loc) gl.uniform2f(ctx.u_tilt_loc, st.tilt.x, st.tilt.y);

        gl.drawArrays(gl.TRIANGLES, 0, 6);

    }, []);

    // C. Canvas 渲染 (背景和粒子)
    const renderBackground = useCallback(() => {
        const st = state.current;
        const ctx = context.current;
        if (!ctx.ctxBg) return;

        const c = ctx.ctxBg;
        
        // 1. 清除并绘制渐变背景 
        c.clearRect(0, 0, st.width, st.height);
        const gradient = c.createLinearGradient(0, 0, 0, st.height);
        gradient.addColorStop(0, '#020203'); 
        gradient.addColorStop(0.5, '#0a0a20'); 
        gradient.addColorStop(1, '#151530'); 
        c.fillStyle = gradient;
        c.fillRect(0, 0, st.width, st.height);

        // 2. 绘制顶部下落的粒子/流星
        c.fillStyle = 'rgba(100, 255, 218, 0.6)'; 
        if (ctx.stars.length < 100 && Math.random() < 0.2) { 
            ctx.stars.push({
                x: Math.random() * st.width,
                y: Math.random() * st.height * 0.5,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.5
            });
        }

        for (let i = 0; i < ctx.stars.length; i++) {
            const star = ctx.stars[i];
            star.y += star.speed;
            star.opacity -= 0.005;

            if (star.y > st.height * 0.8 || star.opacity <= 0) { 
                ctx.stars.splice(i, 1);
                i--;
                continue;
            }
            c.save();
            c.globalAlpha = star.opacity;
            c.beginPath();
            c.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }

    }, []);

    // D. Canvas 渲染 (波动线条 - 包含完整的波纹绘制逻辑)
    const renderTerrain = useCallback(() => {
        const st = state.current;
        const ctx = context.current;
        const canvas = terrainCanvasRef.current;
        if (!ctx.ctxTerrain || !canvas) return;

        const c = ctx.ctxTerrain;
        c.globalCompositeOperation = 'lighter'; 
        c.clearRect(0, 0, st.width, st.height);

        const waveHeight = st.height * 0.15; 
        const waveBaseY = st.height * 0.75; 
        const waveSpeed = 0.02; 
        // 振幅和频率受倾斜度控制，产生交互效果
        const amplitudeFactor = (st.tilt.x + 1) * 0.5 + 0.5; // 0.5 to 1.5
        const frequencyFactor = st.tilt.y * 0.2 + 1.0; // 0.8 to 1.2

        const drawWave = (color, amplitude, phaseShift) => {
            c.beginPath();
            c.moveTo(0, waveBaseY);
            
            // 额外的随机噪声，使波纹更自然
            const noise = (x) => Math.sin(x * 0.005) * 5 + Math.cos(x * 0.01) * 3;

            for (let x = 0; x <= st.width; x += 15) {
                const y = waveBaseY 
                    + Math.sin(x * frequencyFactor * 0.01 + st.time * waveSpeed + phaseShift) 
                    * amplitude * amplitudeFactor
                    + noise(x) * 0.5;
                c.lineTo(x, y);
            }
            c.lineTo(st.width, waveBaseY); 
            
            c.strokeStyle = color;
            c.lineWidth = 2;
            c.stroke();
        };

        // 绘制多层波纹以产生深度感和混合效果
        drawWave('rgba(100, 255, 218, 0.9)', waveHeight * 0.8, 0);       
        drawWave('rgba(179, 100, 255, 0.7)', waveHeight * 0.7, 0.5);     
        drawWave('rgba(100, 205, 255, 0.5)', waveHeight * 0.9, 1.0);     
        drawWave('rgba(255, 100, 227, 0.4)', waveHeight * 0.6, 1.5);     
        
        c.globalCompositeOperation = 'source-over'; 
    }, []);

    // E. Resize 处理 
    const handleResize = useCallback(() => {
        const st = state.current;
        const gl = context.current.gl;
        st.width = window.innerWidth;
        st.height = window.innerHeight;

        [bgCanvasRef.current, glCanvasRef.current, terrainCanvasRef.current].forEach(canvas => {
            if (canvas) {
                canvas.width = st.width;
                canvas.height = st.height;
            }
        });

        if (gl) gl.viewport(0, 0, st.width, st.height);
    }, []);

    // F. 交互 handlers (陀螺仪和鼠标)
    const handleGyro = useCallback((e) => {
        if (isInputLocked || inputMode !== 'gyro') return; 
        const st = state.current;
        // 映射陀螺仪值到 -1.0 到 1.0
        st.targetTilt.x = Math.max(-1, Math.min(1, (e.gamma || 0) / 45));
        st.targetTilt.y = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 45));
    }, [inputMode, isInputLocked]);

    const handleMouse = useCallback((e) => {
        if (isInputLocked || inputMode !== 'mouse') return;
        const st = state.current;
        // 映射鼠标位置到 -1.0 到 1.0
        st.targetTilt.x = (e.clientX / st.width - 0.5) * 2;
        st.targetTilt.y = -(e.clientY / st.height - 0.5) * 2; 
    }, [inputMode, isInputLocked]);

    // G. 模式切换和权限请求逻辑
    const setMode = useCallback(async (mode) => {
        if (mode === 'gyro' && !isGyroPermissionGranted && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    setIsGyroPermissionGranted(true);
                    setInputMode('gyro');
                } else {
                    alert("Gyroscope permission denied. Falling back to mouse mode.");
                    setInputMode('mouse'); 
                }
            } catch (error) {
                console.error("Error requesting gyroscope permission:", error);
                setInputMode('mouse');
            }
        } else {
            setInputMode(mode);
        }
    }, [isGyroPermissionGranted]);

    // H. 动画循环
    const loop = useCallback(() => {
        const st = state.current;
        const ctx = context.current;
        
        st.time += 1/60; 
        // 缓动 tilt 
        st.tilt.x += (st.targetTilt.x - st.tilt.x) * 0.1;
        st.tilt.y += (st.targetTilt.y - st.tilt.y) * 0.1;

        renderBackground(); 
        renderWebGL();
        renderTerrain();
        
        ctx.animationFrameId = requestAnimationFrame(loop);
    }, [renderWebGL, renderBackground, renderTerrain]);

    // I. 初始化
    const init = useCallback(() => {
        handleResize();
        initWebGL(); 
        
        const ctx = context.current;
        if (bgCanvasRef.current) ctx.ctxBg = bgCanvasRef.current.getContext('2d');
        if (terrainCanvasRef.current) ctx.ctxTerrain = terrainCanvasRef.current.getContext('2d');
        
        context.current.animationFrameId = requestAnimationFrame(loop);
    }, [loop, handleResize, initWebGL]);


    // J. useEffect (生命周期管理)
    useEffect(() => {
        // 监听事件
        window.addEventListener('resize', handleResize);
        window.addEventListener('deviceorientation', handleGyro);
        window.addEventListener('mousemove', handleMouse);
        
        // 启动渲染
        init();

        // 清理函数
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('deviceorientation', handleGyro);
            window.removeEventListener('mousemove', handleMouse);
            if (context.current.animationFrameId) {
                cancelAnimationFrame(context.current.animationFrameId);
            }
        };
    }, [handleResize, handleGyro, handleMouse, init]); 


    // K. React 渲染部分 (包含 Canvas 和 UI)
    return (
        <PageWrapper>
            {/* Canvas 渲染层 */}
            <CanvasWrapper>
                <canvas ref={bgCanvasRef} id="bgCanvas"></canvas>
                <canvas ref={glCanvasRef} id="glCanvas"></canvas>
                <canvas ref={terrainCanvasRef} id="terrainCanvas"></canvas>
            </CanvasWrapper>
            
            {/* UI 交互层 */}
            <UILayer>
                <TopBar>
                    {/* 返回按钮 */}
                    <IconBtn onClick={() => navigate('/')} title="Go Back">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </IconBtn>

                    {/* 右侧按钮组 */}
                    <div style={{ display: 'flex' }}>
                        {/* 锁定输入按钮 */}
                        {/* <IconBtn 
                            onClick={() => setIsInputLocked(prev => !prev)} 
                            $active={isInputLocked}
                            title={isInputLocked ? "Unlock Input" : "Lock Input"}
                            style={{ marginRight: '10px' }}
                        >
                            {isInputLocked ? (
                                // 解锁图标
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                            ) : (
                                // 锁定图标
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            )}
                        </IconBtn> */}

                        {/* 设置按钮 */}
                        <IconBtn 
                            onClick={() => setIsPanelVisible(prev => !prev)} 
                            $active={isPanelVisible}
                            title="Settings"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        </IconBtn>
                    </div>
                </TopBar>
                
                {/* 设置面板 */}
                {isPanelVisible && (
                    <ControlsPanel>
                        <ControlLabel>Input Source</ControlLabel>
                        <ModeBtn onClick={() => setMode('gyro')} $active={inputMode === 'gyro'}>
                            Gyroscope
                        </ModeBtn>
                        <ModeBtn onClick={() => setMode('mouse')} $active={inputMode === 'mouse'}>
                            Mouse / Touch
                        </ModeBtn>
                    </ControlsPanel>
                )}
            </UILayer>
        </PageWrapper>
    );
};

export default GyroPage;