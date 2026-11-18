(() => {
  // Screens & interactive elements
  const screens = {
    intro: document.getElementById('screen-intro'),
    input: document.getElementById('screen-input'),
    result: document.getElementById('screen-result')
  };

  const screenHeadings = {
    intro: document.getElementById('intro-title'),
    input: document.getElementById('input-heading'),
    result: document.getElementById('result-heading')
  };

  const startBtn = document.getElementById('start-btn');
  const backToIntroBtn = document.getElementById('back-to-intro-btn');
  const editBtn = document.getElementById('edit-btn');
  const retryBtn = document.getElementById('retry-btn');

  const form = document.getElementById('recommend-form');
  const batterySlider = document.getElementById('battery-slider');
  const batteryValueEl = document.getElementById('battery-value');
  const batteryBadgeEl = document.getElementById('battery-tier-badge');

  const validationAlert = document.getElementById('validation-alert');
  const validationAlertText = document.getElementById('validation-alert-text');
  const fieldsets = Array.from(form.querySelectorAll('fieldset[data-field]'));

  // Result nodes
  const resultSummaryChips = document.getElementById('result-summary-chips');
  const resultMent = document.getElementById('result-ment');
  const resultSpotCategory = document.getElementById('result-spot-category');
  const resultSpotName = document.getElementById('result-spot-name');
  const resultSpotEmoji = document.getElementById('result-spot-emoji');
  const resultSpotNoise = document.getElementById('result-spot-noise');
  const resultSpotSeat = document.getElementById('result-spot-seat');
  const resultSpotDrink = document.getElementById('result-spot-drink');
  const resultPlaylistTitle = document.getElementById('result-playlist-title');
  const resultPlaylistGenre = document.getElementById('result-playlist-genre');
  const resultPlaylistTags = document.getElementById('result-playlist-tags');
  const resultPlaylistTrack = document.getElementById('result-playlist-track');
  const resultReason = document.getElementById('result-reason');
  const vinylDisc = document.getElementById('vinyl-disc');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioBtnLabel = document.getElementById('audio-btn-label');
  const volumeSlider = document.getElementById('volume-slider');
  const youtubeSearchLink = document.getElementById('youtube-search-link');
  const spotMapTitle = document.getElementById('spot-map-title');
  const spotMapQueryPreview = document.getElementById('spot-map-query-preview');
  const mapRegionInput = document.getElementById('map-region-input');
  const mapKeywordChips = document.getElementById('map-keyword-chips');
  const naverMapLink = document.getElementById('naver-map-link');
  const kakaoMapLink = document.getElementById('kakao-map-link');

  // Labels for summary chips & messages
  const LABELS = {
    timeOfDay: {
      morning: { text: '아침', emoji: '🌅' },
      lunch: { text: '점심', emoji: '☀️' },
      evening: { text: '저녁', emoji: '🌆' },
      night: { text: '심야', emoji: '🌙' }
    },
    taskType: {
      study: { text: '시험·자격증', emoji: '📚' },
      work: { text: '코딩·과제·업무', emoji: '💻' },
      reading: { text: '독서·다이어리', emoji: '📖' },
      creative: { text: '아이디어·창작', emoji: '💡' }
    },
    condition: {
      high: { text: '열정 풀충전', emoji: '🔥' },
      normal: { text: '적당히 집중', emoji: '🙂' },
      sleepy: { text: '출출·나른함', emoji: '🥱' },
      tired: { text: '힐링 필요', emoji: '🫠' }
    }
  };

  // Battery tier metadata (0-25, 26-50, 51-75, 76-100)
  function getBatteryTier(val) {
    if (val <= 25) {
      return {
        key: 'low',
        label: '방전 직전',
        emoji: '🪫',
        color: '#c92a2a',
        softBg: '#fff5f5'
      };
    }
    if (val <= 50) {
      return {
        key: 'midLow',
        label: '시동 거는 중',
        emoji: '🔋',
        color: '#b45309',
        softBg: '#fffbeb'
      };
    }
    if (val <= 75) {
      return {
        key: 'midHigh',
        label: '집중 모드 ON',
        emoji: '⚡',
        color: '#1d4ed8',
        softBg: '#eff6ff'
      };
    }
    return {
      key: 'high',
      label: '초몰입 상태',
      emoji: '🔥',
      color: '#047857',
      softBg: '#ecfdf5'
    };
  }

  // Sync native slider value & CSS properties per modern-web-guidance `slider`
  function syncBatterySlider() {
    const value = Number(batterySlider.value);
    const tier = getBatteryTier(value);

    batterySlider.style.setProperty('--attr-min', batterySlider.min || 0);
    batterySlider.style.setProperty('--attr-max', batterySlider.max || 100);
    batterySlider.style.setProperty('--control-value', value);

    document.documentElement.style.setProperty('--battery-color', tier.color);
    document.documentElement.style.setProperty('--battery-soft', tier.softBg);

    batteryValueEl.textContent = String(value);
    batteryBadgeEl.textContent = `${tier.emoji} ${tier.label}`;
    batterySlider.setAttribute('aria-valuetext', `${value}퍼센트, ${tier.label}`);
  }

  // Accessible screen switcher
  function showScreen(targetKey) {
    if (targetKey !== 'result') {
      WorkBGMPlayer.stop();
    }
    Object.entries(screens).forEach(([key, section]) => {
      section.hidden = key !== targetKey;
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    const heading = screenHeadings[targetKey];
    if (heading) {
      heading.focus({ preventScroll: true });
    }
  }

  // Built-in Web Audio API Generative Music Engine (100% offline, zero external files)
  const WorkBGMPlayer = (() => {
    let ctx = null;
    let masterGain = null;
    let filterNode = null;
    let noiseSource = null;
    let stepTimer = null;
    let isPlaying = false;
    let currentStyle = 'lofi';
    let stepIndex = 0;

    const CHORDS = {
      ambient: [
        [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
        [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
        [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
        [196.00, 246.94, 293.66, 329.63, 440.00]  // G6
      ],
      lofi: [
        [293.66, 349.23, 440.00, 523.25, 659.25], // Dm9
        [196.00, 246.94, 293.66, 349.23, 440.00], // G9
        [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9
        [220.00, 277.18, 329.63, 392.00, 523.25]  // A7#9
      ],
      upbeat: [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [329.63, 392.00, 493.88, 587.33], // Em7
        [174.61, 220.00, 261.63, 329.63]  // Fmaj7
      ],
      deep: [
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 349.23], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G
        [164.81, 196.00, 246.94, 329.63]  // Em7
      ]
    };

    const STYLE_CONFIG = {
      ambient: { stepMs: 1400, cutoff: 950, noiseLevel: 0.045, wave: 'sine', drum: false },
      lofi: { stepMs: 360, cutoff: 1150, noiseLevel: 0.018, wave: 'triangle', drum: true },
      upbeat: { stepMs: 260, cutoff: 1850, noiseLevel: 0.008, wave: 'triangle', drum: true },
      deep: { stepMs: 240, cutoff: 1350, noiseLevel: 0.006, wave: 'sine', drum: true }
    };

    function ensureContext() {
      if (!ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioCtx();
        masterGain = ctx.createGain();
        filterNode = ctx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 1200;
        filterNode.Q.value = 0.7;

        filterNode.connect(masterGain);
        masterGain.connect(ctx.destination);
        setVolume(Number(volumeSlider.value));
      }
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    }

    function startAmbientNoise(level) {
      stopNoise();
      if (!ctx || level <= 0) return;
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.03 * white) / 1.03;
        lastOut = data[i];
      }
      noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = currentStyle === 'ambient' ? 650 : 2200;
      noiseFilter.Q.value = 0.6;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = level;

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();
    }

    function stopNoise() {
      if (noiseSource) {
        try { noiseSource.stop(); } catch {}
        noiseSource.disconnect();
        noiseSource = null;
      }
    }

    function playTone(freq, duration, gainPeak, type = 'sine', attack = 0.04) {
      if (!ctx || !filterNode) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(gainPeak, now + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(filterNode);
      osc.start(now);
      osc.stop(now + duration + 0.05);
    }

    function playSoftKick() {
      if (!ctx || !masterGain) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(115, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }

    function playSoftBrush() {
      if (!ctx || !masterGain) return;
      const now = ctx.currentTime;
      const len = Math.floor(ctx.sampleRate * 0.07);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1800;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      src.connect(hp);
      hp.connect(gain);
      gain.connect(masterGain);
      src.start(now);
    }

    function tick() {
      if (!isPlaying) return;
      const cfg = STYLE_CONFIG[currentStyle] || STYLE_CONFIG.lofi;
      const chordList = CHORDS[currentStyle] || CHORDS.lofi;

      if (currentStyle === 'ambient') {
        const chord = chordList[stepIndex % chordList.length];
        chord.forEach((f, idx) => {
          playTone(f, 3.8, 0.06 / chord.length + 0.025, 'sine', 0.45 + idx * 0.08);
        });
        if (stepIndex % 2 === 1) {
          const highNote = chord[Math.floor(Math.random() * chord.length)] * 2;
          setTimeout(() => {
            if (isPlaying) playTone(highNote, 1.4, 0.035, 'sine', 0.02);
          }, 550);
        }
      } else {
        const barStep = stepIndex % 8;
        const chordIdx = Math.floor(stepIndex / 8) % chordList.length;
        const chord = chordList[chordIdx];

        if (barStep === 0) {
          chord.forEach((f) => playTone(f, cfg.stepMs * 0.007, 0.055, cfg.wave, 0.04));
          playTone(chord[0] / 2, cfg.stepMs * 0.007, 0.08, 'sine', 0.02);
        }

        if (currentStyle === 'upbeat' || currentStyle === 'deep') {
          const arpNote = chord[barStep % chord.length] * (barStep % 4 === 3 ? 2 : 1);
          playTone(arpNote, cfg.stepMs * 0.0018, currentStyle === 'deep' ? 0.045 : 0.055, cfg.wave, 0.015);
        } else if (barStep === 3 || barStep === 6) {
          const melodyNote = chord[(barStep + chordIdx) % chord.length] * 2;
          playTone(melodyNote, 0.65, 0.04, 'sine', 0.02);
        }

        if (cfg.drum) {
          if (barStep === 0 || (currentStyle !== 'deep' && barStep === 5) || (currentStyle === 'deep' && barStep === 4)) {
            playSoftKick();
          }
          if (barStep === 2 || barStep === 6) {
            playSoftBrush();
          }
        }
      }

      stepIndex += 1;
    }

    function updateUI() {
      audioToggleBtn.setAttribute('aria-pressed', String(isPlaying));
      audioBtnLabel.textContent = isPlaying ? '일시정지' : '▶ 노동요 바로 듣기';
      vinylDisc.classList.toggle('is-playing', isPlaying);
    }

    function setVolume(percent) {
      if (!masterGain || !ctx) return;
      const vol = Math.max(0, Math.min(1, percent / 100)) * 0.75;
      masterGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.04);
    }

    function start(styleKey) {
      currentStyle = STYLE_CONFIG[styleKey] ? styleKey : 'lofi';
      ensureContext();
      const cfg = STYLE_CONFIG[currentStyle];
      filterNode.frequency.setTargetAtTime(cfg.cutoff, ctx.currentTime, 0.1);
      stopNoise();
      clearInterval(stepTimer);

      isPlaying = true;
      stepIndex = 0;
      startAmbientNoise(cfg.noiseLevel);
      tick();
      stepTimer = setInterval(tick, cfg.stepMs);
      updateUI();
    }

    function stop() {
      isPlaying = false;
      clearInterval(stepTimer);
      stepTimer = null;
      stopNoise();
      updateUI();
    }

    function toggle(styleKey) {
      if (isPlaying) {
        stop();
      } else {
        start(styleKey);
      }
    }

    function setStyle(styleKey) {
      currentStyle = STYLE_CONFIG[styleKey] ? styleKey : 'lofi';
      if (isPlaying) {
        start(currentStyle);
      }
    }

    return { toggle, stop, setVolume, setStyle };
  })();

  let currentAudioStyle = 'lofi';
  let currentSelectedMapKeyword = '';

  // Dynamic Recommendation Engine Data
  const SPOTS_BY_TIER_TASK = {
    low: {
      study: {
        category: '초저전력 홈 스터디',
        name: '침대 옆 작은 테이블 & 무드등 존',
        emoji: '🛋️',
        noise: '완전 고요함',
        seat: '등받이 쿠션 소파 또는 침대 트레이',
        isHomeSpot: true,
        mapQueries: ['디저트 카페 포장', '베이커리 카페', '동네 조용한 카페']
      },
      work: {
        category: '편안한 홈카페 데스크',
        name: '잠옷 차림 내 방 무드등 책상',
        emoji: '🏡',
        noise: '잔잔한 집안 공기',
        seat: '쿠션 깔린 편안한 내 책상',
        isHomeSpot: true,
        mapQueries: ['디저트 카페 포장', '베이커리 카페', '동네 조용한 카페']
      },
      reading: {
        category: '릴랙스 북 코너',
        name: '이불 속 스탠드 조명 & 홈 라운지',
        emoji: '🕯️',
        noise: '극강의 평온함',
        seat: '포근한 암체어 or 침대 모서리',
        isHomeSpot: true,
        mapQueries: ['독립서점', '북카페', '디저트 포장']
      },
      creative: {
        category: '긴장 제로 영감 스팟',
        name: '거실 러그 위 바닥 테이블 or 베란다',
        emoji: '🌿',
        noise: '자유롭고 느슨한 분위기',
        seat: '발 쭉 뻗는 1인 빈백 소파',
        isHomeSpot: true,
        mapQueries: ['디저트 카페 포장', '베이커리 카페', '동네 조용한 카페']
      }
    },
    midLow: {
      study: {
        category: '워밍업 감성 카페',
        name: '적당한 웅성임이 있는 동네 창가 카페',
        emoji: '☕',
        noise: '기분 좋은 백색소음',
        seat: '햇살 들어오는 2인 창가 자리',
        mapQueries: ['카공 카페', '조용한 카페', '창가 카페']
      },
      work: {
        category: '라운지형 워크 카페',
        name: '콘센트 있는 브런치 & 베이커리 카페',
        emoji: '🥐',
        noise: '잔잔한 카페 BGM + 커피 머신 소리',
        seat: '벽면 콘센트 가까운 우드 테이블',
        mapQueries: ['브런치 카페', '베이커리 카페', '콘센트 카페']
      },
      reading: {
        category: '감성 북라운지',
        name: '따뜻한 조명의 독립 서점 겸 카페',
        emoji: '📚',
        noise: '책장 넘기는 소리가 들리는 정도',
        seat: '서재 옆 1인 안락 의자',
        mapQueries: ['독립서점 카페', '북카페', '조용한 카페']
      },
      creative: {
        category: '바이브 충전 카페',
        name: '인테리어 예쁜 루프탑·테라스 감성 카페',
        emoji: '🪴',
        noise: '가벼운 대화 & 트렌디한 음악',
        seat: '시야가 탁 트인 코너 바 테이블',
        mapQueries: ['루프탑 카페', '테라스 카페', '감성 카페']
      }
    },
    midHigh: {
      study: {
        category: '정석 몰입 공간',
        name: '공공 도서관 열람실 또는 스터디 라운지',
        emoji: '🏛️',
        noise: '조용한 긴장감',
        seat: '사선 시야 차단되는 창가 열람석',
        mapQueries: ['도서관 열람실', '시립도서관', '스터디 라운지']
      },
      work: {
        category: '파워 카공 스팟',
        name: '콘센트 빵빵한 대형 프랜차이즈 카페 2층',
        emoji: '🔌',
        noise: '안정적인 카공족 백색소음',
        seat: '넓은 멀티탭 구비 빅 테이블',
        mapQueries: ['대형 카페', '스타벅스', '투썸플레이스']
      },
      reading: {
        category: '집중 아지트',
        name: '원목 테이블이 넓은 대형 북카페',
        emoji: '🪵',
        noise: '차분하고 정돈된 소음',
        seat: '조명 좋은 1인 스탠드 좌석',
        mapQueries: ['대형 북카페', '북카페', '교보문고 카페']
      },
      creative: {
        category: '워크스페이스',
        name: '라운지 분위기 좋은 공유오피스 오픈존',
        emoji: '🏢',
        noise: '적당한 활기와 몰입의 균형',
        seat: '통창 뷰 하이체어 바 좌석',
        mapQueries: ['공유오피스 라운지', '워크라운지', '대형 카페']
      }
    },
    high: {
      study: {
        category: '초고효율 집중 부스',
        name: '1인 독립형 프리미엄 스터디카페',
        emoji: '🎯',
        noise: '백색소음기만 흐르는 무소음',
        seat: '커튼/칸막이 있는 1인 집중실',
        mapQueries: ['스터디카페', '1인 스터디카페', '프리미엄 독서실']
      },
      work: {
        category: '딥워크 사령부',
        name: '집중 부스 & 듀얼급 데스크 스터디존',
        emoji: '🚀',
        noise: '극강의 몰입감',
        seat: '인체공학 의자 + 넓은 1인 노트북석',
        mapQueries: ['스터디카페 노트북존', '스터디카페', '공유오피스']
      },
      reading: {
        category: '깊은 사색의 공간',
        name: '조용한 북스테이형 대형 도서관 서가',
        emoji: '🏛️',
        noise: '숨소리까지 차분해지는 정적',
        seat: '책장 사이 프라이빗 1인 데스크',
        mapQueries: ['도서관', '북스테이 카페', '조용한 북카페']
      },
      creative: {
        category: '풀스피드 작업실',
        name: '1인 창작자용 프라이빗 워크 부스',
        emoji: '⚡',
        noise: '방해 요소 0% 완전 차단',
        seat: '화이트보드·스탠드 있는 1인실',
        mapQueries: ['1인 스터디카페', '프라이빗 공유오피스', '스터디룸']
      }
    }
  };

  // Time-of-day spot adjustments (especially night so spots are actually open!)
  const NIGHT_SPOT_OVERRIDES = {
    low: {
      category: '심야 홈 아지트',
      name: '새벽 감성 스탠드 켠 내 방 침대 옆 데스크',
      emoji: '🌙',
      noise: '고요한 새벽 공기',
      seat: '따뜻한 담요 두른 내 방 의자',
      isHomeSpot: true,
      mapQueries: ['24시 무인카페', '24시 편의점', '심야 디저트']
    },
    midLow: {
      category: '심야 영업 라운지',
      name: '24시 무인 카페 or 야간 영업 패스트푸드 2층',
      emoji: '🌃',
      noise: '한적한 새벽 백색소음',
      seat: '네온 야경 보이는 통창가 자리',
      mapQueries: ['24시 무인카페', '24시 카페', '24시 패스트푸드']
    },
    midHigh: {
      category: '24시간 카공 명당',
      name: '24시 오픈 라운지형 스터디카페 오픈존',
      emoji: '🦉',
      noise: '새벽까지 불 켜진 열정 분위기',
      seat: '카페처럼 트인 넓은 바 테이블',
      mapQueries: ['24시 스터디카페', '24시간 카페', '심야 카페']
    },
    high: {
      category: '새벽 초몰입 부스',
      name: '24시 프리미엄 1인 집중 스터디카페',
      emoji: '⚡',
      noise: '완벽한 새벽 적막',
      seat: '스탠드 조명 조절되는 1인 부스',
      mapQueries: ['24시 스터디카페', '24시 독서실', '무인 스터디카페']
    }
  };

  const DRINKS_BY_TIME = {
    morning: {
      high: '아이스 아메리카노 + 모닝 버터 크루아상',
      normal: '따뜻한 플랫화이트 + 미니 스콘',
      sleepy: '진한 더블샷 라떼 + 바나나 또는 초코 머핀',
      tired: '부드러운 오트 밀크티 + 따뜻한 토스트'
    },
    lunch: {
      high: '콜드브루 디카페인/오리지널 + 견과류 믹스',
      normal: '시원한 아샷추 또는 아이스 티 + 휘낭시에',
      sleepy: '상큼한 자몽에이드 + 달콤한 소금빵',
      tired: '따뜻한 유자 캐모마일티 + 마들렌 한 조각'
    },
    evening: {
      high: '깔끔한 드립커피 + 다크초콜릿 2조각',
      normal: '따뜻한 얼그레이 라떼 + 치즈케이크',
      sleepy: '시원한 레몬 탄산수 + 바삭한 프레즐',
      tired: '카페인 적은 페퍼민트티 + 따뜻한 허니브레드'
    },
    night: {
      high: '얼음 가득 제로 탄산 + 집중력 젤리',
      normal: '따뜻한 현미녹차 또는 디카페인 아메리카노',
      sleepy: '시원한 매실/레몬 아이스티 + 짭짤한 크래커',
      tired: '꿀 한 스푼 넣은 따뜻한 캐모마일티'
    }
  };

  const PLAYLISTS = {
    study: {
      low: {
        title: '잠들기 전 15분, 빗소리 & 잔잔한 피아노',
        genre: 'Ambient Piano · 65 BPM',
        tags: ['#빗소리ASMR', '#무자극', '#기초워밍업'],
        track: '예시 무드: Rainy Desk & Soft Felt Piano Loop'
      },
      midLow: {
        title: '부드럽게 암기되는 재즈 로파이(Lo-Fi) 믹스',
        genre: 'Jazz Lo-Fi · 80 BPM',
        tags: ['#백색소음조화', '#가사없음', '#로파이'],
        track: '예시 무드: Midnight Coffee & Dusty Vinyl Beats'
      },
      midHigh: {
        title: '집중력 200% 끌어올리는 스터디 인스트루멘탈',
        genre: 'Focus Instrumental · 96 BPM',
        tags: ['#가사없는노래', '#일정한박자', '#카공국룰'],
        track: '예시 무드: Crisp Acoustic Guitar & Study Bells'
      },
      high: {
        title: '잡념 차단! 딥 포커스 클래식 & 모던 피아노',
        genre: 'Modern Classical · 108 BPM',
        tags: ['#초몰입모드', '#시험직전', '#알파파'],
        track: '예시 무드: Minimalist Piano Etude for Deep Study'
      }
    },
    work: {
      low: {
        title: '손가락만 천천히 움직이는 칠(Chill) 어쿠스틱',
        genre: 'Acoustic Chill · 72 BPM',
        tags: ['#부담제로', '#따뜻한기타', '#회복작업'],
        track: '예시 무드: Lazy Afternoon Nylon Guitar'
      },
      midLow: {
        title: '코딩할 때 국룰, 감성 딥 로파이 힙합',
        genre: 'Chillhop / Lo-Fi · 88 BPM',
        tags: ['#코딩노동요', '#부드러운그루브', '#리듬타기'],
        track: '예시 무드: Late Compile & Warm Tape Synth'
      },
      midHigh: {
        title: '타자 속도 빨라지는 시티팝 & 신스웨이브 인스트',
        genre: 'City Pop / Synthwave · 112 BPM',
        tags: ['#타자속도UP', '#네온감성', '#마감요정'],
        track: '예시 무드: Tokyo Night Drive Instrumental'
      },
      high: {
        title: '마감 돌파! 하이템포 테크노·일렉트로닉 포커스',
        genre: 'Melodic Techno / Electronic · 126 BPM',
        tags: ['#마감치트키', '#논스톱딥워크', '#하드캐리'],
        track: '예시 무드: Hyperfocus Modular Pulse 126'
      }
    },
    reading: {
      low: {
        title: '벽난로 타닥이는 소리와 첼로 선율',
        genre: 'Chamber / ASMR · 60 BPM',
        tags: ['#벽난로ASMR', '#차분한독서', '#힐링'],
        track: '예시 무드: Warm Fireplace & Solo Cello'
      },
      midLow: {
        title: '책방 구석에서 흐르는 보사노바 & 재즈 발라드',
        genre: 'Bossa Nova / Jazz · 78 BPM',
        tags: ['#서점감성', '#나른한오후', '#다이어리'],
        track: '예시 무드: Sunday Bookstore Bossa'
      },
      midHigh: {
        title: '문장이 쏙쏙 들어오는 북유럽 감성 포크 연주곡',
        genre: 'Nordic Folk / Acoustic · 90 BPM',
        tags: ['#몰입독서', '#글쓰기', '#담백한사운드'],
        track: '예시 무드: Pine Forest Strings & Piano'
      },
      high: {
        title: '사색을 깊게 만드는 영화 OST 오케스트라 모음',
        genre: 'Cinematic Score · 98 BPM',
        tags: ['#영화감성', '#몰입감최고', '#완독도전'],
        track: '예시 무드: Quiet Horizon Film Suite'
      }
    },
    creative: {
      low: {
        title: '멍 때리다 아이디어 떠오르는 드림팝 인스트',
        genre: 'Dream Pop / Ambient · 76 BPM',
        tags: ['#멍때리기', '#몽환적', '#긴장해제'],
        track: '예시 무드: Floating Cloud Reverb Guitar'
      },
      midLow: {
        title: '감각 깨워주는 트렌디 R&B & 네오소울 비트',
        genre: 'Neo-Soul / R&B · 92 BPM',
        tags: ['#감각충전', '#트렌디', '#그루브'],
        track: '예시 무드: Velvet Rhodes & Neo-Soul Groove'
      },
      midHigh: {
        title: '기획안 술술 써지는 인디 일렉트로니카 믹스',
        genre: 'Indie Electronic · 115 BPM',
        tags: ['#영감폭발', '#리드미컬', '#아이디어'],
        track: '예시 무드: Bright Studio Pluck & Beat'
      },
      high: {
        title: '도파민 풀충전! 펑키 하우스 & 업비트 그루브',
        genre: 'Nu-Disco / House · 122 BPM',
        tags: ['#텐션최고', '#브레인스토밍', '#파워창작'],
        track: '예시 무드: Electric Canvas Funky House'
      }
    }
  };

  function buildRecommendation(battery, timeOfDay, taskType, condition) {
    const tier = getBatteryTier(battery);
    const timeInfo = LABELS.timeOfDay[timeOfDay];
    const taskInfo = LABELS.taskType[taskType];
    const condInfo = LABELS.condition[condition];

    // Choose spot (apply night-accessible override during 심야)
    let spot = { ...SPOTS_BY_TIER_TASK[tier.key][taskType] };
    if (timeOfDay === 'night') {
      const nightSpot = NIGHT_SPOT_OVERRIDES[tier.key];
      spot = {
        ...nightSpot,
        name:
          taskType === 'work' && tier.key !== 'low'
            ? `${nightSpot.name} (콘센트 필수!)`
            : nightSpot.name
      };
    }

    const drink = DRINKS_BY_TIME[timeOfDay][condition];

    // Shift playlist energy slightly if condition is tired/sleepy even with high battery
    let effectivePlaylistTier = tier.key;
    if (condition === 'tired' && (tier.key === 'high' || tier.key === 'midHigh')) {
      effectivePlaylistTier = 'midLow';
    } else if (condition === 'high' && tier.key === 'low') {
      effectivePlaylistTier = 'midLow';
    }
    const playlist = PLAYLISTS[taskType][effectivePlaylistTier];

    // Personalized friendly ment
    const mentTimePhrase = {
      morning: '상쾌한 아침부터',
      lunch: '나른해지기 쉬운 낮 시간에',
      evening: '하루를 알차게 마무리하는 저녁에',
      night: '모두가 잠든 고요한 심야에'
    }[timeOfDay];

    let mentMoodPhrase = '';
    if (condition === 'tired') {
      mentMoodPhrase = `번아웃 직전이라니 오늘 너무 무리하지 말자ㅠㅠ 배터리 ${battery}%면 천천히 가도 충분해 🫠🕯️`;
    } else if (condition === 'sleepy') {
      mentMoodPhrase = `배터리 ${battery}%에 출출하고 나른할 때지! 달달한 거 하나 챙겨서 기분 전환부터 해보자 ☕🍩`;
    } else if (condition === 'high') {
      mentMoodPhrase = `배터리 ${battery}%에 열정까지 풀충전이라니 오늘 폼 미쳤다🔥 이 텐션 그대로 ${taskInfo.text} 찢어버리자 ⚡🎧`;
    } else {
      mentMoodPhrase = `배터리 ${battery}%에 컨디션도 적당히 딱 좋네! ${mentTimePhrase} 기분 좋은 리듬으로 시작해보자 ✨🎧`;
    }

    const ment = `${mentTimePhrase} ${taskInfo.text} 하려는 거 너무 기특해 👏 ${mentMoodPhrase}`;

    // Short & fun recommendation reason
    let reasonParts = [];
    if (tier.key === 'low') {
      reasonParts.push(`지금 집중 배터리가 ${battery}%로 방전 직전이라, 억지로 딱딱한 곳에 가기보다 몸이 편한 공간에서 부담을 싹 빼는 게 핵심이야.`);
    } else if (tier.key === 'midLow') {
      reasonParts.push(`배터리 ${battery}%일 때는 적당한 카페 백색소음이 오히려 뇌를 깨워주는 최고의 부스터 역할을 해줘!`);
    } else if (tier.key === 'midHigh') {
      reasonParts.push(`배터리 ${battery}%로 안정적인 집중 궤도에 올라왔으니, 시선 분산 없이 쭉 밀고 나갈 수 있는 스팟이 딱이야.`);
    } else {
      reasonParts.push(`배터리 ${battery}%의 초몰입 타이밍! 지금 이 황금 집중력을 1%도 흘리지 않도록 방해 요소가 없는 환경으로 골랐어.`);
    }

    if (timeOfDay === 'night') {
      reasonParts.push(`게다가 심야 시간대라 실제로 늦게까지 문 열어둔 공간 위주로 매칭했고,`);
    } else if (timeOfDay === 'morning') {
      reasonParts.push(`아침 공기 마시며 하루 첫 스타트를 상쾌하게 끊을 수 있게 골랐고,`);
    } else if (timeOfDay === 'lunch') {
      reasonParts.push(`오후 식곤증이 오기 쉬운 시간대라 환기와 리듬감이 있는 조합으로 맞췄고,`);
    } else {
      reasonParts.push(`저녁 시간대의 차분한 무드를 살려서 퇴근·하교 후 몰입감을 높일 수 있게 골랐고,`);
    }

    if (condition === 'tired') {
      reasonParts.push(`지친 마음까지 토닥여줄 수 있도록 비트감이 너무 세지 않은 힐링 노동요('${playlist.genre}')로 온도를 낮춰줬어 🌿`);
    } else if (condition === 'sleepy') {
      reasonParts.push(`나른함을 날려줄 '${drink}'와 리드미컬한 선곡을 붙여서 잠깐 사이에 다시 집중 스위치가 켜질 거야! ⚡`);
    } else if (condition === 'high') {
      reasonParts.push(`열정 풀충전 컨디션에 맞춰 '${playlist.genre}' 박자에 올라타면 시간 가는 줄 모르고 목표치 끝낼 수 있을 거야 🚀`);
    } else {
      reasonParts.push(`'${taskInfo.text}' 작업 특성에 맞춘 좌석과 '${playlist.genre}' 사운드가 만나서 가장 기분 좋게 페이스를 유지해 줄 거야!`);
    }

    const AUDIO_STYLE_BY_TIER = {
      low: 'ambient',
      midLow: 'lofi',
      midHigh: 'upbeat',
      high: 'deep'
    };
    const audioStyle = AUDIO_STYLE_BY_TIER[effectivePlaylistTier] || 'lofi';

    return {
      tier,
      timeInfo,
      taskInfo,
      condInfo,
      ment,
      spot,
      drink,
      playlist,
      audioStyle,
      reason: reasonParts.join(' ')
    };
  }

  // Clear validation state on an individual fieldset when user picks an option
  function clearFieldsetError(fieldset) {
    fieldset.classList.remove('is-invalid');
    const radios = fieldset.querySelectorAll('input[type="radio"]');
    radios.forEach((r) => r.setAttribute('aria-invalid', 'false'));
  }

  function updateAlertBanner() {
    const missing = fieldsets.filter((fs) => {
      const fieldName = fs.dataset.field;
      return !form.querySelector(`input[name="${fieldName}"]:checked`);
    });

    if (missing.length === 0) {
      validationAlert.hidden = true;
      validationAlertText.textContent = '';
    } else if (!validationAlert.hidden) {
      const names = missing.map((fs) => fs.dataset.label).join(', ');
      validationAlertText.textContent = `${names} 항목을 아직 고르지 않았어! 선택하면 바로 추천해줄게.`;
    }
  }

  // Update Naver Map & Kakao Map search URLs based on selected keyword + optional region
  function updateMapLinks() {
    const region = mapRegionInput.value.trim();
    const baseKeyword = currentSelectedMapKeyword || '스터디카페';
    const fullQuery = region ? `${region} ${baseKeyword}` : baseKeyword;
    const encoded = encodeURIComponent(fullQuery);

    spotMapQueryPreview.textContent = `검색어: ${fullQuery}`;
    naverMapLink.href = `https://map.naver.com/p/search/${encoded}`;
    kakaoMapLink.href = `https://map.kakao.com/link/search/${encoded}`;
  }

  function renderMapSearchSection(spot) {
    spotMapTitle.textContent = spot.isHomeSpot
      ? '🏠 홈카페 준비물 · 동네 매장 찾기'
      : '📍 내 주변 실제 매장 찾기';

    const queries = Array.isArray(spot.mapQueries) && spot.mapQueries.length > 0
      ? spot.mapQueries
      : ['스터디카페', '조용한 카페', '대형 카페'];

    currentSelectedMapKeyword = queries[0];
    mapKeywordChips.replaceChildren();

    queries.forEach((keyword, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'map-keyword-chip';
      btn.textContent = `# ${keyword}`;
      btn.setAttribute('aria-pressed', String(idx === 0));
      btn.addEventListener('click', () => {
        currentSelectedMapKeyword = keyword;
        mapKeywordChips.querySelectorAll('.map-keyword-chip').forEach((chip) => {
          chip.setAttribute('aria-pressed', String(chip === btn));
        });
        updateMapLinks();
      });
      mapKeywordChips.appendChild(btn);
    });

    updateMapLinks();
  }

  // Event Listeners
  batterySlider.addEventListener('input', syncBatterySlider);
  mapRegionInput.addEventListener('input', updateMapLinks);

  fieldsets.forEach((fs) => {
    fs.addEventListener('change', () => {
      clearFieldsetError(fs);
      updateAlertBanner();
    });
  });

  startBtn.addEventListener('click', () => {
    showScreen('input');
  });

  backToIntroBtn.addEventListener('click', () => {
    showScreen('intro');
  });

  editBtn.addEventListener('click', () => {
    showScreen('input');
  });

  retryBtn.addEventListener('click', () => {
    form.reset();
    mapRegionInput.value = '';
    batterySlider.value = '50';
    syncBatterySlider();
    fieldsets.forEach(clearFieldsetError);
    validationAlert.hidden = true;
    validationAlertText.textContent = '';
    showScreen('input');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const missingFieldsets = [];
    fieldsets.forEach((fs) => {
      const fieldName = fs.dataset.field;
      const checked = form.querySelector(`input[name="${fieldName}"]:checked`);
      if (!checked) {
        missingFieldsets.push(fs);
        fs.classList.add('is-invalid');
        fs.querySelectorAll('input[type="radio"]').forEach((r) => r.setAttribute('aria-invalid', 'true'));
      } else {
        clearFieldsetError(fs);
      }
    });

    if (missingFieldsets.length > 0) {
      const missingLabels = missingFieldsets.map((fs) => fs.dataset.label).join(', ');
      validationAlertText.textContent = `${missingLabels} 항목을 선택해주세요! 빠진 부분을 알려줄게.`;
      validationAlert.hidden = false;

      const firstMissing = missingFieldsets[0];
      firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstRadio = firstMissing.querySelector('input[type="radio"]');
      if (firstRadio) {
        firstRadio.focus({ preventScroll: true });
      }
      return;
    }

    validationAlert.hidden = true;
    validationAlertText.textContent = '';

    const battery = Number(batterySlider.value);
    const timeOfDay = form.querySelector('input[name="timeOfDay"]:checked').value;
    const taskType = form.querySelector('input[name="taskType"]:checked').value;
    const condition = form.querySelector('input[name="condition"]:checked').value;

    const rec = buildRecommendation(battery, timeOfDay, taskType, condition);

    // Render summary chips safely via DOM API
    resultSummaryChips.replaceChildren();
    const chipTexts = [
      `${rec.tier.emoji} 배터리 ${battery}%`,
      `${rec.timeInfo.emoji} ${rec.timeInfo.text}`,
      `${rec.taskInfo.emoji} ${rec.taskInfo.text}`,
      `${rec.condInfo.emoji} ${rec.condInfo.text}`
    ];
    chipTexts.forEach((text) => {
      const span = document.createElement('span');
      span.className = 'summary-chip';
      span.textContent = text;
      resultSummaryChips.appendChild(span);
    });

    resultMent.textContent = rec.ment;
    resultSpotCategory.textContent = rec.spot.category;
    resultSpotName.textContent = rec.spot.name;
    resultSpotEmoji.textContent = rec.spot.emoji;
    resultSpotNoise.textContent = rec.spot.noise;
    resultSpotSeat.textContent = rec.spot.seat;
    resultSpotDrink.textContent = rec.drink;
    renderMapSearchSection(rec.spot);

    resultPlaylistTitle.textContent = rec.playlist.title;
    resultPlaylistGenre.textContent = rec.playlist.genre;
    resultPlaylistTrack.textContent = rec.playlist.track;
    currentAudioStyle = rec.audioStyle;
    WorkBGMPlayer.setStyle(currentAudioStyle);
    youtubeSearchLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.playlist.title + ' 플레이리스트')}`;

    resultPlaylistTags.replaceChildren();
    rec.playlist.tags.forEach((tag) => {
      const span = document.createElement('span');
      span.className = 'playlist-tag';
      span.textContent = tag;
      resultPlaylistTags.appendChild(span);
    });

    resultReason.textContent = rec.reason;

    showScreen('result');
  });

  audioToggleBtn.addEventListener('click', () => {
    WorkBGMPlayer.toggle(currentAudioStyle);
  });

  volumeSlider.addEventListener('input', () => {
    WorkBGMPlayer.setVolume(Number(volumeSlider.value));
  });

  // Initialize on load
  syncBatterySlider();
  form.querySelectorAll('input[type="radio"]').forEach((r) => r.setAttribute('aria-invalid', 'false'));
})();
