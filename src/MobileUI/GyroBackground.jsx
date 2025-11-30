// src/components/GyroBackground.js
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

// 复制您原始 HTML 文件中的所有 CSS
const BackgroundWrapper = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1; /* 保持在其他内容之下 */
    background: #020203; /* viewport背景色 */
    overflow: hidden;
    touch-action: none;

    /* Canvas Layers */
    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    #bgCanvas { z-index: 1; }
    #glCanvas { 
        z-index: 2; 
        mix-blend-mode: screen; /* GPU Aurora */
        opacity: 0.8;
    }
    #terrainCanvas { z-index: 3; }
`;

// 复制您的 WebGL 着色器代码
const VS_SOURCE = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const FS_SOURCE = `
    precision mediump float;
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uTilt;
    uniform float uColorShift;
    uniform float uAudio;

    // Noise function (snoise) - 复制您代码中的全部 snoise 函数
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1;
        i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / uResolution.xy;
        
        // Tilt Parallax
        vec2 tiltOffset = uTilt * 0.2;
        uv += tiltOffset;

        // Aurora Coordinate System
        float speed = uTime * 0.2;
        float scale = 3.0;
        
        // Volumetric Layers
        vec3 color = vec3(0.0);
        
        for(float i=1.0; i<=3.0; i++) {
            float z = i;
            float noiseInput = uv.x * scale + speed * (0.5/z) + snoise(vec2(uv.x * 0.5, speed * 0.1));
            float wave = snoise(vec2(noiseInput, uv.y * 0.5 + uTime * 0.05));
            
            // Height fade (Curtain shape)
            float curtain = 1.0 - smoothstep(0.0, 0.4, abs(uv.y - 0.5 + wave * 0.2 + (uTilt.y * 0.1)));
            
            // Color ramp
            vec3 baseC = vec3(0.0, 1.0, 0.6); // Teal/Green
            vec3 shiftC = vec3(0.6, 0.0, 1.0); // Purple/Pink
            
            // Reactivity
            float audioBoost = uAudio * 2.0;
            float colorMix = uColorShift + (uv.y * 0.5) + (wave * 0.3) + audioBoost;
            
            vec3 layerColor = mix(baseC, shiftC, clamp(colorMix, 0.0, 1.0));
            
            // Accumulate
            color += layerColor * curtain * (0.3 / z) * (1.0 + audioBoost);
        }

        // Alpha Blend
        gl_FragColor = vec4(color, 1.0);
    }
