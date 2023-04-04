const renderError = ({ feedbackString }, value) => {
  if (value === '') {
    return;
  }
  feedbackString.classList.remove('text-success');
  feedbackString.classList.add('text-danger');
  switch (value) {
    case 'invalidUrl':
      feedbackString.textContent = 'Ссылка должна быть валидным URL';
      break;
    case 'dublUrl':
      feedbackString.textContent = 'RSS уже существует';
      break;
    default:
      throw new Error('Unknown error', value);
  }
};

const handleValidationState = ({ urlInput, feedbackString }, value) => {
  if (value === 'added') {
    urlInput.classList.remove('is-invalid');
    
  } else {
    urlInput.classList.add('is-invalid');
  }
};

const renderLinks = ({ feedbackString, form, urlInput }) => {
  feedbackString.textContent = 'RSS успешно загружен';
  feedbackString.classList.remove('text-danger');
  feedbackString.classList.add('text-success');
  form.reset();
  urlInput.focus();
};

export default (elements) => (path, value) => {
  switch (path) {
    case 'formStatus':
      handleValidationState(elements, value);
      break;
    case 'error':
      renderError(elements, value);
      break;
    case 'links':
      renderLinks(elements);
      break;
    default:
      throw new Error('Unknown state', path);
  }
};