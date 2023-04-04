import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js'

export default () => {

  const elements = {
    form: document.querySelector('form'),
    urlInput: document.getElementById('url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedbackString: document.querySelector('.feedback'),
  };

  const initialState = {
    formStatus: 'filling',
    error: '',
    links: [],
  };

  const state = onChange(initialState, render(elements));

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
        state.formStatus = 'added';
      })
      .catch((err) => {
        state.error = err.message;
        state.formStatus = 'invalid';
      });
  });
};