// ==================== 调试配置 ====================
// 调试开关：
// 'map'   -> 刷新后直接跳到【大观园】全景界面
// 'recap' -> 刷新后直接跳到【剧情回顾】界面
// 'off'   -> 关闭调试，恢复正常流程（封面 -> 体验流程）
const DEBUG_TARGET = 'off'; 

// ==================== 根目录：封面 / 剧情回顾 / 大观园 ====================
const recapParams = new URLSearchParams(window.location.search);
const shouldOpenRecap = recapParams.get('recap') === '1';
const shouldOpenMap = recapParams.get('map') === '1';

function showStoryRecap() {
    const bookStage = document.getElementById('book-stage');
    const hint = document.getElementById('hint-ui');
    const mapStage = document.getElementById('dagwanyuan-stage');
    const videoStage = document.getElementById('map-video-stage');
    const recapStage = document.getElementById('story-recap-stage');

    if (bookStage) bookStage.style.display = 'none';
    if (hint) hint.style.display = 'none';
    if (mapStage) {
        mapStage.style.display = 'none';
        mapStage.style.opacity = '0';
    }
    if (videoStage) {
        videoStage.style.display = 'none';
        videoStage.style.opacity = '0';
    }
    if (recapStage) {
        recapStage.style.display = 'flex';
        recapStage.style.opacity = '1';
        recapStage.classList.add('active');
    }
}

function leaveRecapToMap() {
    const recapStage = document.getElementById('story-recap-stage');
    if (recapStage) {
        recapStage.classList.remove('active');
        recapStage.style.opacity = '0';
        recapStage.style.display = 'none';
    }
    showDagwanyuanStage();
}

function replayChapter(chapter) {
    const routes = {
        baoyu: './baoyu/index.html?from=recap',
        daiyu: './daiyu/index.html?from=recap',
        baochai: './baochai/index.html?from=recap'
    };
    const target = routes[chapter];
    if (target) window.location.href = target;
}

// 统一绑定“剧情回顾”界面的交互事件（进入大观园按钮 + 场景卡片点击）
function initRecapEvents() {
    const recapMapBtn = document.getElementById('recap-enter-map-btn');
    if (recapMapBtn && !recapMapBtn.dataset.bound) {
        recapMapBtn.dataset.bound = '1';
        recapMapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            leaveRecapToMap();
        });
    }

    document.querySelectorAll('.recap-artifact').forEach(card => {
        if (!card.dataset.bound) {
            card.dataset.bound = '1';
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                replayChapter(card.dataset.chapter);
            });
        }
    });
}

window.addEventListener('load', () => {
    // ===== 调试模式分支 =====
    if (DEBUG_TARGET === 'map') {
        const bookStage = document.getElementById('book-stage');
        const hint = document.getElementById('hint-ui');
        const recapStage = document.getElementById('story-recap-stage');

        if (bookStage) bookStage.style.display = 'none';
        if (hint) hint.style.display = 'none';
        if (recapStage) {
            recapStage.classList.remove('active');
            recapStage.style.display = 'none';
        }

        showDagwanyuanStage();
        initDagwanyuanEvents();
        return; 
    } else if (DEBUG_TARGET === 'recap') {
        showStoryRecap();
        initRecapEvents();       // 补充：绑定剧情回顾卡片及按钮点击事件
        initDagwanyuanEvents();  // 预绑定大观园事件
        return;
    }

    // ===== 正式业务分支 =====
    if (shouldOpenRecap) {
        showStoryRecap();
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (shouldOpenMap) {
        const bookStage = document.getElementById('book-stage');
        const hint = document.getElementById('hint-ui');
        const recapStage = document.getElementById('story-recap-stage');

        if (bookStage) bookStage.style.display = 'none';
        if (hint) hint.style.display = 'none';
        if (recapStage) {
            recapStage.classList.remove('active');
            recapStage.style.display = 'none';
        }

        showDagwanyuanStage();
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    initRecapEvents();
    initDagwanyuanEvents();
});

// ==================== 大观园全景逻辑 ====================

const mapVideoPlaylistA = [
    './image/screen1-1.mp4',
    './image/screen1-2.mp4',
    './image/screen1-3.mp4'
];

const mapVideoPlaylistB = [
    './image/screen2-1.mp4',
    './image/screen2-2.mp4'
];

let mapCurrentPlaylist = [];
let mapCurrentVideoIndex = 0;
let activeVideoEl = null;
let hiddenVideoEl = null;

function showDagwanyuanStage() {
    const mapStage = document.getElementById('dagwanyuan-stage');
    const videoStage = document.getElementById('map-video-stage');
    const map = document.getElementById('dagwanyuan-map');
    const hint = document.getElementById('map-hint-ui');

    if (videoStage) {
        videoStage.style.display = 'none';
        videoStage.style.opacity = '0';
    }

    if (mapStage) {
        mapStage.style.display = 'flex';
        mapStage.style.zIndex = '13000';
        mapStage.style.opacity = '1';
        mapStage.style.pointerEvents = 'auto';
    }

    if (map) {
        map.style.transition = '';
        map.style.transform = 'scale(1)';
    }

    document.querySelectorAll('.map-hotspot').forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
    });
    if (hint) {
        hint.style.opacity = '1';
    }
}

