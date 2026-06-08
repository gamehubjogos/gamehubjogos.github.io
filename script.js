let gamesData = [];
let currentCategory = 'all';

// Definir o ano atual no rodapé
document.getElementById('footerYear').textContent = `GAMEHUB © ${new Date().getFullYear()}`;

// Carregar dados do games.json
fetch('games.json')
    .then(response => response.json())
    .then(data => {
        gamesData = data.categories;
        initializeCategories();
        renderGames('all');
    })
    .catch(error => {
        console.error('Erro ao carregar games.json:', error);
        document.getElementById('gamesContainer').innerHTML = '<p>Erro ao carregar jogos.</p>';
    });

// Inicializar botões de categorias
function initializeCategories() {
    const categoriesNav = document.getElementById('categoriesNav');
    
    // Limpar todos os botões
    categoriesNav.innerHTML = '';
    
    // Criar botão "Todos"
    const todosButton = document.createElement('button');
    todosButton.className = 'category-btn active';
    todosButton.textContent = 'Todos';
    todosButton.dataset.category = 'all';
    
    todosButton.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        todosButton.classList.add('active');
        currentCategory = 'all';
        document.getElementById('searchInput').value = '';
        renderGames('all');
    });
    
    categoriesNav.appendChild(todosButton);
    
    // Criar botões para cada categoria
    gamesData.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-btn';
        button.textContent = category.name;
        button.dataset.category = category.id;
        
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = category.id;
            document.getElementById('searchInput').value = '';
            renderGames(category.id);
        });
        
        categoriesNav.appendChild(button);
    });
}

// Renderizar jogos
function renderGames(categoryId) {
    const container = document.getElementById('gamesContainer');
    container.innerHTML = '';

    if (categoryId === 'all') {
        // Mostrar todas as categorias
        gamesData.forEach(category => {
            renderCategory(container, category);
        });
    } else {
        // Mostrar apenas uma categoria
        const category = gamesData.find(cat => cat.id === categoryId);
        if (category) {
            renderCategory(container, category);
        }
    }
}

// Renderizar uma categoria específica
function renderCategory(container, category) {
    const section = document.createElement('div');
    section.className = 'category-section';

    const title = document.createElement('h2');
    title.className = 'category-title';
    title.textContent = category.name;

    const grid = document.createElement('div');
    grid.className = 'games-grid';

    category.games.forEach(game => {
        const card = createGameCard(game);
        grid.appendChild(card);
    });

    section.appendChild(title);
    section.appendChild(grid);
    container.appendChild(section);
}

// Criar card de jogo
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';

    const imageDiv = document.createElement('div');
    imageDiv.className = 'game-card-image';

    const img = document.createElement('img');
    img.src = game.ImageURL;
    img.alt = game.Name;

    const overlay = document.createElement('div');
    overlay.className = 'game-card-overlay';

    const playBtn = document.createElement('button');
    playBtn.className = 'play-btn';
    playBtn.textContent = 'Jogar';
    playBtn.addEventListener('click', () => {
        window.open(game.Link, '_blank');
    });

    overlay.appendChild(playBtn);
    imageDiv.appendChild(img);
    imageDiv.appendChild(overlay);

    const content = document.createElement('div');
    content.className = 'game-card-content';

    const name = document.createElement('div');
    name.className = 'game-card-name';
    name.textContent = game.Name;

    content.appendChild(name);
    card.appendChild(imageDiv);
    card.appendChild(content);

    return card;
}

// Funcionalidade de clique no logo para voltar para "Todos"
document.getElementById('logoLink').addEventListener('click', () => {
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    const todosBtn = document.querySelector('[data-category="all"]');
    if (todosBtn) {
        todosBtn.classList.add('active');
    }
    currentCategory = 'all';
    document.getElementById('searchInput').value = '';
    renderGames('all');
});

// Funcionalidade de busca
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const container = document.getElementById('gamesContainer');
    
    if (searchTerm === '') {
        renderGames(currentCategory);
        return;
    }

    container.innerHTML = '';

    // Filtrar jogos de todas as categorias
    gamesData.forEach(category => {
        const filteredGames = category.games.filter(game =>
            game.Name.toLowerCase().includes(searchTerm)
        );

        if (filteredGames.length > 0) {
            const section = document.createElement('div');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category.name;

            const grid = document.createElement('div');
            grid.className = 'games-grid';

            filteredGames.forEach(game => {
                const card = createGameCard(game);
                grid.appendChild(card);
            });

            section.appendChild(title);
            section.appendChild(grid);
            container.appendChild(section);
        }
    });

    // Se nenhum jogo foi encontrado
    if (container.children.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #a3a3a3; padding: 2rem;">Nenhum jogo encontrado.</p>';
    }
});
