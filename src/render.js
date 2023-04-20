const createFeeds = (state) => {
  const feeds = [];
  state.feeds.forEach((feed) => {
    const li = document.createElement('li');
    const feedName = document.createElement('h3');
    const feedDescription = document.createElement('p');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedName.classList.add('h6', 'm-0');
    feedName.textContent = feed.title;
    feedDescription.classList.add('m-0', 'small', 'text-black-50');
    feedDescription.textContent = feed.description;
    li.append(feedName, feedDescription);
    feeds.push(li);
  });
  return feeds;
};

const createPosts = (state, i18nInstance) => {
  const posts = [];
  state.posts.forEach((post) => {
    const li = document.createElement('li');
    const postLink = document.createElement('a');
    const btn = document.createElement('button');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    postLink.classList.add('fw-bold');
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('data-id', post.id);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.textContent = post.title;
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-id', post.id);
    btn.setAttribute('data-bs-toogle', 'modal');
    btn.setAttribute('data-bs-target', '#modal');
    btn.textContent = i18nInstance.t('items.postButton');
    li.append(postLink);
    li.append(btn);
    posts.push(li);
  });
  return posts;
};

const createList = (type, state, i18nInstance) => {
  const cardBorderZero = document.createElement('div');
  const cardBody = document.createElement('div');
  const list = document.createElement('ul');
  cardBorderZero.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  const columnName = document.createElement('h2');
  columnName.classList.add('card-title', 'h4');
  columnName.textContent = i18nInstance.t(`item.${type}`);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  switch (type) {
    case 'feeds':
      list.prepend(...createFeeds(state));
      break;
    case 'posts':
      list.prepend(...createPosts(state, i18nInstance));
      break;
    default:
      break;
  };
  cardBody.append(list);
  cardBorderZero.append(cardBody);
  return cardBorderZero;
};

const renderError = ({ feedbackString }, state, value, i18nInstance) => {
  if (value === '') {
    return;
  }
  feedbackString.textContent = i18nInstance.t(`errors.${state.error}`);
};

const renderFormStatus = ({ form, feedbackString, urlInput, submitButton }, state, value, i18nInstance) => {
  switch (value) {
    case 'sending':
      submitButton.disable = true;
      urlInput.classList.remove('is-invalid');
      feedbackString.classList.remove('text-danger');
      feedbackString.classList.remove('text-success');
      feedbackString.classList.add('text-warning');
      feedbackString.textContent = i18nInstance.t('sending');
      break;
    case 'addedUrl':
      submitButton.disable = false;
      feedbackString.classList.remove('text-warning');
      feedbackString.classList.add('text-success');
      feedbackString.textContent = i18nInstance.t('addedUrl');
      form.reset();
      urlInput.focus();
      break;
    case 'invalid':
      feedbackString.classList.remove('text-warning');
      feedbackString.classList.add('text-danger');
      urlInput.classList.add('is-invalid');
      form.reset();
      urlInput.focus();
      break;
    default:
      break;
  }
};

const renderFeeds = ({ feeds }, state, i18nInstance) => {
  feeds.innerHTML = '';
  const feedsList = createList('feeds', state, i18nInstance);
  feeds.append(createList('feeds', state, i18nInstance));
};

const renderPosts = ({ posts }, state, i18nInstance) => {
  posts.innerHTML = '';
  const postsList = createList('posts', state, i18nInstance);
  posts.append(postsList);
};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'formStatus':
      renderFormStatus(elements, state, value, i18nInstance);
      break;
    case 'error':
      renderError(elements, state, value, i18nInstance);
      break;
    case 'feeds':
      renderFeeds(elements, state, i18nInstance);
      break;
    case 'posts':
      renderPosts(elements, state, i18nInstance);
      break;
    default:
      throw new Error('Unknown state', path);
  }
};