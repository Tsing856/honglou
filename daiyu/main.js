document.addEventListener('DOMContentLoaded', () => {
    const hintUi = document.getElementById('hint-ui');
    const guideText = document.getElementById('guide-text');
    const bookStage = document.getElementById('book-stage');
    const awakeningStage = document.getElementById('awakening-stage');
    const goldLock = document.getElementById('gold-lock');
    const lockSketch = document.getElementById('lock-sketch');
    const lockColored = document.getElementById('lock-colored');
    const fogOverlay = document.getElementById('fog-overlay');
    const sceneStage = document.getElementById('scene-stage');
    const daiyuSketchBtn = document.getElementById('daiyu-sketch-btn');
    const scrollContainer = document.getElementById('scroll-container');
    const curtainStage = document.getElementById('curtain-call-stage');

    // 1. 解析 URL 中的参数，判断是否来自剧情回顾
const urlParams = new URLSearchParams(window.location.search);
const isFromRecap = urlParams.get('from') === 'recap';

// 2. 黛玉篇结束/跳转下一个节点的函数
function goToNextChapter() {
    if (isFromRecap) {
        // 来自剧情回顾：独立播放完毕，直接返回根目录的剧情回顾界面
        window.location.href = '../home.html?recap=1';
    } else {
        // 第一次正常流程：进入下一篇（宝钗篇）
        window.location.href = '../baochai/index.html';
    }
}

    // 1. 场景初始化：显示完美书籍内页
    if (bookStage) {
        bookStage.style.display = 'flex';
        bookStage.style.opacity = '1';
    }
    if (awakeningStage) awakeningStage.style.display = 'none';
    if (sceneStage) sceneStage.style.display = 'none';

    let currentStep = 1; // 1: 书籍内页阶段
    if (guideText) {
        guideText.innerText = "【前盟再启】轻触右页绛痕素帕线稿，聆听潇湘琴音...";
    }

    // 2. 点击右页素帕 -> 书本缩放淡出 -> 唤醒
    if (daiyuSketchBtn) {
        daiyuSketchBtn.addEventListener('click', () => {
            if (currentStep !== 1) return;
            currentStep = 2;

            bookStage.style.transition = 'all 0.8s ease';
            bookStage.style.opacity = '0';
            bookStage.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                bookStage.style.display = 'none';
                if (awakeningStage) {
                    awakeningStage.style.display = 'flex';
                    setTimeout(() => { 
                        awakeningStage.style.opacity = '1'; 
                        currentStep = 3; 
                        if (guideText) guideText.innerHTML = "【释放泪魂】触碰绛痕素帕，为器物注入世间至纯痴魂...";
                    }, 50);
                }
            }, 800);
        });
    }

    // 3. 点击素帕 -> 触发彩色 SVG 扩散 -> 转场
    if (goldLock) {
        goldLock.addEventListener('click', () => {
            if (currentStep !== 3) return;
            currentStep = 3.5;

            const ritualCircle = document.querySelector('.ritual-circle');
            if (ritualCircle) {
                ritualCircle.style.opacity = '0';
                ritualCircle.style.transform = 'scale(1.08)';
            }

            if (lockColored) lockColored.classList.add('bleed-active');
            if (lockSketch) lockSketch.style.opacity = '0';

            setTimeout(() => {
                const maskCircle = document.getElementById('mask-circle');
                if (maskCircle) { maskCircle.setAttribute('r', '500'); }
            }, 50);

            setTimeout(() => {
                if (fogOverlay) {
                    fogOverlay.style.display = 'block';
                    fogOverlay.classList.add('fog-active'); 
                }
                
                setTimeout(() => {
                    if (awakeningStage) awakeningStage.style.display = 'none'; 
                    if (sceneStage) {
                        sceneStage.style.display = 'block'; 
                        if (hintUi) {
                            hintUi.classList.add('scene-style');   
                            hintUi.style.opacity = '0';
                        }
                        setTimeout(() => { sceneStage.style.opacity = '1'; }, 50);
                    }
                }, 1300); 

                setTimeout(() => { 
                    if (fogOverlay) fogOverlay.style.display = 'none'; 
                    currentStep = 4; // 进入 3D 漫游模式
                }, 5000);
            }, 2500); 
        });
    }

    // ==========================================================================
    // 🌸 WASD + 鼠标移动驱动的 3D 长卷全景漫游（第四步）
    // ==========================================================================
    let camX = 0, camZ = 0, mouseX = 0;
    let curCamX = 0, curCamZ = 0, curMouseX = 0;
    const keys = { w: false, a: false, s: false, d: false };

    window.addEventListener('keydown', (e) => { 
        if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = true; 
    });
    window.addEventListener('keyup', (e) => { 
        if (e.key.toLowerCase() in keys) keys[e.key.toLowerCase()] = false; 
    });
    window.addEventListener('mousemove', (e) => { 
        if (currentStep === 4 || currentStep === 6) {
            mouseX = ((e.clientX / window.innerWidth) - 0.5) * 120; 
        }
    });

    function updateCam() {
        if ((currentStep === 4 || currentStep === 6) && scrollContainer) {
            if (keys.w) camZ += 4; 
            if (keys.s) camZ -= 4; 
            if (keys.a) camX -= 4; 
            if (keys.d) camX += 4;
            
            camX = Math.max(-120, Math.min(120, camX)); 
            camZ = Math.max(-50, Math.min(150, camZ));
            
            curCamX += (camX - curCamX) * 0.08; 
            curCamZ += (camZ - curCamZ) * 0.08; 
            curMouseX += (mouseX - curMouseX) * 0.08;
            
            scrollContainer.style.transform = `translate3d(${-curCamX - curMouseX}px, 0, ${curCamZ}px) rotateY(${(-curMouseX/120)*4}deg)`;
        }
        requestAnimationFrame(updateCam);
    }
    updateCam();

    // ==========================================================================
    // 🌸 局部发光区交互绑定
    // ==========================================================================
    const propTea = document.getElementById('prop-tea');
    const propBooks = document.getElementById('prop-books');

    if (propTea) {
        propTea.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const currentHintUi = document.getElementById('hint-ui');
            const currentGuideText = document.getElementById('guide-text');
            if (currentHintUi && currentGuideText) {
                currentHintUi.className = "scene-style"; 
                currentHintUi.style.display = 'block';
                currentHintUi.style.opacity = '1';
                currentGuideText.innerHTML = "<b>【定窑白瓷茶盏】</b><br>案角定窑，胎骨极薄。她每日注茶、饮尽、搁下。裂纹不知是哪一日添的。";
                setTimeout(() => { currentHintUi.style.opacity = '0'; }, 4000);
            }
        });
    }

    if (propBooks) {
        propBooks.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const currentHintUi = document.getElementById('hint-ui');
            const currentGuideText = document.getElementById('guide-text');
            if (currentHintUi && currentGuideText) {
                currentHintUi.className = "scene-style";
                currentHintUi.style.display = 'block';
                currentHintUi.style.opacity = '1';
                currentGuideText.innerHTML = "<b>【西厢记琴谱】</b><br>那些不容于世俗的至真词章，被她悄悄谱入琴韵之中。";
                setTimeout(() => { currentHintUi.style.opacity = '0'; }, 4000);
            }
        });
    }

    // ==========================================================================
    // 🌸 剧情对白与数据绑定
    // ==========================================================================
    const storyScript = [
        { name: "林黛玉", text: "（静坐在幽竹窗前，身前横着一张古琴，正凝神调弦）<br>“你听，这窗外的风竹之声，倒像是给这断章配弦呢。怪教人心里不自安的。”" },
        { name: "林黛玉", text: "（纤指轻抚过琴徽，看向你）<br>“宝玉方才送了素帕来……可那热闹是他们的。不如你随我坐下，我刚依着古调拟了一首新曲，你且来听听这弦音可还干净？”" },
        { name: "我",   text: "“愿为姑娘洗耳恭听。”" },
        { name: "林黛玉", text: "（嘴角浮起一抹极淡的笑意，微微颔首）<br>“难得你是个静得下心的。那便替我燃一炷香，咱们且在这幽壑竹影里，试抚一曲吧。”" }
    ];

    const finalEndingScript = [
        { name: "林黛玉", text: "（一曲终了，突然‘崩’的一声，琴弦应声而断。月色凄清，她的身形开始飘渺）<br>“弦断音销……这眼泪，好像也终于要还完了。真真是镜花水月一场空。”" },
        { name: "林黛玉", text: "（双手虚掩在断弦之上，对你凄然一笑）<br>“我要回那灵河岸边去了。你且往前走吧……去蘅芜苑瞧瞧，那儿有一件金锁，正默默等着这书卷的下一个有缘人呢。”" }
    ];

    let currentLineIndex = 0, finalScriptIndex = 0, isEndingDialogueMode = false;
    const propDaiyu = document.getElementById('prop-daiyu');

    if (propDaiyu) {
        propDaiyu.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (currentStep !== 4) return;
            
            currentStep = 5; 
            isEndingDialogueMode = false;
            
            if (sceneStage) {
                sceneStage.style.transition = 'opacity 1.0s ease';
                sceneStage.style.opacity = '0';
            }

            setTimeout(() => {
                if (sceneStage) sceneStage.style.display = 'none';
                const storyStage = document.getElementById('story-stage');
                if (storyStage) {
                    const storyBg = document.getElementById('story-bg');
                    if (storyBg) storyBg.src = "../image/daiyu_juqing.jpg";
                    storyStage.classList.add('active'); 
                    storyStage.style.display = 'block';
                    setTimeout(() => {
                        storyStage.style.opacity = '1'; 
                        storyStage.classList.add('fade-in');
                    }, 50);
                    
                    const dName = document.getElementById('dialogue-name');
                    dName.innerText = storyScript[0].name;
                    dName.style.background = "#a13d37"; // 黛玉红
                    document.getElementById('dialogue-text').innerHTML = storyScript[0].text;
                }
            }, 1000);
        });
    }

    // 控制对白推进的核心逻辑
    function advanceStory() {
        const storyStage = document.getElementById('story-stage');
        
        // 🌟 状态：如果在终章对话模式下
        if (isEndingDialogueMode) {
            finalScriptIndex++;
            if (finalScriptIndex < finalEndingScript.length) {
                document.getElementById('dialogue-name').innerText = finalEndingScript[finalScriptIndex].name;
                document.getElementById('dialogue-text').innerHTML = finalEndingScript[finalScriptIndex].text;
                document.getElementById('dialogue-name').style.background = "#a13d37";
            } else {
                // 终章对话按完，拉下全篇大帷幕
                if (storyStage) storyStage.style.opacity = '0';
                setTimeout(() => { 
                    if (storyStage) storyStage.style.display = 'none';
                    if (curtainStage) {
                        curtainStage.style.display = 'flex';
                        curtainStage.classList.add('active'); 
                    }
                }, 1500);
            }
            return;
        }

        // 状态：如果是开局前序对话
        currentLineIndex++;
        if (currentLineIndex < storyScript.length) {
            const dName = document.getElementById('dialogue-name');
            const dText = document.getElementById('dialogue-text');
            if (dName) dName.innerText = storyScript[currentLineIndex].name;
            if (dText) dText.innerHTML = storyScript[currentLineIndex].text;
            if (dName) {
                dName.style.background = storyScript[currentLineIndex].name === "我" ? "#2e4e3f" : "#a13d37";
            }
        } else {
            // 前序对话点击完毕，直接无缝唤醒古琴七弦游戏
            if (storyStage) {
                storyStage.style.opacity = '0';
                setTimeout(() => { 
                    storyStage.style.display = 'none';
                    storyStage.classList.remove('active', 'fade-in'); 
                    enterQinGame(); 
                }, 1000);
            }
        }
    }

    const nextBtn = document.getElementById('dialogue-next-btn');
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            advanceStory(); 
        });
    }

    // ==========================================================================
    // 🌸 4. 潇湘听琴古琴小游戏核心逻辑
    // ==========================================================================
    const playQinStage = document.getElementById('play-qin-stage');
    const qinTargetSequence = [1, 3, 5, 7]; // 对应：宫(一) -> 角(三) -> 羽(五) -> 少商(七)
    let playerQinSequence = [];

    function enterQinGame() {
        if (hintUi) hintUi.style.opacity = '0';
        currentStep = 6; 
        
        if (sceneStage) sceneStage.style.display = 'none';
        // 找到 main.js 里处理进入古琴关卡的代码块：
if (playQinStage) {
    playQinStage.style.display = 'block';
    setTimeout(() => { playQinStage.style.opacity = '1'; }, 50);
    
    // 🌟 在这里进行 3D 古琴容器的创建和渲染
    // 检查是否已经创建过，防止重复生成画布
    if (!document.getElementById('canvas-3d-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.id = 'canvas-3d-wrapper';
        // 让3D画布层绝对定位满屏，并垫在你原本的进度条、吐司UI后方
        wrapper.style.cssText = "position:absolute; top:0; left:0; width:100vw; height:100vh; z-index:1; pointer-events:auto;";
        playQinStage.appendChild(wrapper);
        
        // 唤醒 3D 渲染，将滑动琴弦事件绑定到你原本就在运行的 playNote() 函数上
        new window.Guqin3D('canvas-3d-wrapper', 'c754e667e63d2fd02047d33489ca60c2.jpg', (stringIndex) => {
            if (typeof playNote === 'function') {
                playNote(stringIndex); // 自动调用你原本的音效发放、特效发放以及小游戏通关进度逻辑！
            }
        });
    }
}
    }

    function bindQinStringEvents() {
        const qinStrings = document.querySelectorAll('.guqin-string');
        qinStrings.forEach(str => {
            const newStr = str.cloneNode(true);
            str.parentNode.replaceChild(newStr, str);
        });

        document.querySelectorAll('.guqin-string').forEach(str => {
            str.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const stringNum = parseInt(str.getAttribute('data-string'));
                const noteName = str.getAttribute('data-note');

                str.classList.add('vibrating');
                setTimeout(() => { str.classList.remove('vibrating'); }, 400);

                triggerMiniToast("拂弦", `拨动了【${noteName}弦】`);

                playerQinSequence.push(stringNum);
                checkQinSequence();
            });
        });
    }

    function checkQinSequence() {
        const checkIdx = playerQinSequence.length - 1;
        const progressFill = document.getElementById('qin-progress-fill');

        if (playerQinSequence[checkIdx] !== qinTargetSequence[checkIdx]) {
            triggerMiniToast("【弦音错漏】", "黛玉微微蹙眉：‘心不静，音韵便差了。’ 重新依次抚动：宫、角、羽、少商...");
            playerQinSequence = []; 
            if (progressFill) progressFill.style.width = '0%';
            return;
        }

        if (progressFill) {
            const currentPercentage = (playerQinSequence.length / qinTargetSequence.length) * 100;
            progressFill.style.width = currentPercentage + '%';
        }

        if (playerQinSequence.length === qinTargetSequence.length) {
            triggerMiniToast("【琴心共鸣】", "‘幽僻处可有人行？点点芭蕉泪沾襟。’ 黛玉轻叹，似有所动...");
            // 小游戏胜利！驻留 1.5 秒展示完满进度条，随后进入视频舞台
            setTimeout(() => {
                handleQinGameComplete();
            }, 1500);
        }
    }

    // 🌟 核心控制：小游戏通关，切入全屏视频，并在视频播放完毕后自动打开终章剧情
    window.handleQinGameComplete = function() {
        if (playQinStage) {
            playQinStage.style.opacity = '0';
            setTimeout(() => { playQinStage.style.display = 'none'; }, 1000);
        }

        const videoStage = document.getElementById('video-stage');
        const transitionVideo = document.getElementById('transition-video');

        if (videoStage && transitionVideo) {
            videoStage.style.display = 'block';
            setTimeout(() => { videoStage.style.opacity = '1'; }, 50);
            
            // 1. 强制重置并播放视频
            transitionVideo.currentTime = 0;
            transitionVideo.play();

            // 2. 🌟 关键绑定：当视频自然播放完毕一遍（onended）
transitionVideo.onended = () => {
    // 让视频舞台淡出隐藏
    videoStage.style.opacity = '0';
    setTimeout(() => { 
        videoStage.style.display = 'none'; 
        if (sceneStage) sceneStage.style.display = 'none'; 
        
        // 3. 瞬间无缝进入终章对话逻辑控制区
        currentStep = 7; 
        isEndingDialogueMode = true;
        finalScriptIndex = 0; // 重置终章对白索引
        
        // 4. 唤醒对白舞台，装填终章“断弦背景”以及对白台词
        const sStage = document.getElementById('story-stage');
        const storyBg = document.getElementById('story-bg');
        if (storyBg) storyBg.src = "../image/daiyu_fuqinjuqing.jpg";
        
        if (sStage) {
            sStage.classList.add('active'); 
            sStage.classList.add('fade-in'); // 👈 补上这一行！让对白框打破透明，优雅淡入
            sStage.style.display = 'block';
            setTimeout(() => { sStage.style.opacity = '1'; }, 50);
        }
        
        // 5. 初始化刷出终章第一句话
        const dName = document.getElementById('dialogue-name');
        const dText = document.getElementById('dialogue-text');
        if (dName) {
            dName.style.background = "#a13d37";
            dName.innerText = finalEndingScript[0].name;
        }
        if (dText) {
            dText.innerHTML = finalEndingScript[0].text;
        }
    }, 1000);
};
        }
    }

    // 全局微提示浮层工具
    function triggerMiniToast(title, content) {
        const qinToastUi = document.getElementById('qin-toast-ui');
        const tTitle = document.getElementById('toast-title');
        const tContent = document.getElementById('toast-content');
        if (qinToastUi && tTitle && tContent) {
            tTitle.innerText = title;
            tContent.innerText = content;
            qinToastUi.style.display = 'block';
            qinToastUi.style.opacity = '1';
        }
    }

    // 唯美谢幕点击返回主封面
    if (curtainStage) {
    curtainStage.addEventListener('click', () => {
        curtainStage.style.opacity = '0';
        setTimeout(() => {
            if (isFromRecap) {
                window.location.href = '../home.html?recap=1'; // 回剧情回顾
            } else {
                window.location.href = '../baochai/index.html'; // 第一次跳宝钗篇
            }
        }, 1000);
    });
}

