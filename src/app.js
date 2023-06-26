import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import resources from './locales/index.js';
import render from './render.js';
import parse from './parser.js';

const getAxiosResponse = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.append('disableCache', 'true');
  proxyUrl.searchParams.append('url', url);
  return axios.get(proxyUrl.toString());
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

const updatePosts = (state) => {
  console.log('updatePosts()');
  const promises = state.feeds.map((feed) => getAxiosResponse(feed.link)
    .then((response) => {
      const { posts } = parse(response.data.contents);
      const postsOfFeed = state.posts.filter(
        ({ feedId }) => feedId === feed.id,
      );
      const linksOfPostsFromState = postsOfFeed.map((post) => post.link);
      const newPosts = posts.filter(
        ({ link }) => !linksOfPostsFromState.includes(link),
      );
      const newPostsWithIds = newPosts.map((post) => (
        { ...post, id: uniqueId(), feedId: feed.id }
      ));
      state.posts.unshift(...newPostsWithIds);
    })
    .catch((err) => console.log(err.message)));
  const msForTimeout = 5000;
  Promise.all(promises).finally(setTimeout(() => updatePosts(state), msForTimeout));
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const initialState = {
        ui: {
          readedPosts: new Set(),
          modalWindow: null,
        },
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
        modalTitle: document.querySelector('.modal-title'),
        modalDescription: document.querySelector('.modal-body'),
        modalLink: document.querySelector('.full-article'),
      };
      const state = onChange(
        initialState,
        render(elements, initialState, i18nInstance),
      );

      yup.setLocale({
        mixed: {
          notOneOf: 'dublUrl',
        },
        string: {
          url: 'invalidUrl',
        },
      });

      const makeSchema = (addedLinks) => yup.string().url().notOneOf(addedLinks);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('event');

        state.formStatus = 'sending';
        const addedLinks = state.feeds.map((feed) => feed.link);
        const schema = makeSchema(addedLinks);
        const formData = new FormData(e.target);
        const input = formData.get('url').trim();
        schema
          .validate(input.trim())
          .then(() => {
            state.error = '';
            return getAxiosResponse(input);
          })
          .then((response) => {
            const { feed, posts } = parse(response.data.contents);
            feed.link = input;
            feed.id = uniqueId();
            const postsWithIds = posts.map((post) => (
              { ...post, id: uniqueId(), feedId: feed.id }
            ));
            state.feeds.push(feed);
            state.posts.push(...postsWithIds);
            state.formStatus = 'addedUrl';
          })
          .catch((err) => {
            state.error = handleError(err);
            state.formStatus = 'invalid';
          });
      });
      elements.posts.addEventListener('click', (e) => {
        const targetPostId = e.target.dataset.id;
        state.ui.readedPosts.add(targetPostId);
        state.ui.modalWindow = targetPostId;
      });
      updatePosts(state);
    });
};
