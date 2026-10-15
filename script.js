let gamesData = [];
let currentCategory = 'all';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('footerYear');
    if (yearSpan) yearSpan.textContent = `GAMEHUB © ${new Date().getFullYear()}`;

    fetch('games.json')
        .then(res => res.json())
        .then(data => {
            gamesData = data.categories;
            initCategories();
            renderGames('all');
        })
        .catch(err => console.error('Error:', err));
});

function initCategories() {
    const nav = document.getElementById('categoriesNav');
    if (!nav) return;
    
    nav.innerHTML = '';
    
    // All
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => filterCategory('all', allBtn);
    nav.appendChild(allBtn);
    
    // Others
    gamesData.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = cat.name;
        btn.onclick = () => filterCategory(cat.id, btn);
        nav.appendChild(btn);
    });
}

function filterCategory(id, btn) {
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = id;
    document.getElementById('searchInput').value = '';
    renderGames(id);
}

function renderGames(catId) {
    const container = document.getElementById('gamesContainer');
    if (!container) return;
    container.innerHTML = '';

    if (catId === 'all') {
        gamesData.forEach(cat => renderSection(container, cat));
    } else {
        const cat = gamesData.find(c => c.id === catId);
        if (cat) renderSection(container, cat);
    }
}

function renderSection(container, cat) {
    const section = document.createElement('div');
    section.className = 'category-section';
    
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = cat.name;
    
    const grid = document.createElement('div');
    grid.className = 'games-grid';
    
    cat.games.forEach(game => {
        const card = document.createElement('a');
        // Local games stay in GameHub; external games open their official web port.
        card.href = game.ExternalURL || (window.GameHubAssets
            ? GameHubAssets.gamePageUrl(game.Link)
            : `play.html?game=${encodeURIComponent(String(game.Link || '').replace(/^\/+|\/+$/g, '').split('/')[0])}`);
        if (game.ExternalURL) {
            card.target = '_blank';
            card.rel = 'noopener noreferrer';
        }
        card.className = 'game-card';
        const imagePath = String(game.ImageURL || '').startsWith('img/')
            ? game.ImageURL
            : (window.GameHubAssets ? GameHubAssets.gameAssetUrl(game.Link, game.ImageURL.split('/').pop()) : game.ImageURL);
        card.innerHTML = `
            <div class="game-card-image">
            <img src="${imagePath}" alt="${game.Name}" loading="lazy" decoding="async" width="480" height="300">
            </div>
            <div class="game-card-content">
                <span class="game-card-name">${game.Name}</span>
                ${game.MobileFriendly ? '<img src="img/mobile-icon.webp" class="mobile-icon" alt="M">' : ''}
            </div>
        `;
        grid.appendChild(card);
        if (window.GameHubAssets && !String(game.ImageURL || '').startsWith('img/')) {
            const image = card.querySelector('.game-card-image img');
            GameHubAssets.resolveGameAssetUrl(game.Link, game.ImageURL.split('/').pop())
                .then(url => { image.src = url; })
                .catch(() => {});
        }
    });
    
    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
}

// Search
document.getElementById('searchInput').oninput = (e) => {
    const term = e.target.value.toLowerCase();
    const container = document.getElementById('gamesContainer');
    if (!term) {
        renderGames(currentCategory);
        return;
    }

    container.innerHTML = '';
    gamesData.forEach(cat => {
        const matches = cat.games.filter(g => g.Name.toLowerCase().includes(term));
        if (matches.length > 0) {
            renderSection(container, { name: cat.name, games: matches });
        }
    });
};

// Logo link
document.getElementById('logoLink').onclick = () => {
    location.reload();
};