// ==================== 🌟 修复版：拨弦与通关逻辑整合 ====================
const guqinFrequencies = {
    1: 65.41,  2: 73.42,  3: 87.31,  4: 98.00,  5: 110.00,  6: 130.81,  7: 146.83
};

let audioCtx = null;
let pluckedStrings = new Set();
let gameCleared = false;

// 古琴 1~7 弦对应的五音与讲解
const guqinInfo = {
    1: { name: "一弦 · 宫音", desc: "黄钟之宫，土音也。其声重厚温润，如极目远眺，沉稳端庄。" },
    2: { name: "二弦 · 商音", desc: "太簇之商，金音也。其声清脆高亢，如秋风拂面，凄清肃杀。" },
    3: { name: "三弦 · 角音", desc: "姑洗之角，木音也。其声通达和柔，如春木吐翠，生机盎然。" },
    4: { name: "四弦 · 徵音", desc: "林钟之徵，火音也。其声欢快热烈，如高山流水，舒畅流丽。" },
    5: { name: "五弦 · 羽音", desc: "南吕之羽，水音也。其声圆润苍凉，如夜空明月，柔顺凄美。" },
    6: { name: "六弦 · 少宫", desc: "文王增弦。清角柔和，复叠宫音，音色深沉绵长，寄托缠绵之思。" },
    7: { name: "七弦 · 少商", desc: "武王增弦。极清极高，刚劲高洁，如断弦余响，扣人心弦。" }
};