`;


const GyroBackground = ({ inputMode = 'gyro' }) => {
    // 使用Refs来获取Canvas DOM元素
    const bgCanvasRef = useRef(null);
    const glCanvasRef = useRef(null);
    const terrainCanvasRef = useRef(null);
    const animationFrameRef = useRef(null);
    
    // 状态和常量（从原代码中提取）
    const state = useRef({
        width: 0, height: 0,
        tilt: { x: 0, y: 0 }, targetTilt: { x: 0, y: 0 },
        inputMode: inputMode, // 初始输入模式
        time: 0,
        colorShift: 0,
        colorShiftTarget: 0,
        audioLevel: 0,
        audioEnabled: false
    });

    const context = useRef({
        gl: null,
        program: null,
        ctxBg: null,
        ctxTerrain: null,
        stars: [],
        embers: [],
        terrainPoints: [],
        audioCtx: null,
        analyser: null,
        dataArray: null
    });


    // 将所有的 JS 逻辑封装在一个 useEffect 中
    useEffect(() => {
        const { current: ctx } = context;
        const { current: st } = state;
        
        // ------------------------------------
        // --- 核心 JS 逻辑函数 (从您的原代码复制) ---
        // ------------------------------------

        // --- INIT & RESIZE ---
        const resize = () => {
            st.width = window.innerWidth;
            st.height = window.innerHeight;
            [bgCanvasRef.current, glCanvasRef.current, terrainCanvasRef.current].forEach(c => {
                if (c) {
                    c.width = st.width;
                    c.height = st.height;
                }
            });
            if(ctx.gl) ctx.gl.viewport(0, 0, st.width, st.height);
            initTerrain();
            renderTerrain();
        }

        // --- WEBGL AURORA ---
        const initWebGL = () => {
            ctx.gl = glCanvasRef.current.getContext('webgl');
            if(!ctx.gl) return;

            const createShader = (type, source) => {
                const s = ctx.gl.createShader(type);
                ctx.gl.shaderSource(s, source);
                ctx.gl.compileShader(s);
                if (!ctx.gl.getShaderParameter(s, ctx.gl.COMPILE_STATUS)) {
                    console.error("Shader Error:", ctx.gl.getShaderInfoLog(s));
                    return null;
                }
                return s;
            };

            const vs = createShader(ctx.gl.VERTEX_SHADER, VS_SOURCE);
            const fs = createShader(ctx.gl.FRAGMENT_SHADER, FS_SOURCE);
            
            ctx.program = ctx.gl.createProgram();
            ctx.gl.attachShader(ctx.program, vs);
            ctx.gl.attachShader(ctx.program, fs);
            ctx.gl.linkProgram(ctx.program);
            ctx.gl.useProgram(ctx.program);

            // Fullscreen Triangle Strip
            const buffer = ctx.gl.createBuffer();
            ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, buffer);
            ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1
            ]), ctx.gl.STATIC_DRAW);

            const posLoc = ctx.gl.getAttribLocation(ctx.program, 'position');
            ctx.gl.enableVertexAttribArray(posLoc);
            ctx.gl.vertexAttribPointer(posLoc, 2, ctx.gl.FLOAT, false, 0, 0);
        }

        const renderWebGL = () => {
            if(!ctx.gl || !ctx.program) return;
            
            // Uniforms
            ctx.gl.uniform1f(ctx.gl.getUniformLocation(ctx.program, 'uTime'), st.time * 0.001);
            ctx.gl.uniform2f(ctx.gl.getUniformLocation(ctx.program, 'uResolution'), st.width, st.height);
            ctx.gl.uniform2f(ctx.gl.getUniformLocation(ctx.program, 'uTilt'), st.tilt.x, st.tilt.y);
            ctx.gl.uniform1f(ctx.gl.getUniformLocation(ctx.program, 'uColorShift'), st.colorShift);
            ctx.gl.uniform1f(ctx.gl.getUniformLocation(ctx.program, 'uAudio'), st.audioLevel);

            ctx.gl.drawArrays(ctx.gl.TRIANGLES, 0, 6);
        }

        // --- CANVAS 2D: STARS & PARTICLES ---
        const initStars = () => {
            ctx.stars = [];
            ctx.embers = [];
            for(let i=0; i<400; i++) {
                ctx.stars.push({
                    x: Math.random() * st.width, y: Math.random() * st.height,
                    size: Math.random() * 1.5, alpha: Math.random(), speed: Math.random() * 0.05
                });
            }
            for(let i=0; i<50; i++) {
                ctx.embers.push({
                    x: Math.random() * st.width, y: Math.random() * st.height,
                    size: Math.random() * 2 + 1,
                    vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2 - 0.1,
                    alpha: 0
                });
            }
        }

        const renderBackground = () => {
            if (!ctx.ctxBg) return;
            ctx.ctxBg.clearRect(0,0,st.width, st.height);
            
            const px = -st.tilt.x * 50;
            const py = -st.tilt.y * 50;

            // Stars
            ctx.ctxBg.fillStyle = "white";
            ctx.stars.forEach(s => {
                s.alpha += s.speed;
                if(s.alpha > 1 || s.alpha < 0) s.speed *= -1;
                
                let dx = (s.x + px * 0.5 + st.width) % st.width;
                let dy = (s.y + py * 0.5 + st.height) % st.height;

                ctx.ctxBg.globalAlpha = Math.abs(s.alpha) * 0.8;
                ctx.ctxBg.beginPath();
                ctx.ctxBg.arc(dx, dy, s.size, 0, Math.PI*2);
                ctx.ctxBg.fill();
            });

            // Embers
            ctx.ctxBg.fillStyle = "#64ffda";
            ctx.embers.forEach(e => {
                e.x += e.vx; e.y += e.vy;
                if(e.y < 0) e.y = st.height;
                if(e.x > st.width) e.x = 0;
                
                let dx = (e.x + px * 1.2 + st.width) % st.width;
                let dy = (e.y + py * 1.2 + st.height) % st.height;
                
                e.alpha = Math.min(1, Math.max(0, Math.sin(st.time * 0.001 + e.x) + 0.5));

                ctx.ctxBg.globalAlpha = e.alpha * 0.3;
                ctx.ctxBg.beginPath();
                ctx.ctxBg.arc(dx, dy, e.size, 0, Math.PI*2);
                ctx.ctxBg.fill();
            });
            ctx.ctxBg.globalAlpha = 1;
        }

        // --- CANVAS 2D: TERRAIN ---
        const initTerrain = () => {
            ctx.terrainPoints = [];
            let x = -200;
            let y = st.height * 0.8;
            while(x < st.width + 200) {
                ctx.terrainPoints.push({x, y});
                x += 30;
                y += (Math.random()-0.5) * 30;
                y = Math.min(Math.max(y, st.height*0.7), st.height*0.9);
            }
        }

        const renderTerrain = () => {
            if (!ctx.ctxTerrain) return;
            ctx.ctxTerrain.clearRect(0, 0, st.width, st.height);
            
            const px = -st.tilt.x * 100;
            const py = -st.tilt.y * 50;

            ctx.ctxTerrain.save();
            ctx.ctxTerrain.translate(px, py);
            
            ctx.ctxTerrain.beginPath();
            ctx.ctxTerrain.moveTo(-200, st.height);
            ctx.terrainPoints.forEach((p, i) => {
                if(i===0) ctx.ctxTerrain.lineTo(p.x, p.y);
                else {
                    const prev = ctx.terrainPoints[i-1];
                    const midX = (prev.x + p.x)/2;
                    const midY = (prev.y + p.y)/2;
                    ctx.ctxTerrain.quadraticCurveTo(prev.x, prev.y, midX, midY);
                }
            });
            ctx.ctxTerrain.lineTo(st.width + 200, st.height);
            ctx.ctxTerrain.closePath();

            ctx.ctxTerrain.fillStyle = "#010203";
            ctx.ctxTerrain.fill();
            
            // Rim Light
            ctx.ctxTerrain.lineWidth = 2;
            ctx.ctxTerrain.strokeStyle = "rgba(100, 255, 218, 0.1)";
            ctx.ctxTerrain.stroke();
            
            ctx.ctxTerrain.restore();
        }

        // --- INPUTS ---
        const handleGyro = (e) => {
            if(st.inputMode !== 'gyro') return;
            st.targetTilt.x = Math.max(-1, Math.min(1, (e.gamma || 0)/45));
            st.targetTilt.y = Math.max(-1, Math.min(1, ((e.beta || 0)-45)/45));
        }

        const handleMouse = (e) => {
            if(st.inputMode !== 'mouse') return;
            st.targetTilt.x = (e.clientX / st.width - 0.5) * 2;
            st.targetTilt.y = (e.clientY / st.height - 0.5) * 2;
        }

        // --- MAIN LOOP ---
        const loop = () => {
            st.time += 16;
            
            // Tilt Physics (Smooth LERP)
            let idleX = Math.sin(st.time * 0.0005) * 0.1;
            let idleY = Math.cos(st.time * 0.0003) * 0.1;

            st.tilt.x += ((st.targetTilt.x + idleX) - st.tilt.x) * 0.05;
            st.tilt.y += ((st.targetTilt.y + idleY) - st.tilt.y) * 0.05;

            // Color Shift Logic
            // 简化处理，只做衰减，不处理随机 Surge 和按钮点击
            st.colorShift *= 0.95;

            // Render
            renderBackground();
            renderWebGL();
            renderTerrain();

            animationFrameRef.current = requestAnimationFrame(loop);
        }

        // ------------------------------------
        // --- 初始化和清理 ---
        // ------------------------------------

        const init = () => {
            ctx.ctxBg = bgCanvasRef.current.getContext('2d');
            ctx.ctxTerrain = terrainCanvasRef.current.getContext('2d');
            
            resize(); // 首次尺寸设置和地形初始化
            initWebGL();
            initStars();

            window.addEventListener('resize', resize);
            window.addEventListener('mousemove', handleMouse);
            
            // 尝试添加陀螺仪事件监听
            if (st.inputMode === 'gyro' && window.DeviceOrientationEvent) {
                 // 需要检查权限 (iOS 13+ 需要用户点击)
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    // 通常在用户交互（如按钮点击）后请求，此处暂不主动请求
                    console.log("iOS: Gyroscope permission required.");
                } else {
                    window.addEventListener('deviceorientation', handleGyro);
                }
            } else if (st.inputMode === 'mouse') {
                // 如果默认模式是mouse，已经在上面监听了
            }
            
            animationFrameRef.current = requestAnimationFrame(loop);
        }
        
        // 运行初始化
        init();

        // 组件卸载时进行清理
        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('deviceorientation', handleGyro);
            window.removeEventListener('mousemove', handleMouse);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [inputMode]); // inputMode 变化时重新运行 useEffect

    // ------------------------------------
    // --- React 渲染部分 ---
    // ------------------------------------
    
    // 注意：您需要将控制面板等 UI 元素放在一个单独的 React 组件中，
    // 因为它们与背景效果的实现是分离的。这里我们只渲染背景 canvas。
    return (
        <BackgroundWrapper id="viewport">
            <canvas ref={bgCanvasRef} id="bgCanvas"></canvas>
            <canvas ref={glCanvasRef} id="glCanvas"></canvas>
            <canvas ref={terrainCanvasRef} id="terrainCanvas"></canvas>
            {/* UI 元素，如 logo, settings 应该作为其他 React 组件层叠在上面 */}
        </BackgroundWrapper>
    );
};

export default GyroBackground;