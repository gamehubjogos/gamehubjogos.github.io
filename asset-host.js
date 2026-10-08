(function (global) {
  'use strict';

  const providerHosts = {
    vercel: {
      gamefiles01: 'https://gamefiles01.vercel.app',
      gamefiles02: 'https://gamefiles02.vercel.app',
      gamefiles03: 'https://gamefiles03.vercel.app',
      gamefiles04: 'https://gamefiles04.vercel.app'
    },
    render: {
      gamefiles01: 'https://gamefiles01.onrender.com',
      gamefiles02: 'https://gamefiles02.onrender.com',
      gamefiles03: 'https://gamefiles03.onrender.com',
      gamefiles04: 'https://gamefiles04.onrender.com'
    },
    githubPages: {
      gamefiles01: 'https://gamehubjogosfiles.github.io/gamefiles01',
      gamefiles02: 'https://gamehubjogosfiles.github.io/gamefiles02',
      gamefiles03: 'https://gamehubjogosfiles.github.io/gamefiles03',
      gamefiles04: 'https://gamehubjogosfiles.github.io/gamefiles04'
    }
  };

  const repositoryByGame = {
    Peak: 'gamefiles04',
    SpaceflightSimulator: 'gamefiles03',
    KerbalSpaceProgram: 'gamefiles04', StardewValley: 'gamefiles04', Granny3: 'gamefiles04',
    GangBeasts: 'gamefiles04',
    PizzaTower: 'gamefiles03',
    HollowKnightSilksong: 'gamefiles01', Cuphead: 'gamefiles01', Balatro: 'gamefiles01',
    CookieClicker: 'gamefiles01', BaldiRemastered: 'gamefiles01', Antonblast: 'gamefiles03', Brotato: 'gamefiles03', ButchersAround: 'gamefiles03', Slendytubbies: 'gamefiles03', Slendytubbies2: 'gamefiles03', Slendytubbies2D: 'gamefiles03', SoccerRandom: 'gamefiles01',
    RocketGoal: 'gamefiles01', BasketRandom: 'gamefiles01', VolleyRandom: 'gamefiles01',
    FootballLegends: 'gamefiles01', BoxingRandom: 'gamefiles01', Fnaf_4: 'gamefiles01',
    HollowKnight: 'gamefiles02', Celeste: 'gamefiles02', Fnaf_Sister_Location: 'gamefiles02',
    GettingOverIt: 'gamefiles02', Granny1: 'gamefiles02', BuckshotRoulette: 'gamefiles02', Undertale: 'gamefiles02',
    Fnaf_1: 'gamefiles03', Fnaf_2: 'gamefiles03', Fnaf_3: 'gamefiles03', Fnaf_Ultimate_Custom_Night: 'gamefiles03', ADGAC: 'gamefiles03',
    Repo: 'gamefiles03', Granny2: 'gamefiles03', Funkin: 'gamefiles03', GeometryDash: 'gamefiles03',
    PvZ: 'gamefiles03', '20MinutesTillDawn': 'gamefiles03', SubwaySurfers: 'gamefiles03', HappyWheels: 'gamefiles03',
    LevelDevil: 'gamefiles03', Minecraft: 'gamefiles03', CrazyCattle3D: 'gamefiles03',
    BadPiggies: 'gamefiles03', MuddyHeights: 'gamefiles03', 2048: 'gamefiles03',
    TheVisitor: 'gamefiles03', SnailBob: 'gamefiles03', SnailBob2: 'gamefiles03', SnailBob3: 'gamefiles03',
    SnailBob4: 'gamefiles03', SnailBob5: 'gamefiles03', SnailBob6: 'gamefiles03', SnailBob7: 'gamefiles03',
    SnailBob8: 'gamefiles03', PapasPizzeria: 'gamefiles03', PapasFreezeria: 'gamefiles03', PapasBurgeria: 'gamefiles03',
    PapasPastaria: 'gamefiles03', AngryBirds1: 'gamefiles03', Bloxorz: 'gamefiles03', TheRightMix: 'gamefiles03',
    DuckLife1: 'gamefiles03', DuckLife2: 'gamefiles03', DuckLife3: 'gamefiles03', DuckLife4: 'gamefiles03',
    DuckLife5: 'gamefiles03', SonicCD: 'gamefiles03', SonicMania: 'gamefiles03', Terraria: 'gamefiles03', FireboyAndWatergirl: 'gamefiles03', FireboyAndWatergirl2: 'gamefiles03',
    FireboyAndWatergirl3: 'gamefiles03', FireboyAndWatergirl4: 'gamefiles03', FireboyAndWatergirl5: 'gamefiles03',
    FireboyAndWatergirl6: 'gamefiles03', TankTrouble: 'gamefiles03', Wrassling: 'gamefiles03', BadIceCream: 'gamefiles03',
    BasketballLegends: 'gamefiles03', ClassicPoolGame: 'gamefiles03', Foosball: 'gamefiles03', MotoX3M: 'gamefiles03',
    MotoX3M2: 'gamefiles03', MotoX3MPoolParty: 'gamefiles03', MotoX3MSpookyLand: 'gamefiles03', MotoX3MWinter: 'gamefiles03'
  };

  const providerCache = Object.create(null);
  const healthPathByRepository = {
    gamefiles01: 'HollowKnightSilksong/index.html',
    gamefiles02: 'HollowKnight/index.html',
    gamefiles03: 'Granny2/index.html',
    gamefiles04: 'Peak/index.html'
  };

  function currentProvider() {
    const hostname = String(global.location && global.location.hostname || '').toLowerCase();
    if (hostname.endsWith('.github.io')) return 'githubPages';
    return hostname.endsWith('.onrender.com') || hostname.includes('render') ? 'render' : 'vercel';
  }

  function gameKey(link) {
    return String(link || '').replace(/^\/+|\/+$/g, '').split('/')[0];
  }

  function repositoryFor(link) {
    return repositoryByGame[gameKey(link)] || 'gamefiles03';
  }

  function hostFor(provider, repository) {
    return providerHosts[provider][repository];
  }

  function assetUrlFor(provider, link, relativePath) {
    const repository = repositoryFor(link);
    const game = gameKey(link);
    const relative = String(relativePath || 'index.html').replace(/^\/+/, '');
    return `${hostFor(provider, repository)}/${game}/${relative}`;
  }

  function gameAssetUrl(link, relativePath) {
    return assetUrlFor(currentProvider(), link, relativePath);
  }

  function pingProvider(provider, repository) {
    const controller = new AbortController();
    const timeout = global.setTimeout(function () { controller.abort(); }, 5000);
    return fetch(`${hostFor(provider, repository)}/${healthPathByRepository[repository]}?ping=${Date.now()}`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      signal: controller.signal
    }).then(function (response) {
      return response.ok;
    }).catch(function () {
      return false;
    }).finally(function () {
      global.clearTimeout(timeout);
    });
  }

  function resolveProvider(repository) {
    const preferred = currentProvider();
    const cacheKey = `${preferred}:${repository}`;
    if (providerCache[cacheKey]) return providerCache[cacheKey];
    if (preferred === 'githubPages') {
      providerCache[cacheKey] = Promise.resolve('githubPages');
      return providerCache[cacheKey];
    }
    if (preferred !== 'render') {
      providerCache[cacheKey] = Promise.resolve('vercel');
      return providerCache[cacheKey];
    }
    providerCache[cacheKey] = pingProvider('render', repository).then(function (healthy) {
      return healthy ? 'render' : 'vercel';
    });
    return providerCache[cacheKey];
  }

  function resolveGameAssetUrl(link, relativePath) {
    // These large ports are available on Render while their Vercel deployments
    // are still building; keep them playable on the Vercel portal too.
    if (['GangBeasts', 'SonicMania', 'Eaglercraft1262', 'Granny3', 'StardewValley'].includes(gameKey(link)) && currentProvider() === 'vercel') {
      return Promise.resolve(assetUrlFor('render', link, relativePath));
    }
    return resolveProvider(repositoryFor(link)).then(function (provider) {
      return assetUrlFor(provider, link, relativePath);
    });
  }

  function gamePageUrl(link) {
    return `play.html?game=${encodeURIComponent(gameKey(link))}`;
  }

  global.GameHubAssets = { currentProvider, gameKey, repositoryFor, gameAssetUrl, resolveGameAssetUrl, resolveProvider, gamePageUrl, providerHosts, repositoryByGame };
})(window);