window.playNote = function(stringIndex) {
    // 🌟 核心修正：无论传入的是 0~6 还是 "0"~"6"，统一下标 +1（变成 1~7）
    const adjustedIndex = Number(stringIndex) + 1;

    // 获取对应的提示内容与声音频率
    const info = guqinInfo[adjustedIndex] || { name: `第 ${adjustedIndex} 弦`, desc: "轻抚瑶琴，余音袅袅..." };
    const freq = guqinFrequencies[adjustedIndex] || 110;

    console.log(`🎵 拨动了原索引 ${stringIndex} -> 实际映射为第 ${adjustedIndex} 弦`);

    // 1. Web Audio 发声
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    } catch (e) {
        console.error("音频初始化失败:", e);
    }

    if (audioCtx) {
    const now = audioCtx.currentTime;

    // 🌟 全局只建一条主链：压一次就好，不要每根弦新建压缩器
    if (!window._qinMaster) {
        const masterGain = audioCtx.createGain();
        masterGain.gain.value = 1.8;   // 🌟 从 2.0 降到 1.3，留足动态余量

        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -20;
        compressor.knee.value = 20;     // 🌟 软拐点，过渡自然不炸
        compressor.ratio.value = 4;
        compressor.attack.value = 0.01;
        compressor.release.value = 0.3;

        const lowpass = audioCtx.createBiquadFilter(); // 🌟 低通滤波：滤掉三角波的毛刺
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 8000;  // 只保留古琴温润的频段，削掉"电子味"高频

        const bassBoost = audioCtx.createBiquadFilter(); // 🌟 新增：低频补偿
        bassBoost.type = 'lowshelf';
        bassBoost.frequency.value = 220;
        bassBoost.gain.value = 5;

        masterGain.connect(lowpass);
        lowpass.connect(compressor);
        compressor.connect(audioCtx.destination);

        window._qinMaster = masterGain;
    }
    const master = window._qinMaster;

    // 基音：音量 0.9 -> 0.75，起振 0.01s -> 0.025s（慢一点点起手，去除爆音感）
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.85, now + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    osc.connect(gainNode);
    gainNode.connect(master);

    // 泛音：音量 0.3 -> 0.22，且让它 1.2 秒内先消失，不跟基音抢
    const overtone = audioCtx.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2, now);

    const overtoneGain = audioCtx.createGain();
    overtoneGain.gain.setValueAtTime(0, now);
    overtoneGain.gain.linearRampToValueAtTime(0.22, now + 0.02);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    overtone.connect(overtoneGain);
    overtoneGain.connect(master);

    osc.start(now);
    osc.stop(now + 3.6);
    overtone.start(now);
    overtone.stop(now + 1.3);
}

    // 2. 触发正确的 UI 提示（停顿 2.5 秒后自动消失）
    triggerMiniToast(info.name, info.desc);
};

// 3. UI 提示框控制：停顿 2.5 秒后直接隐去消失
function triggerMiniToast(title, content) {
    const toastTitle = document.getElementById('toast-title');
    const toastContent = document.getElementById('toast-content');
    const toastUi = document.getElementById('qin-toast-ui');

    if (toastTitle) toastTitle.innerText = title;
    if (toastContent) toastContent.innerText = content;

    if (toastUi) {
        // 划动琴弦时立即不透明显示
        toastUi.style.opacity = '1';
        
        // 清除上一次的倒计时（如果连续划弦，重新开始计时）
        clearTimeout(window.toastTimer);
        
        // 停顿 2.5 秒后完全隐藏 (opacity = 0)
        window.toastTimer = setTimeout(() => {
            toastUi.style.opacity = '0';
        }, 2500); // 👈 想调整停留时间可修改此处的毫秒数（例如 3000 = 3 秒）
    }
}
});