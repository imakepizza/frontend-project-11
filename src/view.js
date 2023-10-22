
  const renderFeeds = (elements, state, i18nT) => {
  const { feeds } = elements;
  feeds.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nT('feeds');

  cardBody.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounder-0');

  state.data.feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const listItemTitle = document.createElement('h3');
    listItemTitle.classList.add('h6', 'm-0');
    listItemTitle.textContent = feed.title;

    const listItemDescription = document.createElement('p');
    listItemDescription.classList.add('m-0', 'small', 'text-black-50');
    listItemDescription.textContent = feed.description;

    listItem.append(listItemTitle, listItemDescription);

    cardList.prepend(listItem);
  });

  card.append(cardBody, cardList);

  feeds.append(card);
};

const renderPosts = (elements, state, i18nT) => {
  const { posts } = elements;
  posts.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nT('posts');

  cardBody.append(cardTitle);

  const cardList = document.createElement('ul');
  cardList.classList.add('list-group', 'border-0', 'rounder-0');

  state.data.posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    
    const listItemLink = document.createElement('a');
    listItemLink.href = post.link;
    listItemLink.classList.add(state.uiState.visitedIds.includes(post.id) ? ('fw-normal', 'link-secondary') : 'fw-bold');
    listItemLink.setAttribute('data-id', post.id);
    listItemLink.target = '_blank';
    listItemLink.rel = 'noopener noreferrer';
    listItemLink.textContent = post.title;

    const listItemButton = document.createElement('button');
    listItemButton.type = 'button';
    listItemButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    listItemButton.setAttribute('data-id', post.id);
    listItemButton.setAttribute('data-bs-toggle', 'modal');
    listItemButton.setAttribute('data-bs-target', '#modal');
    listItemButton.textContent = i18nT('preview');

    listItem.append(listItemLink, listItemButton);

    cardList.append(listItem);
  });

  card.append(cardBody, cardList);

  posts.append(card);
};
const renderModal = (elements, state, modalId) => {
   const post = state.data.posts.find(({ id }) => id === modalId);
  console.log(modalId)
  const { title, description, link } = post;

  elements.modal.title.textContent = title;
  elements.modal.body.textContent = description;
  elements.modal.button.href = link;
};
  const handleFillingForm = (elements, state, i18nT) => {
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = '';
};
const handleFailedForm = (elements, state, i18nT) => {
  elements.button.disabled = false
  elements.input.disabled = false;
  elements.input.focus();
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');
  console.log(state.form.error)
  elements.feedback.textContent = i18nT(`errors.${state.form.error}`);
}
const handleCompleteForm= (elements, state, i18nT) => {
  elements.button.disabled = false
  elements.input.disabled = false;
  elements.input.focus();
  elements.input.value = '';
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = i18nT('success');
  renderFeeds(elements, state, i18nT);
  renderPosts(elements, state, i18nT);
}
const handleSendingForm = (elements) => {
  elements.button.disabled = true;
  elements.input.disabled = true;
};

const handleFormProcess = (elements, state, formProcess, i18nT) => {
  switch (formProcess) {
    case 'filling':
      handleFillingForm(elements);
      break;
    case 'sending':
      handleSendingForm(elements);
      break;
    case 'complete':
      handleCompleteForm(elements, state, i18nT);
      break;
    case 'failed':
      handleFailedForm(elements, state, i18nT);
      break;
    default:
      break;
  }
};

const render = (elements, state, i18nT) => (path, value) => {
  switch (path) {
    case 'form.process':
      handleFormProcess(elements, state, value, i18nT);
      break;
    case 'data.posts':
    case 'uiState.visitedIds':
      renderPosts(elements, state, i18nT);
      break;
    case 'uiState.modalId':
      renderModal(elements, state, value);
      break;
    default:
      break;
  }
};

export default render;