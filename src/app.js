import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js'
import resources from './locales/index.js';
import i18next from 'i18next';

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })
  .then(() => {
    const initialState = {
      formStatus: 'filling',
      error: '',
      links: [],
    };
  console.log(i18nInstance.t('addedUrl'));
    const elements = {
      form: document.querySelector('form'),
      urlInput: document.getElementById('url-input'),
      submitButton: document.querySelector('button[type="submit"]'),
      feedbackString: document.querySelector('.feedback'),
    };
    const state = onChange(initialState, render(elements, initialState, i18nInstance));
  
    yup.setLocale({
      mixed: {
        notOneOf: 'dublUrl',
      },
      string: {
        url: 'invalidUrl',
      },
    });
    
    const schema = yup.string()
      .url()
      .notOneOf(state.links);
  
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const input = formData.get('url').trim();
      schema.validate(input)
        .then(() => {
          state.links.push(input);
          state.error = '';
          state.formStatus = 'addedUrl';
        })
        .catch((err) => {
          state.error = err.message;
          state.formStatus = 'invalid';
        });
    });
  });
};