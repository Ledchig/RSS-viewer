const renderError = ({ feedbackString }, state, value, i18nInstance) => {
  if (value === '') {
    return;
  }
  feedbackString.classList.remove('text-success');
  feedbackString.classList.add('text-danger');
  feedbackString.textContent = i18nInstance.t(`errors.${state.error}`);
};

const handleValidationState = ({ urlInput }, value) => {
  if (value === 'added') {
    urlInput.classList.remove('is-invalid');
    
  } else {
    urlInput.classList.add('is-invalid');
  }
};

const renderLinks = ({ feedbackString, form, urlInput }, state, i18nInstance) => {
  feedbackString.textContent = i18nInstance.t(`${state.formStatus}`);
  feedbackString.classList.remove('text-danger');
  feedbackString.classList.add('text-success');
  form.reset();
  urlInput.focus();
};

export default (elements, state, i18nInstance) => (path, value) => {
  switch (path) {
    case 'formStatus':
      handleValidationState(elements, value);
      break;
    case 'error':
      renderError(elements, state, value, i18nInstance);
      break;
    case 'links':
      renderLinks(elements, state, i18nInstance);
      break;
    default:
      throw new Error('Unknown state', path);
  }
};