function initDagwanyuanEvents() {
    const hotspot1 = document.getElementById('hotspot-1');
    const hotspot2 = document.getElementById('hotspot-2');
    const backBtn = document.getElementById('back-to-map-btn');
    const backToRecapBtn = document.getElementById('map-back-to-recap-btn'); // 1. 获取新按钮

    // 2. 绑定点击事件，切回剧情回顾界面
    if (backToRecapBtn && !backToRecapBtn.dataset.bound) {
        backToRecapBtn.dataset.bound = '1';
        backToRecapBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showStoryRecap(); // 切回剧情回顾
        });
    }

    if (hotspot1 && !hotspot1.dataset.bound) {
        hotspot1.dataset.bound = '1';
        hotspot1.addEventListener('click', (e) => {
            e.preventDefault();
            triggerHotspotZoom(e, mapVideoPlaylistA);
        });
    }

    if (hotspot2 && !hotspot2.dataset.bound) {
        hotspot2.dataset.bound = '1';
        hotspot2.addEventListener('click', (e) => {
            e.preventDefault();
            triggerHotspotZoom(e, mapVideoPlaylistB);
        });
    }

    if (backBtn && !backBtn.dataset.bound) {
        backBtn.dataset.bound = '1';
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            backToDagwanyuanMap();
        });
    }

    // 为两个 video 标签绑定 ended 事件监听
    const videoA = document.getElementById('map-video-A');
    const videoB = document.getElementById('map-video-B');

    [videoA, videoB].forEach(video => {
        if (video && !video.dataset.boundEnded) {
            video.dataset.boundEnded = '1';
            video.addEventListener('ended', onMapVideoEnded);
        }
    });
}

function triggerHotspotZoom(event, playlist) {
    const dagwanyuanMap = document.getElementById('dagwanyuan-map');
    const mapStage = document.getElementById('dagwanyuan-stage');
    const backBtn = document.getElementById('back-to-map-btn');

    if (backBtn) backBtn.style.display = 'none';

    mapCurrentPlaylist = playlist.slice();
    mapCurrentVideoIndex = 0;

    if (!mapCurrentPlaylist.length) return;

    if (dagwanyuanMap) {
        const rect = dagwanyuanMap.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        const originXPercent = rect.width ? (offsetX / rect.width) * 100 : 50;
        const originYPercent = rect.height ? (offsetY / rect.height) * 100 : 50;

        dagwanyuanMap.style.transformOrigin = `${originXPercent}% ${originYPercent}%`;
        dagwanyuanMap.style.transform = 'scale(3.5)';
    }

    setTimeout(() => {
        if (mapStage) {
            mapStage.style.opacity = '0';
            mapStage.style.pointerEvents = 'none';
        }

        const videoStage = document.getElementById('map-video-stage');
        if (videoStage) {
            videoStage.style.display = 'block';
            videoStage.style.opacity = '1';
            videoStage.style.pointerEvents = 'auto';
            playMapVideo();
        }
    }, 2000);
}

function playMapVideo() {
    activeVideoEl = document.getElementById('map-video-A');
    hiddenVideoEl = document.getElementById('map-video-B');

    if (!activeVideoEl || !hiddenVideoEl || !mapCurrentPlaylist[mapCurrentVideoIndex]) return;

    activeVideoEl.className = 'map-video-player video-active';
    hiddenVideoEl.className = 'map-video-player video-next-right';

    activeVideoEl.src = mapCurrentPlaylist[mapCurrentVideoIndex];
    activeVideoEl.currentTime = 0;
    activeVideoEl.load();

    activeVideoEl.play().catch(err => console.warn('播放限制:', err));
}

// 监听当前播放视频播放完毕，自动推进长卷
function onMapVideoEnded() {
    mapCurrentVideoIndex++;

    if (mapCurrentVideoIndex < mapCurrentPlaylist.length) {
        playNextMapVideoInPlaylist();
    } else {
        const backBtn = document.getElementById('back-to-map-btn');
        if (backBtn) {
            backBtn.style.display = 'inline-flex';
        }
    }
}

function playNextMapVideoInPlaylist() {
    const nextVideoSrc = mapCurrentPlaylist[mapCurrentVideoIndex];
    if (!nextVideoSrc || !activeVideoEl || !hiddenVideoEl) return;

    hiddenVideoEl.style.transition = 'none';
    hiddenVideoEl.className = 'map-video-player video-next-right';
    hiddenVideoEl.src = nextVideoSrc;
    hiddenVideoEl.currentTime = 0;
    hiddenVideoEl.load();

    void hiddenVideoEl.offsetWidth;

    hiddenVideoEl.play().then(() => {
        hiddenVideoEl.style.transition = '';
        activeVideoEl.style.transition = '';

        activeVideoEl.className = 'map-video-player video-exit-left';
        hiddenVideoEl.className = 'map-video-player video-active';

        const temp = activeVideoEl;
        activeVideoEl = hiddenVideoEl;
        hiddenVideoEl = temp;
    }).catch(err => console.warn('自动播放阻断:', err));
}

function backToDagwanyuanMap() {
    const videoStage = document.getElementById('map-video-stage');
    if (videoStage) {
        videoStage.style.opacity = '0';
        setTimeout(() => {
            videoStage.style.display = 'none';
            showDagwanyuanStage();
        }, 800);
    }
}