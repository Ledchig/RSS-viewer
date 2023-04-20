import * as yup from 'yup';
import onChange from 'on-change';
import render from './render.js'
import resources from './locales/index.js';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import parse from './parser.js';

const getData = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return axios.get(proxyUrl);
};

const handleError = (error) => {
  if (axios.isAxiosError(error)) {
    return 'networkError';
  }
  if (error.isParsingError) {
    return 'notRSS';
  }
  return error.message ?? 'unknown error';
};

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
      feeds: [],
      posts: [],
    };
    const elements = {
      form: document.querySelector('form'),
      urlInput: document.getElementById('url-input'),
      submitButton: document.querySelector('button[type="submit"]'),
      feedbackString: document.querySelector('.feedback'),
      posts: document.querySelector('.posts'),
      feeds: document.querySelector('.feeds'),
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
    
    const makeSchema = (addedLinks) =>
      yup.string()
      .url()
      .notOneOf(addedLinks);

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const addedLinks = state.feeds.map((feed) => feed.url);
      const schema = makeSchema(addedLinks);
      const formData = new FormData(e.target);
      const input = formData.get('url').trim();
      schema.validate(input)
        .then(() => {
          state.error = '';
          state.formStatus = 'sending';
          return getData(input);
        })
        .then((response) => {
          const { feed, posts } = parse(response.data.contents, input);
          feed.id = uniqueId();
          posts.forEach((post) => {
            post.id = uniqueId();
            post.feedId = feed.id;
          });
          state.feeds.push(feed);
          state.posts.push(...posts);
          state.formStatus = 'addedUrl';
        })
        .catch((err) => {
          state.error = handleError(err);
          state.formStatus = 'invalid';
        });
    });
  });
};