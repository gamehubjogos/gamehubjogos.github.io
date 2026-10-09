(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const gameKey = params.get('game') || '';
  const requestedVersion = params.get('version') || '';
  const titleEl = document.getElementById('gamePageTitle');
  const subtitleEl = document.getElementById('gamePageSubtitle');
  const cover = document.getElementById('gameCover');
  const coverImage = document.getElementById('gameCoverImage');
  const coverTitle = document.getElementById('gameCoverTitle');
  const mobileGate = document.getElementById('mobileGate');
  const mobileGateImage = document.getElementById('mobileGateImage');
  const stage = document.getElementById('gameStage');
  const showcase = document.getElementById('gameShowcase');
  const frame = document.getElementById('gameFrame');
  const status = document.getElementById('gameStatus');
  const playButton = document.getElementById('playButton');
  const minecraftChooser = document.getElementById('minecraftChooser');
  const mobileMinecraftChooser = document.getElementById('mobileMinecraftChooser');
  const mobileGateMessage = document.getElementById('mobileGateMessage');
  const mobilePlayButton = document.getElementById('mobilePlayButton');
  const relatedSection = document.getElementById('relatedSection');
  const relatedGames = document.getElementById('relatedGames');

  let currentGame = null;
  let selectedVersion = requestedVersion;
  let mobileStartRequested = false;
  let gameStarted = false;
  let frameReady = false;
  const embeddedLoadingGames = new Set(['Granny2', 'HollowKnight', 'HollowKnightSilksong', 'Celeste', 'Ultrakill', 'Karlson']);

  function keyFor(link) {
    return GameHubAssets.gameKey(link);
  }

  function assetPath(game, filename) {
    return String(game.ImageURL || '').startsWith('img/')
      ? game.ImageURL
      : GameHubAssets.gameAssetUrl(game.Link, filename || String(game.ImageURL || '').split('/').pop());
  }

  function setIcon(game) {
    const icon = document.querySelector('link[rel="icon"]');
    if (!icon) return;
    const configured = String(game.Favicon || '').trim();
    const candidates = configured ? [configured] : ['favicon.ico', 'favicon.png'];
    function tryCandidate(index) {
      if (index >= candidates.length) return;
      GameHubAssets.resolveGameAssetUrl(game.Link, candidates[index]).then(function (url) {
        const probe = new Image();
        probe.onload = function () {
          icon.href = url + (url.includes('?') ? '&' : '?') + 'v=7';
        };
        probe.onerror = function () { tryCandidate(index + 1); };
        probe.src = url + (url.includes('?') ? '&' : '?') + 'probe=1';
      }).catch(function () { tryCandidate(index + 1); });
    }
    tryCandidate(0);
  }

  function isMobileDevice() {
    return window.matchMedia('(max-width: 680px)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function isFullscreen() {
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
  }

  function requestFullscreen() {
    if (isFullscreen()) return Promise.resolve(true);
    const showcaseRequest = showcase.requestFullscreen || showcase.webkitRequestFullscreen || showcase.mozRequestFullScreen || showcase.msRequestFullscreen;
    const documentElement = document.documentElement;
    const documentRequest = documentElement.requestFullscreen || documentElement.webkitRequestFullscreen || documentElement.mozRequestFullScreen || documentElement.msRequestFullscreen;

    function callRequest(request, target) {
      if (!request) return Promise.resolve(false);
      try {
        return Promise.resolve(request.call(target, { navigationUI: 'hide' })).then(function () { return true; }).catch(function () { return false; });
      } catch (error) {
        return Promise.resolve(false);
      }
    }

    return callRequest(showcaseRequest, showcase).then(function (entered) {
      return entered ? true : callRequest(documentRequest, documentElement);
    });
  }

  function expectedOrientation() {
    return currentGame && currentGame.Orientation === 'portrait' ? 'portrait' : 'landscape';
  }
  function lockOrientation() {
    if (!isMobileDevice() || !screen.orientation || !screen.orientation.lock) return Promise.resolve(false);
    return screen.orientation.lock(expectedOrientation()).then(function () { return true; }).catch(function () { return false; });
  }
  function isLandscape() {
    const orientationType = screen.orientation && screen.orientation.type ? screen.orientation.type : '';
    return orientationType.indexOf('landscape') !== -1 || Boolean(window.matchMedia && window.matchMedia('(orientation: landscape)').matches) || window.innerWidth > window.innerHeight;
  }

  function isExpectedOrientation() {
    if (expectedOrientation() === 'portrait') {
      const orientationType = screen.orientation && screen.orientation.type ? screen.orientation.type : '';
      return orientationType.indexOf('portrait') !== -1 || Boolean(window.matchMedia && window.matchMedia('(orientation: portrait)').matches) || window.innerWidth <= window.innerHeight;
    }
    return isLandscape();
  }
  function requestMobileFullscreen() {
    if (!isMobileDevice()) return Promise.resolve(false);
    return requestFullscreen().then(function (entered) {
      if (entered && isFullscreen()) {
        // O iframe só aparece depois que o navegador confirma fullscreen.
        showcase.classList.add('is-fullscreen-mobile');
        mobileGate.hidden = true;
        stage.classList.add('is-active');
        return lockOrientation().then(function () { return entered; });
      }
      return entered;
    });
  }

  function showMobileGate() {
    if (!isMobileDevice()) return;
    document.body.classList.remove('is-playing', 'resume-required');
    mobileGate.hidden = false;
    const isMinecraft = currentGame && keyFor(currentGame.Link) === 'Minecraft';
    const hasMinecraftChooser = Boolean(isMinecraft && !selectedVersion);
    mobileGate.classList.toggle('is-minecraft-chooser', hasMinecraftChooser);
    showcase.classList.toggle('has-minecraft-chooser', hasMinecraftChooser);
    if (isMinecraft) {
      mobileGateMessage.textContent = selectedVersion ? 'Tap Play to enter fullscreen' : 'Choose a Minecraft version first';
      mobileMinecraftChooser.hidden = Boolean(selectedVersion);
    }
    mobilePlayButton.hidden = hasMinecraftChooser;
    mobilePlayButton.textContent = '▶  Play';
    showcase.classList.remove('is-fullscreen-mobile');
    stage.classList.remove('is-active');
  }

  function hideMobileGate() {
    mobileGate.hidden = true;
    document.body.classList.remove('resume-required');
    showcase.classList.add('is-fullscreen-mobile');
    stage.classList.add('is-active');
  }

  function showResumeGate() {
    if (!isMobileDevice() || !isExpectedOrientation() || isNativeFullscreenGame()) return;
    document.body.classList.add('is-playing', 'resume-required');
    mobileGate.hidden = false;
    mobileGate.classList.remove('is-minecraft-chooser');
    showcase.classList.remove('has-minecraft-chooser');
    mobileGateMessage.textContent = 'Tap Continue to return to fullscreen';
    mobileMinecraftChooser.hidden = true;
    mobilePlayButton.hidden = false;
    mobilePlayButton.textContent = '▶  Continue';
    showcase.classList.remove('is-fullscreen-mobile');
    stage.classList.remove('is-active');
  }

  function restoreAfterFullscreenExit() {
    if (!gameStarted) {
      if (isMobileDevice()) showMobileGate();
      return;
    }
    mobileStartRequested = false;
    if (isMobileDevice()) {
      [120, 450, 900].forEach(function (delay) {
        window.setTimeout(function () {
          if (!isFullscreen()) showResumeGate();
        }, delay);
      });
    }
  }

  function showError(message) {
    status.textContent = message;
    status.classList.remove('is-hidden', 'is-loading');
    status.classList.add('error');
  }

  function handleEmbeddedGameMessage(event) {
    if (!frame.contentWindow || event.source !== frame.contentWindow) return;
    const payload = event.data || {};
    if (payload.gamehub !== 'game-status') return;
    if (payload.state === 'ready') {
      frameReady = true;
      status.classList.remove('is-loading', 'error');
      status.classList.add('is-hidden');
      return;
    }
    if (payload.state === 'error') {
      showError(payload.message || 'Unable to load the game.');
    }
  }

  function loadCover(game) {
    coverTitle.textContent = game.Name;
    coverImage.alt = game.Name;
    const imagePath = String(game.ImageURL || '').startsWith('img/') ? game.ImageURL : String(game.ImageURL || '').split('/').pop();
    const applyImage = function (url) {
      coverImage.src = url;
      mobileGateImage.src = url;
      mobileGateImage.alt = game.Name;
      cover.style.setProperty('--cover-image', 'url("' + url.replace(/"/g, '\\"') + '")');
    };
    if (imagePath.startsWith('img/')) {
      applyImage(imagePath);
      return;
    }
    GameHubAssets.resolveGameAssetUrl(game.Link, imagePath).then(applyImage).catch(function () {
      coverImage.removeAttribute('src');
    });
  }

  function versionPathForGame(game) {
    if (keyFor(game.Link) !== 'Minecraft') return 'index.html';
    const allowed = new Set(['1.5.2.html', '1.8.8.html', '1.12.2.html', '1.26.2.html']);
    return allowed.has(selectedVersion) ? selectedVersion : '';
  }

  function renderRelated(catalog, activeCategory) {
    const candidates = (activeCategory.games || []).filter(function (game) {
      return keyFor(game.Link) !== gameKey;
    });
    for (let index = candidates.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      const temporary = candidates[index];
      candidates[index] = candidates[randomIndex];
      candidates[randomIndex] = temporary;
    }
    const selectedGames = candidates.slice(0, 6);
    if (!selectedGames.length) return;
    relatedGames.innerHTML = selectedGames.map(function (game) {
      const filename = String(game.ImageURL || '').split('/').pop();
      const source = String(game.ImageURL || '').startsWith('img/') ? game.ImageURL : GameHubAssets.gameAssetUrl(game.Link, filename);
      const href = game.ExternalURL || ('play.html?game=' + encodeURIComponent(keyFor(game.Link)));
      const externalAttrs = game.ExternalURL ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a class="related-card" href="' + href + '"' + externalAttrs + '><img src="' + source + '" alt="' + game.Name.replace(/"/g, '&quot;') + '" loading="lazy"><span>' + game.Name + '</span></a>';
    }).join('');
    relatedSection.hidden = false;
  }

  function launchGame() {
    if (gameStarted || !currentGame) return;
    if (currentGame.ExternalURL) {
      window.location.href = currentGame.ExternalURL;
      return;
    }
    const path = versionPathForGame(currentGame);
    const activeGameKey = keyFor(currentGame.Link);
    const waitsForGameReady = embeddedLoadingGames.has(activeGameKey);
    const hasEmbeddedLoading = true;
    cover.style.display = 'none';
    stage.classList.add('is-active');
    frameReady = false;
    status.textContent = hasEmbeddedLoading ? 'Loading game files...' : 'Loading game...';
    status.classList.remove('is-hidden', 'error');
    status.classList.toggle('is-loading', hasEmbeddedLoading);
    gameStarted = true;
    document.body.classList.add('is-playing');
    GameHubAssets.resolveGameAssetUrl(currentGame.Link, path).then(function (url) {
      frame.addEventListener('load', function () {
        if (waitsForGameReady && !frameReady) {
          status.textContent = 'Loading game files...';
          return;
        }
        status.classList.add('is-hidden');
      }, { once: true });
      const frameUrl = activeGameKey === 'CookieClicker'
        ? url + (url.includes('?') ? '&' : '?') + 'gamehub=1'
        : url;
      frame.src = frameUrl;
      if (activeGameKey === 'Minecraft' && path !== 'index.html') {
        const versionLabel = path === '1.26.2.html' ? '1.26.2' : path.replace('.html', '');
        titleEl.textContent = currentGame.Name + ' ' + versionLabel;
        document.title = titleEl.textContent + ' - GameHub';
      }
    }).catch(function () { showError('Unable to load the game.'); });
  }

  function isNativeFullscreenGame() {
    return keyFor(currentGame && currentGame.Link) === 'Balatro';
  }

  function startGame() {
    if (!currentGame) return;
    const path = versionPathForGame(currentGame);
    if (keyFor(currentGame.Link) === 'Minecraft' && !path) {
      playButton.hidden = true;
      minecraftChooser.hidden = false;
      return;
    }
    if (isMobileDevice() && !isNativeFullscreenGame()) {
      if (keyFor(currentGame.Link) === 'Minecraft' && !selectedVersion) {
        mobileGateMessage.textContent = 'Choose a Minecraft version first';
        mobileGate.classList.add('is-minecraft-chooser');
        showcase.classList.add('has-minecraft-chooser');
        mobileMinecraftChooser.hidden = false;
        return;
      }
      mobileStartRequested = true;
      requestMobileFullscreen().then(function (entered) {
        if (entered && !gameStarted) launchGame();
      });
      return;
    }

    // Keep the browser on GameHub on every device. The game's own index.html
    // is resolved by the provider and executed inside the embedded frame.
    mobileStartRequested = false;
    launchGame();
  }

  window.addEventListener('message', handleEmbeddedGameMessage);
  mobilePlayButton.addEventListener('click', function (event) {
    event.stopPropagation();
    if (keyFor(currentGame.Link) === 'Minecraft' && !selectedVersion) {
      mobileGateMessage.textContent = 'Choose a Minecraft version first';
      mobileGate.classList.add('is-minecraft-chooser');
      showcase.classList.add('has-minecraft-chooser');
      mobilePlayButton.hidden = true;
      mobileMinecraftChooser.hidden = false;
      return;
    }
    if (isNativeFullscreenGame()) {
      mobileStartRequested = false;
      hideMobileGate();
      if (!gameStarted) launchGame();
      return;
    }
    mobileStartRequested = true;
    requestMobileFullscreen().then(function (entered) {
      if (entered) {
        hideMobileGate();
        if (!gameStarted) launchGame();
      }
    });
  });
  frame.addEventListener('pointerdown', function () {
    if (isMobileDevice() && !isNativeFullscreenGame() && !isFullscreen()) showResumeGate();
  });
  frame.addEventListener('touchstart', function () {
    if (isMobileDevice() && !isNativeFullscreenGame() && !isFullscreen()) showResumeGate();
  }, { passive: true });
  document.addEventListener('fullscreenchange', function () {
    if (isFullscreen()) {
      if (isMobileDevice() && !isNativeFullscreenGame()) {
        hideMobileGate();
        lockOrientation();
      }
      if (mobileStartRequested && !gameStarted) launchGame();
    } else {
      restoreAfterFullscreenExit();
    }
  });
  document.addEventListener('webkitfullscreenchange', function () {
    document.dispatchEvent(new Event('fullscreenchange'));
  });
  function checkMobileResumeState() {
    if (gameStarted && isMobileDevice() && !isNativeFullscreenGame() && !isFullscreen() && isExpectedOrientation()) showResumeGate();
  }
  window.setInterval(checkMobileResumeState, 500);
  window.addEventListener('orientationchange', function () { [180, 500, 900].forEach(function (delay) { window.setTimeout(checkMobileResumeState, delay); }); });
  window.addEventListener('resize', function () { window.setTimeout(checkMobileResumeState, 180); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') window.setTimeout(checkMobileResumeState, 180);
  });

  cover.addEventListener('click', function (event) {
    if (event.target.closest('#minecraftChooser')) return;
    if (!playButton.hidden) startGame();
  });
  playButton.addEventListener('click', startGame);
  document.querySelectorAll('[data-minecraft-version]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      selectedVersion = button.getAttribute('data-minecraft-version');
      minecraftChooser.hidden = true;
      mobileMinecraftChooser.hidden = true;
      mobileGate.classList.remove('is-minecraft-chooser');
      showcase.classList.remove('has-minecraft-chooser');
      if (isMobileDevice()) {
        mobileGateMessage.textContent = expectedOrientation() === 'portrait' ? 'Keep your phone upright or tap to play' : 'Rotate your phone or tap to play';
        mobileStartRequested = true;
        if (!gameStarted) launchGame();
        requestMobileFullscreen();
      } else {
        startGame();
      }
    });
  });

  if (!gameKey || !window.GameHubAssets) {
    showError('Game not found.');
    return;
  }

  fetch('games.json', { cache: 'no-cache' })
    .then(function (response) {
      if (!response.ok) throw new Error('catalog');
      return response.json();
    })
    .then(function (catalog) {
      let activeCategory = null;
      catalog.categories.some(function (category) {
        currentGame = category.games.find(function (candidate) { return keyFor(candidate.Link) === gameKey; }) || null;
        if (currentGame) activeCategory = category;
        return Boolean(currentGame);
      });
      if (!currentGame) throw new Error('game');
      titleEl.textContent = currentGame.Name;
      document.title = currentGame.Name + ' - GameHub';
      subtitleEl.textContent = 'Play instantly in GameHub';
      setIcon(currentGame);
      loadCover(currentGame);
      const mobile = isMobileDevice();
      showcase.classList.toggle('is-mobile-device', mobile);
      if (mobile) {
        showMobileGate();
      } else if (keyFor(currentGame.Link) === 'Minecraft' && !selectedVersion) {
        // Minecraft keeps its version selector because its asset folder has no default index.html.
        playButton.hidden = true;
        minecraftChooser.hidden = false;
      } else {
        // Desktop has no intermediate cover or Play menu: load the real game entrypoint immediately.
        launchGame();
      }
      renderRelated(catalog, activeCategory);
    })
    .catch(function () { showError('Unable to load this game.'); });
})();
