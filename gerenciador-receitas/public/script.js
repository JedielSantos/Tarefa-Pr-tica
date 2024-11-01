// Seleciona elementos do DOM
const recipeForm = document.getElementById('recipeForm');
const recipeList = document.getElementById('recipes');

let editingRecipeId = null; // Variável para armazenar o ID da receita em edição

// Função para buscar e listar as receitas
async function getRecipes() {
  const response = await fetch('/receitas');
  const recipes = await response.json();
  renderRecipes(recipes);
}

// Função para renderizar a lista de receitas
function renderRecipes(recipes) {
  recipeList.innerHTML = '';
  recipes.forEach(recipe => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${recipe.nome} - ${recipe.tipo} (Ingredientes: ${recipe.ingredientes.join(', ')})</span>
      <button onclick="editRecipe(${recipe.id})">Editar</button>
      <button onclick="deleteRecipe(${recipe.id})">Deletar</button>
    `;
    recipeList.appendChild(li);
  });
}

// Função para adicionar ou editar uma receita
recipeForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const ingredientes = document.getElementById('ingredientes').value.split(',').map(item => item.trim());
  const tipo = document.getElementById('tipo').value;

  if (editingRecipeId) {
    // Atualizar receita existente
    await fetch(`/receitas/${editingRecipeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, ingredientes, tipo }),
    });
    editingRecipeId = null; // Limpa o ID após edição
    recipeForm.querySelector('button').textContent = 'Adicionar Receita'; // Restaura o texto do botão
  } else {
    // Adicionar nova receita
    await fetch('/receitas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome, ingredientes, tipo }),
    });
  }

  recipeForm.reset();
  getRecipes();
});

// Função para iniciar a edição de uma receita
async function editRecipe(id) {
  const response = await fetch(`/receitas/${id}`);
  const recipe = await response.json();

  // Preenche o formulário com os dados da receita
  document.getElementById('nome').value = recipe.nome;
  document.getElementById('ingredientes').value = recipe.ingredientes.join(', ');
  document.getElementById('tipo').value = recipe.tipo;
  editingRecipeId = id; // Define o ID da receita que está sendo editada
  recipeForm.querySelector('button').textContent = 'Salvar Alterações'; // Altera o texto do botão para indicar o modo de edição
}

// Função para deletar uma receita
async function deleteRecipe(id) {
  await fetch(`/receitas/${id}`, {
    method: 'DELETE',
  });
  getRecipes();
}

// Carrega as receitas ao carregar a página
getRecipes();